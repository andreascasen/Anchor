import { Hono } from 'hono'
import { handleCreateTask, handleGetTasks } from './taskHandlers'
import { handleApiError } from '../../lib/errors'

export const tasksRouter = new Hono()

tasksRouter.get('/', async (ctx) => {
	try {
		const tasks = await handleGetTasks()
		ctx.status(200)
		return ctx.json({ tasks })
	} catch (error: unknown) {
		return handleApiError(ctx, error)
	}
})

tasksRouter.post('/', async (ctx) => {
	try {
		const params = await ctx.req.json()

		await handleCreateTask(params)

		ctx.status(201)
		return ctx.json({ message: 'Task created' })
	} catch (error: unknown) {
		return handleApiError(ctx, error)
	}
})
