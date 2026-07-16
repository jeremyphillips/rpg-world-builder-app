import type { CharacterClass, CreateClassInput, ToolProficiencyChoice } from '@rpg/contracts'
import { isMeaningfulToolProficiencyPool, type ToolProficiencyPool } from '@rpg/contracts'

import {
  toolProficiencyPoolFromFormRow,
  toolProficiencyPoolToFormRow,
} from '../../../lib/forms/grants/proficiency-grant-form-values'
import type { ToolProficiencyItemForm } from '../../../lib/forms/grants/proficiency-grant-form-fields'
import { CHARACTER_CREATION_TOOL_CHOICE_ID } from './class-character-creation-link-labels'
import type { CharacterCreationProficienciesForm } from './class-character-creation-proficiencies-form-fields'
import { suggestToolProficiencyChoiceLabel } from './suggest-tool-proficiency-choice-label'

type ToolProficiencyPoolItemForm = Extract<ToolProficiencyItemForm, { proficiencySource: 'pool' }>
type StoredToolChoice = ToolProficiencyChoice & { from?: string[] }

const DEFAULT_SKILL_CHOICE_FORM = { choose: 0, from: [] as string[] }
const DEFAULT_TOOL_POOL_FORM = {
  poolSource: 'filtered',
  poolToolCategories: [],
  poolToolSlugs: [],
  poolFilteredToolSlugs: [],
} as const satisfies Pick<
  CharacterCreationProficienciesForm['tools'],
  'poolSource' | 'poolToolCategories' | 'poolToolSlugs' | 'poolFilteredToolSlugs'
>

function toolChoiceToPoolFormRow(
  pool: ToolProficiencyPool,
): Pick<
  CharacterCreationProficienciesForm['tools'],
  'poolSource' | 'poolToolSlugs' | 'poolToolCategories' | 'poolFilteredToolSlugs'
> {
  const row = toolProficiencyPoolToFormRow(pool)
  return {
    poolSource: row.poolSource,
    poolToolSlugs: row.toolProficiencyPoolSlugs,
    poolToolCategories: row.toolProficiencyPoolCategories,
    poolFilteredToolSlugs: row.toolProficiencyPoolFilteredToolSlugs,
  }
}

function toolChoiceFromPoolFormRow(
  choice: CharacterCreationProficienciesForm['tools'],
): ToolProficiencyPool | undefined {
  const row: ToolProficiencyPoolItemForm = {
    proficiencySource: 'pool',
    choose: choice.choose,
    poolSource: choice.poolSource,
    toolProficiencyPoolSlugs: choice.poolToolSlugs,
    toolProficiencyPoolCategories:
      choice.poolToolCategories as ToolProficiencyPoolItemForm['toolProficiencyPoolCategories'],
    toolProficiencyPoolFilteredToolSlugs: choice.poolFilteredToolSlugs,
  }
  const pool = toolProficiencyPoolFromFormRow(row)
  return isMeaningfulToolProficiencyPool(pool) ? pool : undefined
}

function readToolPoolFromStoredChoice(
  toolChoice: StoredToolChoice | undefined,
): ToolProficiencyPool | undefined {
  const legacyFrom = (toolChoice as { from?: string[] } | undefined)?.from
  if (toolChoice?.pool) return toolChoice.pool
  if (legacyFrom?.length) return { source: 'explicit', toolSlugs: legacyFrom }
  return undefined
}

function toolsToFormValues(
  toolChoice: StoredToolChoice | undefined,
): CharacterCreationProficienciesForm['tools'] {
  const toolPool = readToolPoolFromStoredChoice(toolChoice)
  return {
    label: toolChoice?.label ?? '',
    choose: toolChoice?.choose ?? 0,
    ...(toolPool ? toolChoiceToPoolFormRow(toolPool) : DEFAULT_TOOL_POOL_FORM),
  }
}

/** Maps stored character-creation proficiencies into flat form state (first choice only). */
export function characterCreationProficienciesToFormValues(
  characterCreation?: CharacterClass['characterCreation'],
): CharacterCreationProficienciesForm {
  const skillChoice = characterCreation?.proficiencies?.skills?.choices?.[0]

  return {
    skills: {
      choose: skillChoice?.choose ?? DEFAULT_SKILL_CHOICE_FORM.choose,
      from: skillChoice?.from ?? DEFAULT_SKILL_CHOICE_FORM.from,
    },
    tools: toolsToFormValues(characterCreation?.proficiencies?.tools?.choices?.[0]),
  }
}

