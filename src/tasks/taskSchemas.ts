import { z } from 'zod'
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

export const partialTaskSchema = taskSchema.partial()
export type PartialTask = z.infer<typeof partialTaskSchema>
