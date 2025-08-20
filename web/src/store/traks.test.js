import { test, vi, beforeEach, expect } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { useTraksStore } from './traks'
import { setActivePinia } from 'pinia'

beforeEach(() => {
  setActivePinia(createTestingPinia({ createSpy: vi.fn }))
})

test('post traks',() => {
  const traksStore = useTraksStore()
  expect(traksStore).toBeDefined()
})
