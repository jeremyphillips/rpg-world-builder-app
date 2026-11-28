import type { SystemOverlayParticipantId } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { classFormDef } from '../../../classes/lib/class-form-def'
import { subclassFormDef } from '../../../classes/lib/subclasses/subclass-form-values'
import { equipmentFormDef } from '../../../equipment/lib/equipment-form-def'
import { featFormDef } from '../../../feats/lib/feat-form-def'
import { monsterFormDef } from '../../../monsters/lib/monster-form-def'
import { skillProficiencyFormDef } from '../../../skill-proficiencies/lib/skill-proficiency-form-def'
import { speciesFormDef } from '../../../species/lib/species-form-def'
import { spellFormDef } from '../../../spells/lib/spell-form-def'
import type { AnyContentFormDef } from './content-form-registry'
import { resolveCatalogSeedBody } from './resolve-catalog-seed-body.lib'
import { resolveSubclassCatalogSeedBody } from './resolve-catalog-seed-body.lib'

const OVERLAY_FORM_DEFS: Array<{
  id: SystemOverlayParticipantId
  def: Pick<AnyContentFormDef, 'routeKey' | 'normalizeOverlayBody' | 'overlayParticipantId'>
  seedFor?: (rulesetId: 'srd-cc-5.2.1', entityId: string) => Record<string, unknown> | undefined
}> = [
  { id: 'monsters', def: monsterFormDef },
  { id: 'species', def: speciesFormDef },
  { id: 'classes', def: classFormDef },
  { id: 'spells', def: spellFormDef },
  { id: 'equipment', def: equipmentFormDef },
  { id: 'feats', def: featFormDef },
  { id: 'skill-proficiencies', def: skillProficiencyFormDef },
  {
    id: 'subclasses',
    def: {
      routeKey: 'classes',
      overlayParticipantId: subclassFormDef.overlayParticipantId,
      normalizeOverlayBody: subclassFormDef.normalizeOverlayBody as unknown as NonNullable<
        AnyContentFormDef['normalizeOverlayBody']
      >,
    },
    seedFor: resolveSubclassCatalogSeedBody,
  },
]

describe('overlay form registration drift', () => {
  it.each(OVERLAY_FORM_DEFS)(
    '$id form def matches overlay participant and seed loader',
    ({ id, def, seedFor }) => {
      expect(def.normalizeOverlayBody).toBeDefined()
      expect(def.overlayParticipantId).toBe(id)

      const loader =
        seedFor ??
        ((rulesetId, entityId) => resolveCatalogSeedBody(def.routeKey, rulesetId, entityId))
      void loader('srd-cc-5.2.1', 'probe')
      expect(def.routeKey).toBeTruthy()
    },
  )
})
