import { Database } from 'bun:sqlite'
import fs from 'node:fs/promises'
import path from 'node:path'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { env } from '../env'

const DB_PATH = path.join(env.DB_DIRECTORY, 'brain.db')

await fs.mkdir(env.DB_DIRECTORY, { recursive: true })
const sqlite = new Database(DB_PATH)
export const dbClient = drizzle({ client: sqlite })

migrate(dbClient, { migrationsFolder: './migrations' })

export const notes = sqliteTable('notes', {
	filePath: text('file_path').primaryKey(),
	title: text('title').notNull(),
	tags: text('tags', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
	frontmatter: text('frontmatter', { mode: 'json' })
		.$type<Record<string, unknown>>()
		.default(sql`'{}'`),
	content: text('content').notNull(),
	modifiedAt: text('modified_at').notNull(),
	indexedAt: text('indexed_at').notNull(),
})