/** Ephemeral defaults while authoring — omitted on save when not meaningful. */
export function characterCreationProficienciesDefaultValues(): CharacterCreationProficienciesForm {
  return characterCreationProficienciesToFormValues()
}

type CharacterCreationProficienciesInput = NonNullable<
  NonNullable<CreateClassInput['characterCreation']>['proficiencies']
>

function isMeaningfulSkillChoice(
  choice: { choose: number; from: string[] } | undefined,
): choice is { choose: number; from: string[] } {
  return Boolean(choice && choice.choose > 0 && choice.from.length > 0)
}

export function isMeaningfulCharacterCreationToolChoice(
  choice: CharacterCreationProficienciesForm['tools'] | undefined,
): choice is CharacterCreationProficienciesForm['tools'] {
  return Boolean(choice && choice.choose > 0 && toolChoiceFromPoolFormRow(choice))
}

function resolveToolChoiceLabel(
  choice: CharacterCreationProficienciesForm['tools'],
  entity?: CharacterClass,
): string | undefined {
  const trimmed = choice.label?.trim()
  if (trimmed) return trimmed

  const existingLabel = entity?.characterCreation?.proficiencies?.tools?.choices?.[0]?.label?.trim()
  if (existingLabel) return existingLabel

  const suggested = suggestToolProficiencyChoiceLabel(choice.poolToolCategories ?? [])
  return suggested || undefined
}

function skillChoicesFromForm(
  choice: CharacterCreationProficienciesForm['skills'] | undefined,
  entity?: CharacterClass,
): CharacterCreationProficienciesInput['skills'] | undefined {
  if (!isMeaningfulSkillChoice(choice)) return undefined
  const existingLabel = entity?.characterCreation?.proficiencies?.skills?.choices?.[0]?.label
  return {
    choices: [
      {
        id: 'class-skills',
        ...(existingLabel ? { label: existingLabel } : {}),
        choose: choice.choose,
        from: choice.from,
      },
    ],
  }
}

function toolChoicesFromForm(
  choice: CharacterCreationProficienciesForm['tools'] | undefined,
  entity?: CharacterClass,
): CharacterCreationProficienciesInput['tools'] | undefined {
  if (!isMeaningfulCharacterCreationToolChoice(choice)) return undefined
  const pool = toolChoiceFromPoolFormRow(choice)!
  const label = resolveToolChoiceLabel(choice, entity)
  return {
    choices: [
      {
        id: CHARACTER_CREATION_TOOL_CHOICE_ID,
        ...(label ? { label } : {}),
        choose: choice.choose,
        pool,
      },
    ],
  }
}

/** Persists skill and tool choices when meaningful; otherwise omits each bucket. */
export function characterCreationProficienciesFromFormValues(
  proficiencies: CharacterCreationProficienciesForm | undefined,
  entity?: CharacterClass,
): CharacterCreationProficienciesInput | undefined {
  const skills = skillChoicesFromForm(proficiencies?.skills, entity)
  const tools = toolChoicesFromForm(proficiencies?.tools, entity)
  if (!skills && !tools) return undefined
  return {
    ...(skills ? { skills } : {}),
    ...(tools ? { tools } : {}),
  }
}

/** Applies live form label override when synthesizing proficiency choices for linked-grant UI. */
export function characterCreationProficienciesWithLiveToolLabel(
  proficiencies: CharacterCreationProficienciesForm | undefined,
  entity?: CharacterClass,
): CharacterCreationProficienciesInput | undefined {
  const base = characterCreationProficienciesFromFormValues(proficiencies, entity)
  if (!base?.tools?.choices?.[0] || !proficiencies?.tools?.label?.trim()) return base

  return {
    ...base,
    tools: {
      choices: base.tools.choices.map((choice, index) =>
        index === 0 ? { ...choice, label: proficiencies.tools.label!.trim() } : choice,
      ),
    },
  }
}
