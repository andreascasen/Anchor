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
