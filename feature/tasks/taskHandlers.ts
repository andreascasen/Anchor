import { eq, not } from 'drizzle-orm'
import { dbClient } from '../../dataSources/sqlite'
import { ValidationError } from '../../lib/errors'
import { createTask, taskSchema, tasksTable } from './taskDb'

export const handleCreateTask = async (params: unknown) => {
	const { success, data: newTask } = taskSchema.safeParse(params)

	if (!success) {
		throw new ValidationError(`Invalid task data`)
	}

	await createTask(newTask)
}

export const handleGetTasks = async () => {
	const tasks = await dbClient
		.select()
		.from(tasksTable)
		.where(not(eq(tasksTable.status, 'completed')))

	return tasks
}
