import { describe, expect, test } from 'bun:test'
import { computeNextDueDate } from './recurrence'

describe('computeNextDueDate', () => {
	describe('interval', () => {
		test('adds days', () => {
			const completed = new Date(2024, 0, 10) // Jan 10
			const result = computeNextDueDate(
				{ type: 'interval', unit: 'd', multiplier: 3 },
				completed,
				undefined,
			)
			expect(result).toEqual(new Date(2024, 0, 13)) // Jan 13
		})

		test('adds weeks', () => {
			const completed = new Date(2024, 0, 10) // Jan 10
			const result = computeNextDueDate(
				{ type: 'interval', unit: 'w', multiplier: 2 },
				completed,
				undefined,
			)
			expect(result).toEqual(new Date(2024, 0, 24)) // Jan 24 (+14 days)
		})

		test('adds months', () => {
			const completed = new Date(2024, 0, 10) // Jan 10
			const result = computeNextDueDate(
				{ type: 'interval', unit: 'm', multiplier: 2 },
				completed,
				undefined,
			)
			expect(result).toEqual(new Date(2024, 2, 10)) // Mar 10
		})

		test('multiplier of 1 adds a single unit', () => {
			const completed = new Date(2024, 0, 10) // Jan 10
			const result = computeNextDueDate(
				{ type: 'interval', unit: 'd', multiplier: 1 },
				completed,
				undefined,
			)
			expect(result).toEqual(new Date(2024, 0, 11)) // Jan 11
		})
	})

	describe('weekly', () => {
		// Jan 1 2024 is a Monday

		describe('completed early (before due date)', () => {
			test('advances from due date by one week', () => {
				const due = new Date(2024, 0, 10) // Wednesday Jan 10
				const completed = new Date(2024, 0, 8) // Monday Jan 8 (early)
				const result = computeNextDueDate(
					{ type: 'weekly', weekday: 'wed', multiplier: 1 },
					completed,
					due,
				)
				expect(result).toEqual(new Date(2024, 0, 17)) // Wednesday Jan 17
			})

			test('advances from due date by multiplier weeks', () => {
				const due = new Date(2024, 0, 10) // Wednesday Jan 10
				const completed = new Date(2024, 0, 8) // Monday Jan 8 (early)
				const result = computeNextDueDate(
					{ type: 'weekly', weekday: 'wed', multiplier: 2 },
					completed,
					due,
				)
				expect(result).toEqual(new Date(2024, 0, 24)) // Wednesday Jan 24
			})
		})

		describe('completed on time or overdue (no due date, or completedAt >= due)', () => {
			test('picks the next target weekday when no due date is provided', () => {
				const completed = new Date(2024, 0, 8) // Monday Jan 8
				const result = computeNextDueDate(
					{ type: 'weekly', weekday: 'wed', multiplier: 1 },
					completed,
					undefined,
				)
				expect(result).toEqual(new Date(2024, 0, 10)) // Wednesday Jan 10
			})

			test('picks the next occurrence when target day has already passed', () => {
				const completed = new Date(2024, 0, 12) // Friday Jan 12
				const result = computeNextDueDate(
					{ type: 'weekly', weekday: 'wed', multiplier: 1 },
					completed,
					undefined,
				)
				expect(result).toEqual(new Date(2024, 0, 17)) // Wednesday Jan 17
			})

			test('completed on the due date picks the next week', () => {
				const due = new Date(2024, 0, 10) // Wednesday Jan 10
				const completed = new Date(2024, 0, 10)
				const result = computeNextDueDate(
					{ type: 'weekly', weekday: 'wed', multiplier: 1 },
					completed,
					due,
				)
				expect(result).toEqual(new Date(2024, 0, 17)) // Wednesday Jan 17
			})

			test('overdue — picks the next target weekday after completion', () => {
				const due = new Date(2024, 0, 3) // Wednesday Jan 3 (last week)
				const completed = new Date(2024, 0, 8) // Monday Jan 8 (overdue)
				const result = computeNextDueDate(
					{ type: 'weekly', weekday: 'wed', multiplier: 1 },
					completed,
					due,
				)
				expect(result).toEqual(new Date(2024, 0, 10)) // Wednesday Jan 10
			})

			test('multiplier skips additional weeks from next occurrence', () => {
				const completed = new Date(2024, 0, 8) // Monday Jan 8
				const result = computeNextDueDate(
					{ type: 'weekly', weekday: 'wed', multiplier: 2 },
					completed,
					undefined,
				)
				expect(result).toEqual(new Date(2024, 0, 17)) // Wednesday Jan 17 (Jan 10 + 7)
			})

			test('wraps around into the next month', () => {
				const completed = new Date(2024, 0, 26) // Friday Jan 26
				const result = computeNextDueDate(
					{ type: 'weekly', weekday: 'mon', multiplier: 1 },
					completed,
					undefined,
				)
				expect(result).toEqual(new Date(2024, 0, 29)) // Monday Jan 29
			})
		})
	})

	describe('monthly', () => {
		test('completed before target date — advances from completion month', () => {
			const completed = new Date(2024, 0, 5) // Jan 5
			const result = computeNextDueDate(
				{ type: 'monthly', dateOfTheMonth: 20, multiplier: 1 },
				completed,
				undefined,
			)
			expect(result).toEqual(new Date(2024, 1, 20)) // Feb 20
		})

		test('completed after target date — still advances from completion month', () => {
			const completed = new Date(2024, 0, 25) // Jan 25
			const result = computeNextDueDate(
				{ type: 'monthly', dateOfTheMonth: 20, multiplier: 1 },
				completed,
				undefined,
			)
			expect(result).toEqual(new Date(2024, 1, 20)) // Feb 20
		})

		test('with due date — advances from due month, not completion month', () => {
			const due = new Date(2024, 3, 20) // Apr 20
			const completed = new Date(2024, 4, 8) // May 8 (overdue)
			const result = computeNextDueDate(
				{ type: 'monthly', dateOfTheMonth: 20, multiplier: 3 },
				completed,
				due,
			)
			expect(result).toEqual(new Date(2024, 6, 20)) // Jul 20 (Apr + 3)
		})

		test('overdue — advances from due month by multiplier', () => {
			const due = new Date(2024, 1, 15) // Feb 15
			const completed = new Date(2024, 3, 3) // Apr 3
			const result = computeNextDueDate(
				{ type: 'monthly', dateOfTheMonth: 15, multiplier: 2 },
				completed,
				due,
			)
			expect(result).toEqual(new Date(2024, 3, 15)) // Apr 15 (Feb + 2)
		})

		test('multiplier of 3 jumps 3 months ahead', () => {
			const due = new Date(2024, 0, 10) // Jan 10
			const completed = new Date(2024, 0, 10)
			const result = computeNextDueDate(
				{ type: 'monthly', dateOfTheMonth: 10, multiplier: 3 },
				completed,
				due,
			)
			expect(result).toEqual(new Date(2024, 3, 10)) // Apr 10
		})

		test('clamps to last day of month in a leap year', () => {
			const due = new Date(2024, 0, 31) // Jan 31, 2024 (leap year)
			const completed = new Date(2024, 0, 31)
			const result = computeNextDueDate(
				{ type: 'monthly', dateOfTheMonth: 31, multiplier: 1 },
				completed,
				due,
			)
			expect(result).toEqual(new Date(2024, 1, 29)) // Feb 29 (2024 is a leap year)
		})

		test('clamps to last day of month in a non-leap year', () => {
			const due = new Date(2023, 0, 31) // Jan 31, 2023
			const completed = new Date(2023, 0, 31)
			const result = computeNextDueDate(
				{ type: 'monthly', dateOfTheMonth: 31, multiplier: 1 },
				completed,
				due,
			)
			expect(result).toEqual(new Date(2023, 1, 28)) // Feb 28
		})

		test('wraps correctly into the next year', () => {
			const due = new Date(2024, 9, 15) // Oct 15
			const completed = new Date(2024, 9, 15)
			const result = computeNextDueDate(
				{ type: 'monthly', dateOfTheMonth: 15, multiplier: 3 },
				completed,
				due,
			)
			expect(result).toEqual(new Date(2025, 0, 15)) // Jan 15, 2025
		})
	})
})
