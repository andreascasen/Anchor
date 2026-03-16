import { Database } from 'bun:sqlite'
import fs from 'node:fs/promises'
import path from 'node:path'
import { env } from '../env'

const DB_PATH = path.join(env.DB_DIRECTORY, 'brain.db')

let db: Database

export const initDb = async () => {
	await fs.mkdir(env.DB_DIRECTORY, { recursive: true })

	db = new Database(DB_PATH)

	db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id      TEXT PRIMARY KEY
            title   TEXT NOT NULL
            tags    TEXT NOT NULL DEFAILT '[]'
            due     TEXT
            description:    TEXT
        )    
    `)
}

const getDb = () => {
	if (!db) throw new Error('Database not initialized - Call initDb()')

	return db
}
