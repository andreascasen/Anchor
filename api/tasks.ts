import { Hono } from 'hono'

export const tasksRouter = new Hono()

tasksRouter.get('/', async (ctx) => {
	return ctx.json({ tasks: [] })
})
