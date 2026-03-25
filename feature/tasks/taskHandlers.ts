import { eq, not } from 'drizzle-orm'
import { dbClient } from '../../dataSources/sqlite'
import { ValidationError } from '../../lib/errors'
import { taskSchema, tasksTable } from './taskDb'

export const createTask = async (params: unknown) => {
	const { success, data: taskPayload } = taskSchema.safeParse(params)

	if (!success) {
		throw new ValidationError(`Invalid task data`)
	}

	const { recurrence, ...taskData } = taskPayload

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

export const deleteTask = async (taskId: string) => {
	const deletedTaskId = await dbClient
		.delete(tasksTable)
		.where(eq(tasksTable.id, taskId))
		.returning()
}
