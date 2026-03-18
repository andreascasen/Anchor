import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { eq, like, or } from 'drizzle-orm'
import { env } from '../env'
import { db, notes } from './sqlite'

export type NoteMeta = typeof notes.$inferSelect

export interface Note extends NoteMeta {}

function extractTags(
	frontmatter: Record<string, unknown>,
	body: string,
): string[] {
	const fmTags = frontmatter.tags
	const fromFm: string[] = Array.isArray(fmTags) ? (fmTags as string[]) : []
	const fromBody = [...body.matchAll(/#([\w/-]+)/g)].map((m) => m[1])
	return [...new Set([...fromFm, ...fromBody])]
}

async function collectMarkdownFiles(dir: string): Promise<string[]> {
	const entries = await fs.readdir(dir, { withFileTypes: true })
	const files: string[] = []
	for (const entry of entries) {
		if (entry.name.startsWith('.')) continue
		const full = path.join(dir, entry.name)
		if (entry.isDirectory()) {
			files.push(...(await collectMarkdownFiles(full)))
		} else if (entry.name.endsWith('.md')) {
			files.push(full)
		}
	}
	return files
}

// -- Git sync --

function pullVault(): { success: boolean; output: string } {
	const result = Bun.spawnSync(['/bin/sh', '-c', 'git pull'], {
		cwd: env.OBSIDIAN_VAULT_PATH,
		stdout: 'pipe',
		stderr: 'pipe',
		env: process.env,
	})
	const output = [
		result.stdout ? new TextDecoder().decode(result.stdout) : '',
		result.stderr ? new TextDecoder().decode(result.stderr) : '',
	]
		.join('\n')
		.trim()
	return { success: result.exitCode === 0, output }
}

const removeStaleNotesFromDb = async (vaultPaths: Set<string>) => {
	const allIndexedNotes = await db
		.select({ filePath: notes.filePath })
		.from(notes)
	const staleNotesInDb = allIndexedNotes.filter(
		(n) => !vaultPaths.has(n.filePath),
	)

	await Promise.all(
		staleNotesInDb.map(async (staleNote) => {
			await db.delete(notes).where(eq(notes.filePath, staleNote.filePath))
		}),
	)

	return staleNotesInDb.length
}

const indexNoteChangesInDb = async (vaultPaths: Set<string>) => {
	const now = new Date().toISOString()

	return await Promise.all(
		[...vaultPaths].map(async (relativePath) => {
			const fileInVault = path.join(env.OBSIDIAN_VAULT_PATH, relativePath)

			const stat = await fs.stat(fileInVault)
			const modifiedAt = stat.mtime.toISOString()

			const existing = await db
				.select({ indexedAt: notes.indexedAt, modifiedAt: notes.modifiedAt })
				.from(notes)
				.where(eq(notes.filePath, relativePath))
				.limit(1)

			const fileHasChanged = existing[0]?.modifiedAt !== modifiedAt

			if (!fileHasChanged) return { indexed: false }

			const raw = await fs.readFile(fileInVault, 'utf8')
			const { data: frontmatter, content: body } = matter(raw)
			const title =
				(frontmatter.title as string) || path.basename(fileInVault, '.md')
			const tags = extractTags(frontmatter, body)

			await db
				.insert(notes)
				.values({
					filePath: relativePath,
					title,
					tags,
					frontmatter,
					content: body,
					modifiedAt,
					indexedAt: now,
				})
				.onConflictDoUpdate({
					target: notes.filePath,
					set: {
						title,
						tags,
						frontmatter,
						content: body,
						modifiedAt,
						indexedAt: now,
					},
				})

			return { indexed: true }
		}),
	)
}

export async function syncAndIndex(): Promise<{
	pulled: string
	indexed: number
	removed: number
}> {
	const { output: pulled } = pullVault()

	const filesFromVault = await collectMarkdownFiles(env.OBSIDIAN_VAULT_PATH)

	const vaultPaths = new Set(
		filesFromVault.map((fileInVault) =>
			path.relative(env.OBSIDIAN_VAULT_PATH, fileInVault),
		),
	)

	const results = await indexNoteChangesInDb(vaultPaths)

	const indexed = results.filter((r) => r.indexed).length

	const staleAndRemovedCount = await removeStaleNotesFromDb(vaultPaths)

	return { pulled, indexed, removed: staleAndRemovedCount }
}

// -- Queries (all hit SQLite) --

export async function listNotes(): Promise<NoteMeta[]> {
	return db.select().from(notes)
}

export async function getNote(filePath: string): Promise<Note | null> {
	const rows = await db
		.select()
		.from(notes)
		.where(eq(notes.filePath, filePath))
		.limit(1)
	return rows[0] ?? null
}

export async function searchNotes(query: string): Promise<Note[]> {
	const pattern = `%${query}%`
	return db
		.select()
		.from(notes)
		.where(
			or(
				like(notes.title, pattern),
				like(notes.content, pattern),
				like(notes.tags, pattern),
			),
		)
}
