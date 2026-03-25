import type { Context } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'

export class CustomError extends Error {
	statusCode: StatusCode

	constructor(message: string, statusCode: StatusCode) {
		super(message)
		this.name = 'CustomError'
		this.statusCode = statusCode
	}
}

export class ValidationError extends CustomError {
	constructor(message: string) {
		super(message, 400)
		this.name = 'ValidationError'
	}
}

export class AuthError extends CustomError {
	constructor(message: string) {
		super(message, 401)
		this.name = 'AuthError'
	}
}

export const handleApiError = (ctx: Context, error: unknown) => {
	if (error instanceof CustomError) {
		ctx.status(error.statusCode)
		return ctx.json({ error: error.message })
	}

	console.error('Unexpected error:', error)
	ctx.status(500)
	return ctx.json({ error: 'Internal Server Error' })
}
