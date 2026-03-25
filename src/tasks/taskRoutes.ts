import { Hono } from 'hono'
import z from 'zod'
import { validateRequestBody } from '../lib/api'
import { handleApiError } from '../lib/errors'
import { createTask, deleteTasks, getTasks, updateTask } from './taskHandlers'
import { partialTaskSchema, taskSchema } from './taskSchemas'

export const tasksRouter = new Hono()

tasksRouter.get('/', async (ctx) => {
	try {
		const tasks = await getTasks()
		ctx.status(200)
		return ctx.json({ tasks })
	} catch (error: unknown) {
		return handleApiError(ctx, error)
	}
})

tasksRouter.post('/', async (ctx) => {
	try {
		const params = await validateRequestBody(ctx, taskSchema)

		await createTask(params)

		ctx.status(201)
		return ctx.json({ message: 'Task created' })
	} catch (error: unknown) {
		return handleApiError(ctx, error)
	}
})

tasksRouter.patch('/:id', async (ctx) => {
	try {
		const taskId = ctx.req.param('id')
		const params = await validateRequestBody(ctx, partialTaskSchema)

		const updatedTask = await updateTask(taskId, params)

		ctx.status(200)
		return ctx.json({ task: updatedTask })
	} catch (error: unknown) {
		return handleApiError(ctx, error)
	}
})

tasksRouter.delete('/', async (ctx) => {
	try {
		const bodyInputSchema = z.object({
			taskIds: z.array(z.string()),
		})
		const { taskIds } = await validateRequestBody(ctx, bodyInputSchema)

		const deletedTaskIds = await deleteTasks(taskIds)

		ctx.status(204)
		return ctx.json({ message: 'Tasks deleted', deletedTaskIds })
	} catch (error: unknown) {
		return handleApiError(ctx, error)
	}
})
