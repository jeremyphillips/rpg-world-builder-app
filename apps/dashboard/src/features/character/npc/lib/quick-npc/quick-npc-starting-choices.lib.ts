import {
  createEmptyCharacterBuilderDraft,
  getNpcTemplateEntry,
  indexCharacterBuildCatalog,
  isClassProgressionApplicable,
  npcStartingChoiceAllowanceIds,
  pruneNpcStartingChoiceOverrides,
  resolveAvailableChoices,
  resolveNpcStartingChoices,
  type CharacterBuildContext,
  type NpcStartingChoiceEntry,
  type NpcStartingChoiceKind,
  type NpcStartingChoices,
} from '@rpg/contracts'

import type { QuickNpcCreateContext } from './quick-npc-create-context'
import type { QuickNpcSetupValues } from './quick-npc-form-fields'
import {
  buildQuickNpcAutomaticPreferences,
  resolveQuickNpcTemplateRecommendations,
} from './quick-npc-template-recommendations.lib'

const KIND_LABELS: Record<NpcStartingChoiceKind, string> = {
  skill: 'Skills',
  tool: 'Tools',
  language: 'Languages',
  equipment: 'Equipment',
  weapon: 'Weapons',
  spell: 'Spells',
}

const KIND_NOUNS: Record<NpcStartingChoiceKind, { one: string; many: string }> = {
  skill: { one: 'skill', many: 'skills' },
  tool: { one: 'tool', many: 'tools' },
  language: { one: 'language', many: 'languages' },
  equipment: { one: 'item', many: 'items' },
  weapon: { one: 'weapon', many: 'weapons' },
  spell: { one: 'spell', many: 'spells' },
}

export function startingChoiceKindLabel(kind: NpcStartingChoiceKind): string {
  return KIND_LABELS[kind]
}

function ownerPhrase(entry: NpcStartingChoiceEntry): string | undefined {
  const label = entry.provenance.ownerLabel
  if (!label) return undefined
  if (entry.provenance.ownerKind === 'npcTemplate') return `${label} role`
  if (entry.provenance.ownerKind === 'class') return `${label} class`
  return label
}

export function formatStartingChoiceProvenance(entry: NpcStartingChoiceEntry): string {
  if (entry.ownership === 'manual') return 'Added manually'
  const owner = ownerPhrase(entry)
  if (entry.ownership === 'fixed-grant') {
    return owner ? `Granted by ${owner}` : 'Granted'
  }
  const required = entry.allowance?.required ?? entry.selectedIds.length
  const noun = required === 1 ? KIND_NOUNS[entry.kind].one : KIND_NOUNS[entry.kind].many
  const count = `${required} ${noun}`
  if (!entry.overridden && entry.provenance.suggestionOwnerLabel) {
    return `${count} · Suggested by ${entry.provenance.suggestionOwnerLabel} role`
  }
  return owner ? `${count} · ${owner}` : count
}

export type StartingChoiceCategory = {
  kind: NpcStartingChoiceKind
  label: string
  entries: readonly NpcStartingChoiceEntry[]
  canChange: boolean
}

export function groupStartingChoicesByKind(choices: NpcStartingChoices): StartingChoiceCategory[] {
  const order: NpcStartingChoiceKind[] = [
    'skill',
    'tool',
    'language',
    'equipment',
    'weapon',
    'spell',
  ]
  return order.flatMap((kind) => {
    const entries = choices.entries.filter((entry) => entry.kind === kind)
    if (entries.length === 0) return []
    return [
      {
        kind,
        label: KIND_LABELS[kind],
        entries,
        canChange: entries.some((entry) => entry.editable),
      },
    ]
  })
}

function preferenceArgs(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
  createContext: QuickNpcCreateContext
}) {
  const organization =
    args.createContext.kind === 'organization-member' ? args.createContext.organization : undefined
  return {
    values: args.setup,
    context: args.context,
    titles: organization?.members?.titles ?? [],
    organizationClassAffinityIds: organization?.members?.classAffinityIds,
    organizationTemplateId: organization?.members?.npcTemplateId,
  }
}

