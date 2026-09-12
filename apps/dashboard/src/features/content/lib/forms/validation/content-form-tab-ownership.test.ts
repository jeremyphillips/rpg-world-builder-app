/**
 * Registry drift guards for tabbed content forms — tab ownership and draft leniency.
 */
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { collectTabPathPrefixes, pathOwnsIssue } from '@rpg/ui/form'

import { contentFormRegistry, type ContentFormDef } from '../registry/content-form-registry'
import '../registry/content-form-test-registry'
import { augmentTabsWithHoistedName } from '../shells/layout/content-schema-form-tabs.lib'
import { resolveContentPublishSchema } from '../shells/edit/content-edit-load'
import { assertHeaderOnlyTabsHaveValidationWiring } from './tabbed-form-validation-test-utils'
import { buildSpellTabs } from '../../../spells/lib/spell-form-fields'
import { buildClassTabs } from '../../../classes/lib/class-form-fields'
import { buildSpeciesTabs } from '../../../species/lib/species-form-fields'

type AnyDef = ContentFormDef<{ id: string; name: string }, Record<string, unknown>, unknown>

const registryEntries = Object.entries(contentFormRegistry).filter(
  ([, def]) => def.buildTabs != null,
) as [string, AnyDef][]

const TAB_OWNERSHIP_EXEMPT: Readonly<Record<string, readonly string[]>> = {
  spells: [
    'slug',
    'effects',
    'resolution',
    'modeling',
    'tags',
    'areaOfEffect',
    'deliveryMethod',
    'cantripScaling',
    'higherLevelSlotEffect',
  ],
  classes: ['slug', 'subclasses'],
  species: ['slug', 'culture'],
  equipment: ['slug', 'kind'],
  organizations: ['slug', 'sourcePresetId'],
  feats: ['slug'],
  locations: ['slug'],
  'skill-proficiencies': ['slug', 'examples'],
}

function publishSchemaTopLevelKeys(def: AnyDef, ctx: Record<string, unknown>): string[] {
  const schema = resolveContentPublishSchema(def, ctx)
  if (!(schema instanceof z.ZodObject)) {
    return []
  }

  return Object.keys(schema.shape)
}

function collectOwnedTopLevelKeys(tabs: ReturnType<typeof augmentTabsWithHoistedName>): string[] {
  const owned = new Set<string>()

  for (const tab of tabs) {
    for (const prefix of collectTabPathPrefixes(tab)) {
      owned.add(prefix.split('.')[0]!)
    }
  }

  return [...owned]
}

describe.each(registryEntries)('ContentFormDef[%s] tab ownership drift', (routeKey, def) => {
  const ctx = routeKey === 'equipment' ? { equipmentKind: 'weapon' as const } : {}

  it('owns every publish-schema top-level key on a tab', () => {
    const tabs = augmentTabsWithHoistedName(def.buildTabs!(ctx), def.nameField(ctx))
    const ownedKeys = collectOwnedTopLevelKeys(tabs)
    const exempt = new Set(TAB_OWNERSHIP_EXEMPT[routeKey] ?? ['slug'])

    for (const key of publishSchemaTopLevelKeys(def, ctx)) {
      if (exempt.has(key) || key.startsWith('_')) continue

      const isOwned = ownedKeys.some((ownedKey) => pathOwnsIssue(ownedKey, key))
      expect(
        isOwned,
        `${routeKey}: publish schema key "${key}" is not owned by any tab error path`,
      ).toBe(true)
    }
  })

  it('accepts create defaults in the draft resolver', () => {
    if (!def.draftSchema && !def.resolveSchema) return

    const draftSchema = def.resolveSchema?.(ctx, 'draft') ?? def.draftSchema
    if (!draftSchema) return

    const result = draftSchema.safeParse({
      ...def.createDefaultValues,
      name: 'Test name',
    })

    expect(
      result.success,
      `${routeKey}: draft schema rejected create defaults — ${result.success ? '' : JSON.stringify(result.error.issues.slice(0, 3))}`,
    ).toBe(true)
  })
})

describe('TabbedForm header-only validation wiring', () => {
  it('spell tabs wire errorPaths and resolverFields on master-detail tabs', () => {
    assertHeaderOnlyTabsHaveValidationWiring(buildSpellTabs({}))
  })

  it('species tabs wire errorPaths and resolverFields on master-detail tabs', () => {
    assertHeaderOnlyTabsHaveValidationWiring(buildSpeciesTabs({}))
  })

  it('class tabs wire errorPaths and resolverFields on master-detail tabs', () => {
    assertHeaderOnlyTabsHaveValidationWiring(buildClassTabs({}), {
      exemptTabIds: ['subclasses'],
    })
  })
})
