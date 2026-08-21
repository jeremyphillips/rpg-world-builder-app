import { describe, expect, it } from 'vitest'

import {
  CHARACTER_BULK_ROSTER_FORM_DEFAULT,
  applyBulkRosterStatusOperations,
  campaignCharacterCardSchema,
  characterCardSummarySchema,
  characterSchema,
  characterValidationMessages,
  formatCharacterSummary,
  formatSelectionSourceLabel,
  resolveBuilderCharacterSummaryParts,
  resolveCharacterSummaryParts,
  supportsCharacterBulkRosterStatus,
  toCharacterSheetDerivationInput,
} from '@rpg/contracts'

import type { OrganizationMembersResponse } from '@rpg/contracts'

import { characterSchema as characterSchemaFromRuntime } from '@rpg/contracts/runtime'

describe('@rpg/contracts character runtime export surface', () => {
  it('exposes moved symbols from the root barrel', () => {
    expect(typeof characterSchema).toBe('object')
    expect(typeof resolveCharacterSummaryParts).toBe('function')
    expect(typeof resolveBuilderCharacterSummaryParts).toBe('function')
    expect(typeof toCharacterSheetDerivationInput).toBe('function')
    expect(typeof applyBulkRosterStatusOperations).toBe('function')
    expect(typeof supportsCharacterBulkRosterStatus).toBe('function')
    expect(typeof formatCharacterSummary).toBe('function')
    expect(typeof formatSelectionSourceLabel).toBe('function')
    expect(typeof characterValidationMessages.duplicateClass).toBe('function')
    expect(typeof campaignCharacterCardSchema).toBe('object')
    expect(typeof characterCardSummarySchema).toBe('object')
    expect(CHARACTER_BULK_ROSTER_FORM_DEFAULT.rosterStatus.kind).toBe('unchanged')
  })

  it('exposes characterSchema from the runtime subpath', () => {
    expect(characterSchemaFromRuntime).toBe(characterSchema)
  })

  it('preserves representative type-only exports', () => {
    type _OrganizationMembersResponse = OrganizationMembersResponse
    type _Check = _OrganizationMembersResponse extends { items: unknown[] } ? true : false
    const check: _Check = true
    expect(check).toBe(true)
  })
})
