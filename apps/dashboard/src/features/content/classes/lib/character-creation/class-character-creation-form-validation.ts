import type { z } from 'zod'
import {
  eligibleProficiencyChoiceTargetIds,
  indexCharacterBuildCatalog,
  type CharacterClass,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { CHARACTER_CREATION_TOOL_CHOICE_ID } from './class-character-creation-link-labels'
import {
  characterCreationProficienciesWithLiveToolLabel,
  isMeaningfulCharacterCreationToolChoice,
} from './class-character-creation-proficiencies-form-values'
import type { CharacterCreationProficienciesForm } from './class-character-creation-proficiencies-form-fields'
import {
  refineStartingEquipmentProficiencyLinkRow,
  type StartingEquipmentForm,
  type StartingEquipmentItemForm,
} from './class-starting-equipment-form-fields'

type CharacterCreationFormSlice = {
  proficiencies?: CharacterCreationProficienciesForm
  startingEquipment?: StartingEquipmentForm
}

type ProficiencyLinkIssue = {
  code: 'custom'
  message: string
  path: (string | number)[]
}

function buildEligibleProficiencyChoiceIds(
  proficiencies: CharacterCreationProficienciesForm | undefined,
  formCtx?: Pick<ContentFormCtx, 'options' | 'entityId'>,
): ReadonlySet<string> {
  const equipment = formCtx?.options?.equipment?.visible ?? []
  if (!equipment.length) return new Set()

  const characterCreationProficiencies =
    characterCreationProficienciesWithLiveToolLabel(proficiencies)
  if (!characterCreationProficiencies?.tools?.choices?.length) return new Set()

  const characterClass = {
    id: formCtx?.entityId ?? 'draft-class',
    rulesetId: equipment[0]?.rulesetId ?? 'srd-cc-5.2.1',
    characterCreation: { proficiencies: characterCreationProficiencies },
  } as CharacterClass

  const catalogIndex = indexCharacterBuildCatalog({
    species: [],
    classes: [characterClass],
    spells: [],
    equipment: [...equipment],
    skillProficiencies: [],
    organizations: [],
    languages: [],
  })

  return eligibleProficiencyChoiceTargetIds(characterClass, catalogIndex)
}

export function refineCharacterCreationSaveValidation(
  characterCreation: CharacterCreationFormSlice | undefined,
  ctx: z.RefinementCtx,
  formCtx?: Pick<ContentFormCtx, 'options' | 'entityId'>,
): void {
  const tools = characterCreation?.proficiencies?.tools

  if (isMeaningfulCharacterCreationToolChoice(tools) && !tools.label?.trim()) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enter a label for the tool proficiency choice.',
      path: ['proficiencies', 'tools', 'label'],
    })
  }

  const startingEquipment = characterCreation?.startingEquipment
  if (!startingEquipment?.options?.length) return

  const definedToolChoiceIds = isMeaningfulCharacterCreationToolChoice(tools)
    ? new Set([CHARACTER_CREATION_TOOL_CHOICE_ID])
    : new Set<string>()
  const eligibleIds = buildEligibleProficiencyChoiceIds(characterCreation?.proficiencies, formCtx)

  for (const [optionIndex, option] of startingEquipment.options.entries()) {
    for (const [itemIndex, item] of option.items.entries()) {
      refineStartingEquipmentProficiencyLinkRow(
        item as Extract<StartingEquipmentItemForm, { itemKind: 'grant' }>,
        {
          addIssue: (issue: ProficiencyLinkIssue) =>
            ctx.addIssue({
              ...issue,
              path: [
                'startingEquipment',
                'options',
                optionIndex,
                'items',
                itemIndex,
                ...issue.path,
              ],
            }),
        },
        {
          definedToolChoiceIds,
          eligibleProficiencyChoiceIds: eligibleIds,
        },
      )
    }
  }
}
