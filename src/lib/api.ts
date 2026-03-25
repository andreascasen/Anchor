import type { Context } from 'hono'
import type { ZodType } from 'zod'
import { CustomError, ValidationError } from './errors'

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

export const validateRequestBody = async <T>(
	ctx: Context,
	schema: ZodType<T>,
): Promise<T> => {
	const body = await ctx.req.json()
	const { success, data, error } = schema.safeParse(body)

	if (!success) {
		throw new ValidationError('Invalid request body')
	}

	return data
}
