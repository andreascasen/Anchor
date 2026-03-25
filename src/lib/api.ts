import type { Context } from 'hono'
import { CustomError } from './errors'

export const handlerWrapper = async (
	ctx: Context,
	handler: (ctx: Context) => Promise<unknown>,
) => {
	try {
		return await handler(ctx)
	} catch (error: unknown) {
		if (error instanceof CustomError) {
			ctx.status(error.statusCode)
			return ctx.json({ error: error.message })
		}

		console.error('Unexpected error:', error)
		ctx.status(500)
		return ctx.json({ error: 'Internal Server Error' })
	}
}
