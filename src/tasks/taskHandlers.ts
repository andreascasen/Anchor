import { eq, inArray, not } from 'drizzle-orm'
import type z from 'zod'
import { dbClient, tasksTable } from '../dataSources/sqlite'
import { NotFoundError, ValidationError } from '../lib/errors'
import { partialTaskSchema, taskSchema } from './taskSchemas'

export const createTask = async (params: z.infer<typeof taskSchema>) => {
	const { recurrence, ...taskData } = params

	const [newTask] = await dbClient
		.insert(tasksTable)
		.values({
			id: crypto.randomUUID(),
			...taskData,
			recurrence: JSON.stringify(recurrence),
		})
		.returning()

	return newTask
}

export const getTasks = async () => {
	const tasks = await dbClient
		.select()
		.from(tasksTable)
		.where(not(eq(tasksTable.status, 'completed')))

	return tasks
}

export const updateTask = async (
	taskId: string,
	params: z.infer<typeof partialTaskSchema>,
) => {
	const { recurrence, ...taskData } = params

	const [updatedTask] = await dbClient
		.update(tasksTable)
		.set({
			...taskData,
			...(recurrence !== undefined && {
				recurrence: JSON.stringify(recurrence),
			}),
		})
		.where(eq(tasksTable.id, taskId))
		.returning()

	if (!updatedTask) {
		throw new NotFoundError(`Task ${taskId} not found`)
	}

	return updatedTask
}

export const deleteTasks = async (taskIds: string[]) => {
	if (taskIds.length === 0) {
		throw new ValidationError('No task IDs provided for deletion')
	}

	const deletedTaskIds = await dbClient
		.delete(tasksTable)
		.where(inArray(tasksTable.id, taskIds))
		.returning({ id: tasksTable.id })

	return deletedTaskIds
}
