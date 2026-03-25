import { ValidationError } from '../../lib/errors'
import { createTask, taskSchema } from './taskDb'

export const handleCreateTask = async (params: unknown) => {
	const { success, data: newTask } = taskSchema.safeParse(params)

	if (!success) {
		throw new ValidationError(`Invalid task data`)
	}

	await createTask(newTask)
}
