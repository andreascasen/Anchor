import { Hono } from 'hono'
import { handleCreateTask } from './taskHandlers'
import { handleApiError } from '../../lib/errors'

export const tasksRouter = new Hono()

tasksRouter.get('/', async (ctx) => {
	return ctx.json({ tasks: [] })
})

tasksRouter.post('/', async (ctx) => {
	try {
		const params = await ctx.req.json()

		await handleCreateTask(params)

		return ctx.json({ message: 'Task created' })
	} catch (error: unknown) {
		return handleApiError(ctx, error)
	}
})
