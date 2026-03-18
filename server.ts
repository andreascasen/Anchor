import { Hono } from 'hono'
import { env } from './env'
import { tasksRouter } from './api/tasks'
import { syncAndIndex } from './dataSources/obsidian'

const app = new Hono()

// app.use('/api/*', async (ctx, next) => {
// 	const key = ctx.req.header('x-api-key')
// 	if (key !== env.API_KEY) {
// 		return ctx.json({ error: 'Unauthorized' }, 401)
// 	}
// 	return next()
// })

app.route('/api/tasks', tasksRouter)

app.get('/api/sync', async (ctx) => {
	await syncAndIndex()
	return ctx.json({ message: 'Sync done' })
})

app.get('/health', (ctx) =>
	ctx.json({ ok: true, ts: new Date().toISOString() }),
)

app.get('/*', async (ctx) => {
	return ctx.json({ error: 'Route not found' }, 404)
})

export default app
