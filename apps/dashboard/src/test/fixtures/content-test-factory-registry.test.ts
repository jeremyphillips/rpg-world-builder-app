import { CONTENT_TYPE_KEYS } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { CONTENT_TEST_FACTORY_REGISTRY } from './content-test-factory-registry'

describe('CONTENT_TEST_FACTORY_REGISTRY parity', () => {
  it('covers every ContentTypeKey with a factory function', () => {
    const registryKeys = Object.keys(CONTENT_TEST_FACTORY_REGISTRY).sort()
    const contractKeys = [...CONTENT_TYPE_KEYS].sort()

    expect(registryKeys).toEqual(contractKeys)
  })

  it('registers a callable factory for each content type', () => {
    for (const factory of Object.values(CONTENT_TEST_FACTORY_REGISTRY)) {
      expect(typeof factory).toBe('function')
    }
  })
})
