import { SPELL_ATOMIC_EFFECT_KINDS, type SpellAtomicEffectKind } from '@rpg/contracts'

import { SPELL_ATOMIC_EFFECT_KIND_LABELS } from './effect-form-schema'

export const EFFECT_TEMPLATE_GROUP_IDS = ['effects'] as const

export type EffectTemplateGroupId = (typeof EFFECT_TEMPLATE_GROUP_IDS)[number]

export type EffectTemplateGroup = {
  id: EffectTemplateGroupId
  label: string
}

export const EFFECT_TEMPLATE_GROUPS: readonly EffectTemplateGroup[] = [
  { id: 'effects', label: 'Spell effects' },
] as const

export type EffectTemplate = {
  id: string
  label: string
  description: string
  groupId: EffectTemplateGroupId
  kind: SpellAtomicEffectKind
  createDefault: () => Record<string, unknown>
  search?: { aliases?: string[]; keywords?: string[] }
}

function createEffectId(): string {
  return crypto.randomUUID()
}

export const EFFECT_TEMPLATES: readonly EffectTemplate[] = [
  {
    id: 'damage',
    label: SPELL_ATOMIC_EFFECT_KIND_LABELS.damage,
    description: 'Roll-based damage with a damage type (e.g. 8d6 fire).',
    groupId: 'effects',
    kind: 'damage',
    createDefault: () => ({
      id: createEffectId(),
      kind: 'damage',
      roll: { dice: { count: 1, faces: 6 } },
      damageType: 'fire',
    }),
    search: { keywords: ['attack', 'harm'] },
  },
  {
    id: 'healing',
    label: SPELL_ATOMIC_EFFECT_KIND_LABELS.healing,
    description: 'Roll-based healing (e.g. 2d8 healing).',
    groupId: 'effects',
    kind: 'healing',
    createDefault: () => ({
      id: createEffectId(),
      kind: 'healing',
      roll: { dice: { count: 2, faces: 8 } },
    }),
    search: { aliases: ['cure', 'restore'], keywords: ['hit points'] },
  },
  {
    id: 'temporary-hit-points',
    label: SPELL_ATOMIC_EFFECT_KIND_LABELS['temporary-hit-points'],
    description: 'Grant temporary hit points from a roll (e.g. 2d4+4).',
    groupId: 'effects',
    kind: 'temporary-hit-points',
    createDefault: () => ({
      id: createEffectId(),
      kind: 'temporary-hit-points',
      roll: { dice: { count: 2, faces: 4 }, flat: 4 },
    }),
    search: { aliases: ['temp hp', 'false life'] },
  },
  {
    id: 'projectile-count',
    label: SPELL_ATOMIC_EFFECT_KIND_LABELS['projectile-count'],
    description: 'Count of projectiles or missiles without implying per-projectile damage.',
    groupId: 'effects',
    kind: 'projectile-count',
    createDefault: () => ({
      id: createEffectId(),
      kind: 'projectile-count',
      count: 3,
      unitLabel: 'darts',
    }),
    search: { aliases: ['magic missile', 'darts', 'bolts'] },
  },
] as const

const EFFECT_TEMPLATE_BY_ID = Object.fromEntries(
  EFFECT_TEMPLATES.map((template) => [template.id, template]),
) as Record<string, EffectTemplate>

export function getEffectTemplateById(id: string): EffectTemplate | undefined {
  return EFFECT_TEMPLATE_BY_ID[id]
}

export function getEffectTemplatesForKinds(
  kinds: readonly SpellAtomicEffectKind[] = SPELL_ATOMIC_EFFECT_KINDS,
): EffectTemplate[] {
  const allowed = new Set(kinds)
  return EFFECT_TEMPLATES.filter((template) => allowed.has(template.kind))
}

export function getEffectTemplateGroup(id: EffectTemplateGroupId): EffectTemplateGroup {
  return EFFECT_TEMPLATE_GROUPS.find((group) => group.id === id) ?? EFFECT_TEMPLATE_GROUPS[0]!
}
