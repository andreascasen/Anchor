import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { z } from 'zod'
import { dbClient } from '../../dataSources/sqlite'
import { recurrencePatternSchema } from './util/recurrence'

export const taskSchema = z.object({
	due: z.iso.datetime({ precision: -1 }).optional(),
	title: z.string(),
	description: z.string().optional(),
	priority: z.enum(['low', 'medium', 'high']).default('low'),
	status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
	recurrence: recurrencePatternSchema.optional(),
})

export type Task = z.infer<typeof taskSchema>

export const tasksTable = sqliteTable('tasks', {
	id: text('id').primaryKey(),
	due: text('due'),
	title: text('title').notNull(),
	description: text('description'),
	priority: text('priority').notNull().default('low'),
	status: text('status').notNull().default('pending'),
	recurrence: text('recurrence'),
})

export const createTask = async ({
	title,
	description,
	priority,
	status,
	recurrence,
}: Task) => {
	const result = await dbClient
		.insert(tasksTable)
		.values({
			id: crypto.randomUUID(),
			title,
			description,
			priority,
			status,
			recurrence: JSON.stringify(recurrence),
		})
		.returning({ id: tasksTable.id })
	return result[0]
}
