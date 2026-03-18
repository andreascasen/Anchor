import { defineConfig } from 'drizzle-kit'
import { env } from './env'
import path from 'node:path'

export default defineConfig({
	dialect: 'sqlite',
	schema: './dataSources/sqlite.ts',
	out: './migrations',
	dbCredentials: {
		url: path.join(env.DB_DIRECTORY, 'brain.db'),
	},
})
