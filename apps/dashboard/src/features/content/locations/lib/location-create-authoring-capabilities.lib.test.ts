import { describe, expect, it } from 'vitest'

import type { ContentCreateContext } from '@/lib/create-flow/content-create-context'

import { resolveLocationCreateAuthoringCapabilities } from './location-create-authoring-capabilities.lib'

const relationshipTargetContext = {
  kind: 'relationship-target',
  source: { contentType: 'organizations', id: 'org-1' },
  relationshipVocabulary: 'organization_location_connection',
} as const satisfies ContentCreateContext

describe('resolveLocationCreateAuthoringCapabilities', () => {
  it('enables organization composition for standalone Building create', () => {
    expect(
      resolveLocationCreateAuthoringCapabilities({
        authoringType: 'building',
        createContext: { kind: 'standalone' },
      }),
    ).toEqual({
      tabs: ['details', 'organizations'],
      organizationComposition: true,
    })
  })

  it('suppresses organization composition for relationship-target Building create', () => {
    expect(
      resolveLocationCreateAuthoringCapabilities({
        authoringType: 'building',
        createContext: relationshipTargetContext,
      }),
    ).toEqual({
      tabs: ['details'],
      organizationComposition: false,
    })
  })

  it('does not expose organization composition for non-building authoring types', () => {
    expect(
      resolveLocationCreateAuthoringCapabilities({
        authoringType: 'settlement',
        createContext: { kind: 'standalone' },
      }),
    ).toEqual({
      tabs: ['details'],
      organizationComposition: false,
    })

    expect(
      resolveLocationCreateAuthoringCapabilities({
        authoringType: 'settlement',
        createContext: relationshipTargetContext,
      }),
    ).toEqual({
      tabs: ['details'],
      organizationComposition: false,
    })
  })
})
