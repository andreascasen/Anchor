import { env } from './env'
import app from './server'

export default {
	port: env.PORT,
	fetch: app.fetch,
}
