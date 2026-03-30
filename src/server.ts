import { Hono } from 'hono'
import { syncAndIndex } from './dataSources/obsidian'
import { env } from './env'
import { tasksRouter } from './tasks/taskRoutes'

const app = new Hono()

app.use('/*', async (ctx, next) => {
	const key = ctx.req.header('x-api-key')
	if (key !== env.API_SECRET) {
		return ctx.json({ error: 'Unauthorized' }, 401)
	}
	return next()
})

app.route('/api/tasks', tasksRouter)

app.get('/api/sync', async (ctx) => {
	await syncAndIndex()
	return ctx.json({ message: 'Sync done' })
})

app.get('/health', (ctx) =>
	ctx.json({ ok: true, ts: new Date().toISOString() }),
)

app.get('/*', async (ctx) => {
	return ctx.json({ error: 'Path not found', targetPath: ctx.req.path }, 404)
})

export default app
