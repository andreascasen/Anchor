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

const safeMonthDate = (year: number, month: number, day: number): Date => {
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	return new Date(year, month, Math.min(day, daysInMonth))
}

export function computeNextDueDate(
	recurrenceParam: RecurrencePattern,
	completedAt: Date,
	due: Date | undefined,
): Date {
	const { success, data: recurrence } =
		recurrencePatternSchema.safeParse(recurrenceParam)

	if (!success) {
		throw new Error(`Invalid recurrence param: ${recurrenceParam}`)
	}

	let nextDueDate: Date = new Date(completedAt)

	if (recurrence.type === 'interval') {
		nextDueDate = new Date(completedAt)
		if (recurrence.unit === 'd')
			nextDueDate.setDate(nextDueDate.getDate() + recurrence.multiplier)
		else if (recurrence.unit === 'w')
			nextDueDate.setDate(nextDueDate.getDate() + recurrence.multiplier * 7)
		else if (recurrence.unit === 'm')
			nextDueDate.setMonth(nextDueDate.getMonth() + recurrence.multiplier)
	}

	if (recurrence.type === 'weekly') {
		const targetDay = WEEKDAY[recurrence.weekday]

		if (due && completedAt < due) {
			// Completed early: advance from the due date by a full interval
			nextDueDate = new Date(due)
			nextDueDate.setHours(0, 0, 0, 0)
			nextDueDate.setDate(nextDueDate.getDate() + recurrence.multiplier * 7)
		} else {
			// Completed on time or overdue: find the next target weekday after completion
			nextDueDate = new Date(completedAt)
			nextDueDate.setHours(0, 0, 0, 0)
			nextDueDate.setDate(nextDueDate.getDate() + 1)
			while (nextDueDate.getDay() !== targetDay)
				nextDueDate.setDate(nextDueDate.getDate() + 1)
			if (recurrence.multiplier > 1)
				nextDueDate.setDate(
					nextDueDate.getDate() + (recurrence.multiplier - 1) * 7,
				)
		}
	}

	if (recurrence.type === 'monthly') {
		const { dateOfTheMonth, multiplier } = recurrence
		const baseDate = due ?? completedAt
		nextDueDate = safeMonthDate(
			baseDate.getFullYear(),
			baseDate.getMonth() + multiplier,
			dateOfTheMonth,
		)
	}

	return nextDueDate
}
