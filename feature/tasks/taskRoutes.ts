import { Hono } from 'hono'
import { handleCreateTask } from './taskHandlers'

export const tasksRouter = new Hono()

tasksRouter.get('/', async (ctx) => {
	return ctx.json({ tasks: [] })
})

tasksRouter.post('/', async (ctx) => {
	const params = await ctx.req.json()

	await handleCreateTask(params)

	return ctx.json({ message: 'Task created' })
})
