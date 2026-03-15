import { z } from 'zod'

const envSchema = z.object({
	PORT: z.coerce.number().default(3000),
	API_KEY: z.string(),
})

function parseEnv() {
	const { success, data, error } = envSchema.safeParse(process.env)
	if (!success) {
		const errors = error.issues
			.map((i) => `  ${i.path.join('.')}: ${i.message}`)
			.join('\n')
		throw new Error(`Invalid environment variables:\n${errors}`)
	}
	return data
}

export const env = parseEnv()

export type Env = z.infer<typeof envSchema>
