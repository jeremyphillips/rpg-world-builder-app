import type { ButtonDropdownItem } from '@rpg/ui'
import {
  creatureTraitTemplateOccurrenceMessage,
  creatureTraitTemplateSenseId,
  DUPLICATE_SPECIES_SENSE_TRAIT_MESSAGE,
  getCreatureTraitTemplate,
  isSenseCreatureTraitTemplateId,
  listCreatureTraitTemplatesForRuleset,
} from '@rpg/contracts'

import type { LabelDescriptionActiveVocabulary } from '@/features/vocabulary/lib/build-vocabulary-maps'
import {
  type AcquisitionOption,
  resolveAcquisitionAvailability,
  toAcquisitionDropdownItem,
} from '../../lib/acquisition'
import { CREATURE_TRAIT_CUSTOM_DESCRIPTION } from '../../lib/creature-traits/creature-trait-custom-description'
import { CREATURE_TRAIT_CUSTOM_ITEM_ID } from '../../lib/creature-traits/creature-trait-add-menu'
import type { TraitRowForm } from './species-trait-form-fields'

const CUSTOM_GROUP_ID = 'custom'
const SENSES_GROUP_ID = 'senses'
const TEMPLATES_GROUP_ID = 'templates'

export const SPECIES_SENSE_VOCABULARY_READINESS_MESSAGE = 'Sense vocabulary is not ready.'

export const SPECIES_SENSE_MISSING_DESCRIPTION_MESSAGE = 'This sense has no vocabulary description.'

export type SpeciesTraitAcquisitionChoice =
  | { type: 'template'; templateId: string }
  | { type: 'custom' }

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

function existingTraitIndexForTemplate(
  traits: readonly TraitRowForm[],
  templateId: string,
): number {
  return traits.findIndex((trait) => trait.kind === 'template' && trait.templateId === templateId)
}

function senseTemplateParts(
  templateId: string,
  senseVocabulary: LabelDescriptionActiveVocabulary | undefined,
  senseVocabularyStatus: 'pending' | 'error' | 'ready',
): Pick<AcquisitionOption, 'description' | 'availability'> {
  const senseId = creatureTraitTemplateSenseId(templateId)
  if (!senseId) {
    const template = getCreatureTraitTemplate(templateId)
    return {
      description: { status: 'ready', text: template?.description ?? '' },
      availability: { status: 'available' },
    }
  }

  if (senseVocabularyStatus !== 'ready') {
    return {
      description: { status: 'ready', text: '' },
      availability: resolveAcquisitionAvailability({
        readiness: { message: SPECIES_SENSE_VOCABULARY_READINESS_MESSAGE },
      }),
    }
  }

  if (!senseVocabulary || !(senseId in senseVocabulary.descriptionById)) {
    return {
      description: { status: 'ready', text: '' },
      availability: resolveAcquisitionAvailability({
        readiness: { message: SPECIES_SENSE_VOCABULARY_READINESS_MESSAGE },
      }),
    }
  }

  const vocabularyDescription = senseVocabulary.descriptionById[senseId] ?? ''
  if (vocabularyDescription.trim().length === 0) {
    return {
      description: { status: 'unresolved', message: SPECIES_SENSE_MISSING_DESCRIPTION_MESSAGE },
      availability: { status: 'available' },
    }
  }

  return {
    description: { status: 'ready', text: vocabularyDescription },
    availability: { status: 'available' },
  }
}

function templateOccurrenceMessage(
  templateId: string,
  traits: readonly TraitRowForm[],
  isSense: boolean,
): string | undefined {
  if (isSense) {
    return existingTraitIndexForSenseTemplate(traits, templateId) >= 0
      ? DUPLICATE_SPECIES_SENSE_TRAIT_MESSAGE
      : undefined
  }
  if (existingTraitIndexForTemplate(traits, templateId) < 0) return undefined
  const template = getCreatureTraitTemplate(templateId)
  return creatureTraitTemplateOccurrenceMessage(template?.label ?? templateId)
}

export function speciesTraitAcquisitionOptions(input: {
  rulesetId: string
  traits: readonly TraitRowForm[]
  senseVocabulary?: LabelDescriptionActiveVocabulary
  senseVocabularyStatus: 'pending' | 'error' | 'ready'
}): AcquisitionOption[] {
  const templateIds = listCreatureTraitTemplatesForRuleset(input.rulesetId, 'species')
  const items: AcquisitionOption[] = []

  for (const templateId of templateIds) {
    const template = getCreatureTraitTemplate(templateId)
    if (!template) continue
    const isSense = isSenseCreatureTraitTemplateId(templateId)
    const groupId = isSense ? SENSES_GROUP_ID : TEMPLATES_GROUP_ID
    const base = isSense
      ? senseTemplateParts(templateId, input.senseVocabulary, input.senseVocabularyStatus)
      : {
          description: { status: 'ready' as const, text: template.description },
          availability: { status: 'available' as const },
        }
    const occurrenceMessage = templateOccurrenceMessage(templateId, input.traits, isSense)
    const readiness =
      base.availability.status === 'unavailable' && base.availability.code === 'readiness'
        ? { message: base.availability.message }
        : undefined

    items.push({
      id: `template:${templateId}`,
      label: template.label,
      groupId,
      description: base.description,
      availability: resolveAcquisitionAvailability({
        occurrence: occurrenceMessage ? { message: occurrenceMessage } : undefined,
        readiness,
      }),
    })
  }

  items.push({
    id: CREATURE_TRAIT_CUSTOM_ITEM_ID,
    label: 'Custom trait',
    groupId: CUSTOM_GROUP_ID,
    description: { status: 'ready', text: CREATURE_TRAIT_CUSTOM_DESCRIPTION },
    availability: { status: 'available' },
  })

  return items
}

export function speciesTraitAcquisitionDropdownItems(
  input: Parameters<typeof speciesTraitAcquisitionOptions>[0],
): ButtonDropdownItem[] {
  return speciesTraitAcquisitionOptions(input).map(toAcquisitionDropdownItem)
}

export function parseSpeciesTraitAcquisitionId(
  id: string,
): SpeciesTraitAcquisitionChoice | undefined {
  if (id === CREATURE_TRAIT_CUSTOM_ITEM_ID) return { type: 'custom' }
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
