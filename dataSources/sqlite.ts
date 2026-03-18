import { Database } from 'bun:sqlite'
import fs from 'node:fs/promises'
import path from 'node:path'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { env } from '../env'

const DB_PATH = path.join(env.DB_DIRECTORY, 'brain.db')

await fs.mkdir(env.DB_DIRECTORY, { recursive: true })
const sqlite = new Database(DB_PATH)
export const db = drizzle({ client: sqlite })

export const tasks = sqliteTable('tasks', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	tags: text('tags', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
	description: text('description'),
})

export const notes = sqliteTable('notes', {
	filePath: text('file_path').primaryKey(),
	title: text('title').notNull(),
	tags: text('tags', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
	frontmatter: text('frontmatter', { mode: 'json' }).$type<Record<string, unknown>>().default(sql`'{}'`),
	content: text('content').notNull(),
	modifiedAt: text('modified_at').notNull(),
	indexedAt: text('indexed_at').notNull(),
})

// Ensure tables exist
sqlite.run(`
	CREATE TABLE IF NOT EXISTS tasks (
		id TEXT PRIMARY KEY,
		title TEXT NOT NULL,
		tags TEXT DEFAULT '[]',
		description TEXT
	)
`)

sqlite.run(`
	CREATE TABLE IF NOT EXISTS notes (
		file_path TEXT PRIMARY KEY,
		title TEXT NOT NULL,
		tags TEXT DEFAULT '[]',
		frontmatter TEXT DEFAULT '{}',
		content TEXT NOT NULL,
		modified_at TEXT NOT NULL,
		indexed_at TEXT NOT NULL
	)
`)
