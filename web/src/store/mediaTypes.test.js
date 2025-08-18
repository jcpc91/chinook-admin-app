import { test, vi, beforeEach } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { useMediaTypeStore } from './mediaTypes'
import { setActivePinia } from 'pinia'

beforeEach(() => {
  const pinia = createTestingPinia({ createSpy: vi.fn })
  setActivePinia(pinia)
})

test('post mediaTypes', () => {
    const store = useMediaTypeStore()
    // a basic test
    expect(store).toBeDefined()
})
