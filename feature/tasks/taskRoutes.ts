import { Hono } from 'hono'
import { createTask, deleteTasks, getTasks } from './taskHandlers'
import { handleApiError } from '../../lib/errors'

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
		const params = await ctx.req.json()

		await createTask(params)

		ctx.status(201)
		return ctx.json({ message: 'Task created' })
	} catch (error: unknown) {
		return handleApiError(ctx, error)
	}
})

tasksRouter.delete('/', async (ctx) => {
	try {
		const params = await ctx.req.json()

		const deletedTaskIds = await deleteTasks(params.taskIds)

		ctx.status(204)
		return ctx.json({ message: 'Tasks deleted', deletedTaskIds })
	} catch (error: unknown) {
		return handleApiError(ctx, error)
	}
})