export function resolveQuickNpcStartingChoices(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
  createContext: QuickNpcCreateContext
  startingChoiceOverrides?: Record<string, readonly string[]>
  requiredWeaponIds?: readonly string[]
  requiredSpellIds?: readonly string[]
}): NpcStartingChoices {
  const shared = preferenceArgs(args)
  const preferences = buildQuickNpcAutomaticPreferences(shared)
  const recommendations = resolveQuickNpcTemplateRecommendations({
    ...shared,
    lockInUserClass: true,
  })
  const templateLabel = recommendations.npcTemplateId
    ? getNpcTemplateEntry(recommendations.npcTemplateId)?.label
    : undefined

  return resolveNpcStartingChoices({
    context: args.context,
    seed: {
      speciesId: args.setup.speciesId,
      ...(args.setup.classId ? { classId: args.setup.classId } : {}),
      level: args.setup.level,
      ...(args.setup.npcTemplateId ? { npcTemplateId: args.setup.npcTemplateId } : {}),
    },
    startingChoiceOverrides: args.startingChoiceOverrides,
    requiredWeaponIds: args.requiredWeaponIds,
    requiredSpellIds: args.requiredSpellIds,
    preferences,
    ...(templateLabel ? { suggestionOwnerLabel: templateLabel } : {}),
  })
}

export function pruneQuickNpcStartingChoiceOverrides(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
  createContext: QuickNpcCreateContext
  overrides: Record<string, readonly string[]>
}): Record<string, string[]> {
  const choices = resolveQuickNpcStartingChoices({
    ...args,
    startingChoiceOverrides: {},
    requiredWeaponIds: [],
    requiredSpellIds: [],
  })
  return pruneNpcStartingChoiceOverrides(
    args.overrides,
    new Set(npcStartingChoiceAllowanceIds(choices)),
  )
}

export function startingChoiceLabels(args: {
  context: CharacterBuildContext
  setup: QuickNpcSetupValues
  ids: readonly string[]
}): string[] {
  const catalog = indexCharacterBuildCatalog(args.context.catalog)
  const draft = {
    ...createEmptyCharacterBuilderDraft(),
    species: { speciesId: args.setup.speciesId },
    class: {
      ...(args.setup.classId && isClassProgressionApplicable(args.setup.level)
        ? { classId: args.setup.classId }
        : {}),
      level: args.setup.level,
    },
    ...(args.setup.npcTemplateId ? { npcTemplateId: args.setup.npcTemplateId } : {}),
  }
  const optionLabels = new Map<string, string>()
  for (const choiceSet of resolveAvailableChoices(draft, args.context)) {
    for (const option of choiceSet.options) optionLabels.set(option.id, option.label)
  }

  return args.ids.map((id) => {
    return (
      optionLabels.get(id) ??
      catalog.equipment.get(id)?.name ??
      catalog.skillProficiencies.get(id)?.name ??
      args.context.catalog.languages.find((language) => language.id === id)?.label ??
      id
    )
  })
}

export function allowancePickerOptions(args: {
  context: CharacterBuildContext
  setup: QuickNpcSetupValues
  choiceSetId: string
  selectedIds: readonly string[]
}): { value: string; label: string }[] {
  const draft = {
    ...createEmptyCharacterBuilderDraft(),
    species: { speciesId: args.setup.speciesId },
    class: {
      ...(args.setup.classId && isClassProgressionApplicable(args.setup.level)
        ? { classId: args.setup.classId }
        : {}),
      level: args.setup.level,
    },
    ...(args.setup.npcTemplateId ? { npcTemplateId: args.setup.npcTemplateId } : {}),
  }
  const choiceSet = resolveAvailableChoices(draft, args.context).find(
    (entry) => entry.id === args.choiceSetId,
  )
  const selected = new Set(args.selectedIds)
  return (choiceSet?.options ?? [])
    .filter((option) => !selected.has(option.id))
    .map((option) => ({ value: option.id, label: option.label }))
}
