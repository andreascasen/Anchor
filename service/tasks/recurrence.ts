import { z } from 'zod'

const WEEKDAY = {
	sun: 0,
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6,
} as const

const periodMultiplierSchema = z.number().int().positive().default(1)
const recurrenceTypes = z.enum(['interval', 'weekly', 'monthly'])

const intervalSchema = z.object({
	type: z.literal('interval'),
	multiplier: periodMultiplierSchema,
	unit: z.enum(['d', 'w', 'm']),
})
const weeklyPeriodicSchema = z.object({
	type: z.literal(['weekly']),
	weekday: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
	multiplier: periodMultiplierSchema,
})
const monthlyPeriodicSchema = z.object({
	type: z.literal(['monthly']),
	dateOfTheMonth: z.number().int().positive().default(1),
	multiplier: periodMultiplierSchema,
})
export const recurrencePatternSchema = z.discriminatedUnion('type', [
	intervalSchema,
	weeklyPeriodicSchema,
	monthlyPeriodicSchema,
])

export type RecurrencePattern = z.infer<typeof recurrencePatternSchema>

export function computeNextDueDate(
	recurrenceParam: RecurrencePattern,
	completedAt: Date,
): Date {
	const { success, data: recurrence } =
		recurrencePatternSchema.safeParse(recurrenceParam)

	if (!success) {
		throw new Error(`Invalid recurrence param: ${recurrenceParam}`)
	}

	if (recurrence.type === 'interval') {
		const next = new Date(completedAt)
		if (recurrence.unit === 'd')
			next.setDate(next.getDate() + recurrence.multiplier)
		else if (recurrence.unit === 'w')
			next.setDate(next.getDate() + recurrence.multiplier * 7)
		else if (recurrence.unit === 'm')
			next.setMonth(next.getMonth() + recurrence.multiplier)
		return next
	}

	if (recurrence.type === 'weekly') {
		const targetDay = WEEKDAY[recurrence.weekday]
		const next = new Date(completedAt)
		next.setHours(0, 0, 0, 0)
		next.setDate(next.getDate() + 1)
		while (next.getDay() !== targetDay) next.setDate(next.getDate() + 1)
		if (recurrence.multiplier > 1)
			next.setDate(next.getDate() + (recurrence.multiplier - 1) * 7)
		return next
	}

	if (recurrence.type === 'monthly') {
		const { dateOfTheMonth, multiplier } = recurrence
	}

	// monthday
	const { targetDay } = recurrence
	const next = new Date(completedAt)
	next.setHours(0, 0, 0, 0)

	const daysInCurrentMonth = new Date(
		next.getFullYear(),
		next.getMonth() + 1,
		0,
	).getDate()
	const currentMonthHasTargetDay = daysInCurrentMonth >= targetDay

	if (currentMonthHasTargetDay) next.setDate(targetDay)

	if (!currentMonthHasTargetDay || next <= completedAt) {
		next.setDate(1)
		next.setMonth(next.getMonth() + 1)
		const daysInNextMonth = new Date(
			next.getFullYear(),
			next.getMonth() + 1,
			0,
		).getDate()
		next.setDate(Math.min(targetDay, daysInNextMonth))
	}

	return next
}
export function computeNextDueDate(
	recurrence: RecurrencePattern,
	completedAt: Date,
): Date {
	if (recurrence.type === 'interval') {
		const next = new Date(completedAt)
		if (recurrence.unit === 'd') next.setDate(next.getDate() + recurrence.n)
		else if (recurrence.unit === 'w')
			next.setDate(next.getDate() + recurrence.n * 7)
		else if (recurrence.unit === 'm')
			next.setMonth(next.getMonth() + recurrence.n)
		return next
	}

	if (recurrence.type === 'weekday') {
		const targetDay = WEEKDAY[recurrence.day]
		const next = new Date(completedAt)
		next.setHours(0, 0, 0, 0)
		next.setDate(next.getDate() + 1)
		while (next.getDay() !== targetDay) next.setDate(next.getDate() + 1)
		if (recurrence.multiplier > 1)
			next.setDate(next.getDate() + (recurrence.multiplier - 1) * 7)
		return next
	}

	// monthday
	const { targetDay } = recurrence
	const next = new Date(completedAt)
	next.setHours(0, 0, 0, 0)

	const daysInCurrentMonth = new Date(
		next.getFullYear(),
		next.getMonth() + 1,
		0,
	).getDate()
	const currentMonthHasTargetDay = daysInCurrentMonth >= targetDay

	if (currentMonthHasTargetDay) next.setDate(targetDay)

	if (!currentMonthHasTargetDay || next <= completedAt) {
		next.setDate(1)
		next.setMonth(next.getMonth() + 1)
		const daysInNextMonth = new Date(
			next.getFullYear(),
			next.getMonth() + 1,
			0,
		).getDate()
		next.setDate(Math.min(targetDay, daysInNextMonth))
	}

	return next
}
