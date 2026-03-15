import { env } from './env.ts'

import app from './server.ts'

console.log(`[anchor] Starting on port ${env.PORT}`)

export default {
	port: env.PORT,
	fetch: app.fetch,
}
