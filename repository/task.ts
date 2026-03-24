import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { z } from 'zod'
import { dbClient } from '../dataSources/sqlite'

const WEEKDAY = {
	sun: 0,
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6,
} as const

const periodMultiplierSchema = z.number().int().positive().default(1)

const intervalSchema = z.object({
	type: z.literal('interval'),
	multiplier: periodMultiplierSchema,
	unit: z.enum(['d', 'w', 'm']),
})
const weeklyPeriodicSchema = z.object({
	type: z.literal(['weekly']),
	weekday: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
	multiplier: periodMultiplierSchema,
})
const monthlyPeriodicSchema = z.object({
	type: z.literal(['monthly']),
	date: z.number().int().positive().default(1),
	multiplier: periodMultiplierSchema,
})
const recurrencePatternSchema = z.discriminatedUnion('type', [
	intervalSchema,
	weeklyPeriodicSchema,
	monthlyPeriodicSchema,
])

type RecurrencePattern = z.infer<typeof recurrencePatternSchema>

const taskSchema = z.object({
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

export const createTask = async () => {
	const result = await dbClient
		.insert(tasksTable)
		.values({
			id: crypto.randomUUID(),
			title: 'New Task',
		})
		.returning({ id: tasksTable.id })
	return result[0]
}
