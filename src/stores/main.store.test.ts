import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useMainStore } from './main.store'

describe('main Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('資料是否存在', () => {
    const store = useMainStore()
    expect(store.data).toBe('')
  })
})
