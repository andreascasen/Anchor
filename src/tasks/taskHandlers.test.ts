import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { NotFoundError, ValidationError } from '../lib/errors'

const mockInsertReturning = mock()
const mockSelectWhere = mock()
const mockUpdateReturning = mock()
const mockDeleteReturning = mock()

mock.module('../../dataSources/sqlite', () => ({
	dbClient: {
		insert: () => ({ values: () => ({ returning: mockInsertReturning }) }),
		select: () => ({ from: () => ({ where: mockSelectWhere }) }),
		update: () => ({
			set: () => ({ where: () => ({ returning: mockUpdateReturning }) }),
		}),
		delete: () => ({ where: () => ({ returning: mockDeleteReturning }) }),
	},
}))

import { createTask, deleteTasks, getTasks, updateTask } from './taskHandlers'

const mockTask = {
	id: 'test-id',
	title: 'Test Task',
	description: null,
	priority: 'low',
	status: 'pending',
	due: null,
	recurrence: null,
}

beforeEach(() => {
	mockInsertReturning.mockReset()
	mockSelectWhere.mockReset()
	mockUpdateReturning.mockReset()
	mockDeleteReturning.mockReset()
})

describe('createTask', () => {
	it('creates and returns a task for valid input', async () => {
		mockInsertReturning.mockResolvedValue([mockTask])

		const result = await createTask({ title: 'Test Task' })

		expect(result).toEqual(mockTask)
	})

	it('throws ValidationError for invalid input', async () => {
		await expect(createTask({ title: 123 })).rejects.toBeInstanceOf(
			ValidationError,
		)
	})
})

describe('getTasks', () => {
	it('returns tasks from the database', async () => {
		mockSelectWhere.mockResolvedValue([mockTask])

		const result = await getTasks()

		expect(result).toEqual([mockTask])
	})
})

describe('updateTask', () => {
	it('updates and returns the task for valid input', async () => {
		const updatedTask = { ...mockTask, title: 'Updated Task' }
		mockUpdateReturning.mockResolvedValue([updatedTask])

		const result = await updateTask('test-id', { title: 'Updated Task' })

		expect(result).toEqual(updatedTask)
	})

	it('throws ValidationError for invalid input', async () => {
		await expect(
			updateTask('test-id', { priority: 'invalid' }),
		).rejects.toBeInstanceOf(ValidationError)
	})

	it('throws NotFoundError when task does not exist', async () => {
		mockUpdateReturning.mockResolvedValue([])

		await expect(
			updateTask('non-existent', { title: 'Test' }),
		).rejects.toBeInstanceOf(NotFoundError)
	})
})

describe('deleteTasks', () => {
	it('deletes tasks and returns their ids', async () => {
		const deletedIds = [{ id: 'test-id' }]
		mockDeleteReturning.mockResolvedValue(deletedIds)

		const result = await deleteTasks(['test-id'])

		expect(result).toEqual(deletedIds)
	})

	it('throws ValidationError for an empty array', async () => {
		await expect(deleteTasks([])).rejects.toBeInstanceOf(ValidationError)
	})
})
