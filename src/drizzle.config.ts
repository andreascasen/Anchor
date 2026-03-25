import { defineConfig } from 'drizzle-kit'

import path from 'node:path'
import { env } from './env'

export default defineConfig({
	dialect: 'sqlite',
	schema: './dataSources/schema.ts',
	out: './migrations',
	dbCredentials: {
		url: path.join(env.DB_DIRECTORY, 'brain.db'),
	},
})
