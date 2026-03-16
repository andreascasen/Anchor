import { Database } from 'bun:sqlite'
import fs from 'node:fs/promises'
import path from 'node:path'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

import { env } from '../env'

const DB_PATH = path.join(env.DB_DIRECTORY, 'brain.db')

await fs.mkdir(env.DB_DIRECTORY, { recursive: true })
const sqlite = new Database(DB_PATH)
export const db = drizzle({ client: sqlite })

const tasks = sqliteTable('tasks', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	tags: text('tags', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
	description: text('description'),
})
