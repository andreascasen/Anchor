import { Database } from 'bun:sqlite'
import fs from 'node:fs/promises'
import path from 'node:path'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'

import { env } from '../env'

const DB_PATH = path.join(env.DB_DIRECTORY, 'brain.db')

await fs.mkdir(env.DB_DIRECTORY, { recursive: true })
const sqlite = new Database(DB_PATH)
export const dbClient = drizzle({ client: sqlite })

migrate(dbClient, {
	migrationsFolder: path.join(import.meta.dir, '../migrations'),
})

export { notes, tasksTable } from './schema'
