import {
  ABILITY_IDS,
  isSpellcastingActiveAtLevel,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterBuildPreview,
  type CharacterBuildContext,
  type ChoiceSet,
} from '@rpg/contracts'
import type {
  CharacterBuilderStepId,
  CharacterBuildValidationIssue,
} from '@rpg/contracts/rpg/character-builder'
import type {
  PreviewRailFact,
  PreviewRailSectionMarker,
  PreviewRailStatusPanelVariant,
  PreviewRailStatusTone,
} from '@rpg/ui'

import {
  BUILDER_PREVIEW_INCOMPLETE_BODY,
  BUILDER_PREVIEW_INCOMPLETE_TITLE,
  BUILDER_PREVIEW_READY_BODY,
  BUILDER_PREVIEW_READY_TITLE,
  builderPreviewAttentionTitle,
} from './builder-preview-rail-copy'
import {
  CHARACTER_BUILDER_PREVIEW_SECTIONS,
  getBuilderDraftNarrative,
  type CharacterBuilderPreviewSectionId,
} from './character-builder-preview-panel.lib'
import { getNarrativePreviewStatusLabel, narrativeFieldCount } from './narrative-preview'
import {
  getPreviewAlignmentLine,
  getPreviewIdentityName,
  getPreviewLevelClassLine,
  getPreviewSpeciesLine,
} from './preview-identity-summary'

export type BuilderPreviewSectionPresentation = {
  id: CharacterBuilderPreviewSectionId
  label: string
  marker: PreviewRailSectionMarker
  status?: string
  statusTone?: PreviewRailStatusTone
  expandable: boolean
}

export type BuilderPreviewRailFooterPanel = {
  variant: PreviewRailStatusPanelVariant
  title: string
  description?: string
}

export type BuilderPreviewRailIdentity = {
  name: string
  statusLine: string
  facts: PreviewRailFact[]
}

export type BuilderPreviewRailProjection = {
  identity: BuilderPreviewRailIdentity
  sections: BuilderPreviewSectionPresentation[]
  openSectionId: CharacterBuilderPreviewSectionId
  footerPanel: BuilderPreviewRailFooterPanel
  hasCharacterClass: boolean
  spellcastingActive: boolean
  narrativeCount: number
}

const PREVIEW_SECTION_LABELS: Record<CharacterBuilderPreviewSectionId, string> = {
  narrative: 'Narrative',
  combat: 'Combat',
  abilities: 'Abilities',
  proficiencies: 'Proficiencies',
  equipment: 'Equipment',
  spells: 'Spells',
}

const STEP_TO_PREVIEW_SECTION = {
  identity: 'narrative',
  connections: 'narrative',
  species: 'combat',
  class: 'combat',
  abilities: 'abilities',
  proficiencies: 'proficiencies',
  equipment: 'equipment',
  spells: 'spells',
} as const satisfies Record<
  Exclude<CharacterBuilderStepId, 'review'>,
  CharacterBuilderPreviewSectionId
>

function isCombatReady(preview: CharacterBuildPreview): boolean {
  return (
    preview.maxHp !== undefined &&
    preview.ac !== undefined &&
    preview.proficiencyBonus !== undefined
  )
}

function areAbilityScoresReady(preview: CharacterBuildPreview): boolean {
  return ABILITY_IDS.every((ability) => preview.abilityScores[ability]?.score !== undefined)
}

function resolveReviewOpenSection(
  sections: BuilderPreviewSectionPresentation[],
): CharacterBuilderPreviewSectionId {
  const firstIncomplete = sections.find((section) => section.marker === 'incomplete')
  return firstIncomplete?.id ?? sections[sections.length - 1]!.id
}

export function resolveBuilderPreviewOpenSection(
  currentStepId: CharacterBuilderStepId,
  manualSection: {
    forStepId: CharacterBuilderStepId
    value: CharacterBuilderPreviewSectionId
  } | null,
  sections: BuilderPreviewSectionPresentation[],
): CharacterBuilderPreviewSectionId {
  if (currentStepId === 'review') {
    if (manualSection?.forStepId === 'review') {
      return manualSection.value
    }
    return resolveReviewOpenSection(sections)
  }

  if (manualSection?.forStepId === currentStepId) {
    return manualSection.value
  }

  return STEP_TO_PREVIEW_SECTION[currentStepId]
}

function resolveNarrativePresentation(narrativeCount: number): BuilderPreviewSectionPresentation {
  return {
    id: 'narrative',
    label: PREVIEW_SECTION_LABELS.narrative,
    marker: narrativeCount > 0 ? 'ready' : 'incomplete',
    status: getNarrativePreviewStatusLabel(narrativeCount),
    expandable: narrativeCount > 0,
  }
}

function resolveCombatPresentation(
  preview: CharacterBuildPreview,
): BuilderPreviewSectionPresentation {
  const ready = isCombatReady(preview)

  return {
    id: 'combat',
    label: PREVIEW_SECTION_LABELS.combat,
    marker: ready ? 'ready' : 'incomplete',
    ...(ready ? { status: 'Ready', statusTone: 'success' as const } : {}),
    expandable: ready,
  }
}

function resolveAbilitiesPresentation(
  preview: CharacterBuildPreview,
): BuilderPreviewSectionPresentation {
  const ready = areAbilityScoresReady(preview)

  return {
    id: 'abilities',
    label: PREVIEW_SECTION_LABELS.abilities,
    marker: ready ? 'ready' : 'incomplete',
    ...(ready ? { status: 'Ready', statusTone: 'success' as const } : {}),
    expandable: ABILITY_IDS.some((ability) => preview.abilityScores[ability]?.score !== undefined),
  }
}

