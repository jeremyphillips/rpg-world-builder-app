import {
  creatureTraitTemplateSenseId,
  getCreatureTraitTemplate,
  isSenseCreatureTraitTemplateId,
  listCreatureTraitTemplatesForRuleset,
} from '@rpg/contracts'

import { MONSTER_ACTION_ALREADY_ADDED_NOTE } from '../../monsters/lib/actions/acquisition/monster-action-acquisition'
import type { TraitRowForm } from './species-trait-form-fields'

const CUSTOM_GROUP_ID = 'custom'
const SENSES_GROUP_ID = 'senses'
const TEMPLATES_GROUP_ID = 'templates'

export const SPECIES_TRAIT_ALREADY_ADDED_NOTE = MONSTER_ACTION_ALREADY_ADDED_NOTE

export type SpeciesTraitAcquisitionItem = {
  id: string
  label: string
  groupId: string
  note?: string
}

function senseIdInTraitRow(trait: TraitRowForm): string | undefined {
  if (trait.kind === 'template' && trait.templateId) {
    return creatureTraitTemplateSenseId(trait.templateId)
  }
  return undefined
}

function existingTraitIndexForSenseTemplate(
  traits: readonly TraitRowForm[],
  templateId: string,
): number {
  const senseId = creatureTraitTemplateSenseId(templateId)
  if (!senseId) return -1
  return traits.findIndex((trait) => senseIdInTraitRow(trait) === senseId)
}

export function speciesTraitAcquisitionItems(
  rulesetId: string,
  traits: readonly TraitRowForm[],
): SpeciesTraitAcquisitionItem[] {
  const templateIds = listCreatureTraitTemplatesForRuleset(rulesetId, 'species')
  const items: SpeciesTraitAcquisitionItem[] = []

  for (const templateId of templateIds) {
    const template = getCreatureTraitTemplate(templateId)
    if (!template) continue
    const existingIndex = existingTraitIndexForSenseTemplate(traits, templateId)
    const isSense = isSenseCreatureTraitTemplateId(templateId)
    const groupId = isSense ? SENSES_GROUP_ID : TEMPLATES_GROUP_ID
    const rowId = traits[existingIndex]?.id
    items.push({
      id: existingIndex >= 0 && rowId ? `focus:${rowId}` : `template:${templateId}`,
      label: template.label,
      groupId,
      ...(existingIndex >= 0 ? { note: SPECIES_TRAIT_ALREADY_ADDED_NOTE } : {}),
    })
  }

  items.push({
    id: 'custom',
    label: 'Custom trait',
    groupId: CUSTOM_GROUP_ID,
  })

  return items
}

export function parseSpeciesTraitAcquisitionId(
  id: string,
):
  | { type: 'template'; templateId: string }
  | { type: 'focus'; traitId: string }
  | { type: 'custom' }
  | undefined {
  if (id === 'custom') return { type: 'custom' }
  if (id.startsWith('focus:')) {
    const traitId = id.slice('focus:'.length)
    return traitId ? { type: 'focus', traitId } : undefined
  }
  if (id.startsWith('template:')) {
    const templateId = id.slice('template:'.length)
    return templateId ? { type: 'template', templateId } : undefined
  }
  return undefined
}

export const SPECIES_TRAIT_ACQUISITION_GROUPS = [
  { id: SENSES_GROUP_ID, label: 'Senses' },
  { id: TEMPLATES_GROUP_ID, label: 'Templates' },
  { id: CUSTOM_GROUP_ID, label: 'Custom' },
] as const
