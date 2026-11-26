import { getMonsterBySlug } from '@rpg/catalog/monsters'
import { SYSTEM_OVERLAY_INTENT_FIELD } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { makeContentFormCtx, TEST_CAMPAIGN_ID } from '../../lib/fixtures/content-form-ctx'
import { serializeContentFormInput } from '../../lib/forms/registry/content-form-serialize-input.lib'
import { loadContentEditFormState } from '../../lib/forms/shells/edit/content-edit-load'

import { monsterFormDef } from './monster-form-def'
import type { MonsterFormValues } from './monster-form-values'

const RULESET_ID = 'srd-cc-5.2.1'
const HOMEBREW_TRAIT_ID = 'hb-trait-1'

function systemKobold() {
  const catalog = getMonsterBySlug(RULESET_ID, 'kobold-warrior')
  return {
    ...catalog,
    catalogLayer: 'system' as const,
    status: 'published' as const,
    overlayRevision: 0,
    seedRowIdsByPath: {
      traits: catalog.traits?.map((trait) => trait.id) ?? [],
    },
  }
}

function loadMonsterEdit(entity = systemKobold()) {
  const optionsCtx = makeContentFormCtx({
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
    skillCatalogStatus: 'ready',
    skillCatalogBySlug: new Map(),
    spellCatalogStatus: 'ready',
    spellCatalogById: new Map(),
  })
  return {
    entity,
    ...loadContentEditFormState({
      def: monsterFormDef,
      entity,
      optionsCtx,
      campaignId: TEST_CAMPAIGN_ID,
      entityId: entity.id,
      armorClassRules: optionsCtx.armorClassRules,
    }),
    catalogSeed: getMonsterBySlug(RULESET_ID, 'kobold-warrior') as Record<string, unknown>,
  }
}

function serializeMonsterUpdate(
  draft: MonsterFormValues,
  loaded: ReturnType<typeof loadMonsterEdit>,
) {
  const overlayBaseline = monsterFormDef.normalizeOverlayBody!(
    loaded.defaultValues as MonsterFormValues,
    { entity: loaded.entity, armorClassRules: loaded.layoutCtx.armorClassRules },
    loaded.validationIntent,
  )

  return serializeContentFormInput(
    monsterFormDef,
    draft,
    { entity: loaded.entity, armorClassRules: loaded.layoutCtx.armorClassRules },
    loaded.validationIntent,
    {
      operation: 'update',
      entityId: loaded.entity.id,
      rulesetId: RULESET_ID,
      catalogSeed: loaded.catalogSeed,
      overlayBaseline,
      expectedOverlayRevision: loaded.entity.overlayRevision ?? 0,
      seedRowIdsByPath: loaded.entity.seedRowIdsByPath,
      dirtyFields: { name: true },
    },
  ) as Record<string, unknown>
}

describe('monster system overlay intent integration', () => {
  it('builds a name-only intent when trait collections stay mounted and unchanged', () => {
    const loaded = loadMonsterEdit()
    const draft = {
      ...(loaded.defaultValues as MonsterFormValues),
      name: 'Patched Kobold Warrior',
    }

    const payload = serializeMonsterUpdate(draft, loaded)
    const intent = payload[SYSTEM_OVERLAY_INTENT_FIELD] as Record<string, unknown>

    expect(intent).toEqual({ set: { name: 'Patched Kobold Warrior' } })
    expect(intent.collections).toBeUndefined()
  })

  it('removes a persisted homebrew addition without classifying it as a seed row', () => {
    const loaded = loadMonsterEdit()
    const baselineValues = {
      ...(loaded.defaultValues as MonsterFormValues),
      traits: [
        ...((loaded.defaultValues as MonsterFormValues).traits ?? []),
        {
          id: HOMEBREW_TRAIT_ID,
          kind: 'custom' as const,
          name: 'Extra Dart',
          description: 'Throws harder.',
        },
      ],
    }
    const draft = {
      ...baselineValues,
      traits: (loaded.defaultValues as MonsterFormValues).traits ?? [],
    }

    const overlayBaseline = monsterFormDef.normalizeOverlayBody!(
      baselineValues,
      { entity: loaded.entity, armorClassRules: loaded.layoutCtx.armorClassRules },
      loaded.validationIntent,
    )

    const payload = serializeContentFormInput(
      monsterFormDef,
      draft,
      { entity: loaded.entity, armorClassRules: loaded.layoutCtx.armorClassRules },
      loaded.validationIntent,
      {
        operation: 'update',
        entityId: loaded.entity.id,
        rulesetId: RULESET_ID,
        catalogSeed: loaded.catalogSeed,
        overlayBaseline,
        expectedOverlayRevision: loaded.entity.overlayRevision ?? 0,
        seedRowIdsByPath: loaded.entity.seedRowIdsByPath,
        dirtyFields: { traits: true },
      },
    ) as Record<string, unknown>

    expect(loaded.entity.seedRowIdsByPath?.traits).not.toContain(HOMEBREW_TRAIT_ID)
    expect(payload[SYSTEM_OVERLAY_INTENT_FIELD]).toEqual({
      collections: { traits: { reset: true } },
    })
  })

  it('does not manufacture collection intent when baseline and draft only differ by reference', () => {
    const loaded = loadMonsterEdit()
    const draft = structuredClone(loaded.defaultValues) as MonsterFormValues

    const overlayBaseline = monsterFormDef.normalizeOverlayBody!(
      loaded.defaultValues as MonsterFormValues,
      { entity: loaded.entity, armorClassRules: loaded.layoutCtx.armorClassRules },
      loaded.validationIntent,
    )
    const overlayDraft = monsterFormDef.normalizeOverlayBody!(
      draft,
      { entity: loaded.entity, armorClassRules: loaded.layoutCtx.armorClassRules },
      loaded.validationIntent,
    )

    const payload = serializeContentFormInput(
      monsterFormDef,
      draft,
      { entity: loaded.entity, armorClassRules: loaded.layoutCtx.armorClassRules },
      loaded.validationIntent,
      {
        operation: 'update',
        entityId: loaded.entity.id,
        rulesetId: RULESET_ID,
        catalogSeed: loaded.catalogSeed,
        overlayBaseline,
        expectedOverlayRevision: loaded.entity.overlayRevision ?? 0,
        seedRowIdsByPath: loaded.entity.seedRowIdsByPath,
      },
    ) as Record<string, unknown>

    const intent = payload[SYSTEM_OVERLAY_INTENT_FIELD] as Record<string, unknown>
    expect(intent).toEqual({})
    expect(overlayDraft).toEqual(overlayBaseline)
  })
})
