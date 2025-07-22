import { test } from 'vitest'
import { useTraksStore } from './traks'

test('post traks',() => {
  const traksStore = useTraksStore()
  traksStore.createTrak()
})