function resolveProficienciesPresentation(
  hasCharacterClass: boolean,
): BuilderPreviewSectionPresentation {
  if (!hasCharacterClass) {
    return {
      id: 'proficiencies',
      label: PREVIEW_SECTION_LABELS.proficiencies,
      marker: 'off',
      status: 'Off',
      expandable: true,
    }
  }

  return {
    id: 'proficiencies',
    label: PREVIEW_SECTION_LABELS.proficiencies,
    marker: 'incomplete',
    expandable: true,
  }
}

function resolveEquipmentPresentation(
  preview: CharacterBuildPreview,
  hasCharacterClass: boolean,
): BuilderPreviewSectionPresentation {
  if (!hasCharacterClass) {
    return {
      id: 'equipment',
      label: PREVIEW_SECTION_LABELS.equipment,
      marker: 'off',
      status: 'Off',
      expandable: true,
    }
  }

  if (preview.equipmentSummary.length > 0) {
    return {
      id: 'equipment',
      label: PREVIEW_SECTION_LABELS.equipment,
      marker: 'ready',
      status: 'Ready',
      statusTone: 'success',
      expandable: true,
    }
  }

  return {
    id: 'equipment',
    label: PREVIEW_SECTION_LABELS.equipment,
    marker: 'incomplete',
    status: 'Nothing selected yet.',
    expandable: true,
  }
}

function resolveSpellsPresentation(spellcastingActive: boolean): BuilderPreviewSectionPresentation {
  if (!spellcastingActive) {
    return {
      id: 'spells',
      label: PREVIEW_SECTION_LABELS.spells,
      marker: 'off',
      status: 'Off',
      expandable: false,
    }
  }

  return {
    id: 'spells',
    label: PREVIEW_SECTION_LABELS.spells,
    marker: 'incomplete',
    expandable: false,
  }
}

export function resolveBuilderPreviewRailFooterPanel(
  canCreateCharacter: boolean,
  validationVisibleStepIds: readonly CharacterBuilderStepId[],
  validationIssues: readonly CharacterBuildValidationIssue[],
): BuilderPreviewRailFooterPanel {
  if (canCreateCharacter) {
    return {
      variant: 'success',
      title: BUILDER_PREVIEW_READY_TITLE,
      description: BUILDER_PREVIEW_READY_BODY,
    }
  }

  const visibleIssueCount = validationIssues.filter(
    (issue) => issue.stepId && validationVisibleStepIds.includes(issue.stepId),
  ).length

  if (validationVisibleStepIds.length > 0 && visibleIssueCount > 0) {
    return {
      variant: 'warning',
      title: builderPreviewAttentionTitle(visibleIssueCount),
    }
  }

  return {
    variant: 'default',
    title: BUILDER_PREVIEW_INCOMPLETE_TITLE,
    description: BUILDER_PREVIEW_INCOMPLETE_BODY,
  }
}

function resolveBuilderPreviewSections(
  preview: CharacterBuildPreview,
  narrativeCount: number,
  hasCharacterClass: boolean,
  spellcastingActive: boolean,
): BuilderPreviewSectionPresentation[] {
  return [
    resolveNarrativePresentation(narrativeCount),
    resolveCombatPresentation(preview),
    resolveAbilitiesPresentation(preview),
    resolveProficienciesPresentation(hasCharacterClass),
    resolveEquipmentPresentation(preview, hasCharacterClass),
    resolveSpellsPresentation(spellcastingActive),
  ]
}

export type ProjectBuilderPreviewRailArgs = {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  preview: CharacterBuildPreview | null
  resolvedChoiceSets: readonly ChoiceSet[] | null
  currentStepId: CharacterBuilderStepId
  manualOpenSection: {
    forStepId: CharacterBuilderStepId
    value: CharacterBuilderPreviewSectionId
  } | null
  canCreateCharacter: boolean
  validationVisibleStepIds: readonly CharacterBuilderStepId[]
  validationIssues: readonly CharacterBuildValidationIssue[]
}

export function projectBuilderPreviewRail({
  draft,
  catalogIndex,
  preview,
  currentStepId,
  manualOpenSection,
  canCreateCharacter,
  validationVisibleStepIds,
  validationIssues,
}: ProjectBuilderPreviewRailArgs): BuilderPreviewRailProjection | null {
  if (!preview) {
    return null
  }

  const narrative = getBuilderDraftNarrative(draft)
  const narrativeCount = narrativeFieldCount(narrative)
  const characterClass = draft.class.classId
    ? catalogIndex.classes.get(draft.class.classId)
    : undefined
  const hasCharacterClass = characterClass !== undefined
  const spellcastingActive =
    characterClass !== undefined &&
    isSpellcastingActiveAtLevel(characterClass.spellcasting, draft.class.level)

  const sections = resolveBuilderPreviewSections(
    preview,
    narrativeCount,
    hasCharacterClass,
    spellcastingActive,
  )

  return {
    identity: {
      name: getPreviewIdentityName(draft),
      statusLine: getPreviewLevelClassLine(draft, catalogIndex),
      facts: [
        { label: 'Species', value: getPreviewSpeciesLine(draft, catalogIndex) },
        { label: 'Alignment', value: getPreviewAlignmentLine(draft) },
      ],
    },
    sections,
    openSectionId: resolveBuilderPreviewOpenSection(currentStepId, manualOpenSection, sections),
    footerPanel: resolveBuilderPreviewRailFooterPanel(
      canCreateCharacter,
      validationVisibleStepIds,
      validationIssues,
    ),
    hasCharacterClass,
    spellcastingActive,
    narrativeCount,
  }
}

export { CHARACTER_BUILDER_PREVIEW_SECTIONS, STEP_TO_PREVIEW_SECTION }
