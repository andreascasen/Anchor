import { sql } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

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

export const tasksTable = sqliteTable('tasks', {
	id: text('id').primaryKey(),
	due: text('due'),
	title: text('title').notNull(),
	description: text('description'),
	priority: text('priority').notNull().default('low'),
	status: text('status').notNull().default('pending'),
	recurrence: text('recurrence'),
})
