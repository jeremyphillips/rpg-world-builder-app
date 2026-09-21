import type {
  BuilderStepReadinessState,
  CharacterBuilderDraft,
  ProficiencyInteractiveSection,
  ProficiencyStepModel,
} from '@rpg/contracts'

export function isBuilderStepBlockedNoClass(
  readiness: Pick<BuilderStepReadinessState, 'readiness'>,
  draft: Pick<CharacterBuilderDraft, 'class'>,
): boolean {
  return readiness.readiness === 'blocked' && !draft.class.classId
}

export function isBuilderStepReadinessMessageOnly(
  state: BuilderStepReadinessState,
  options?: { equipmentSkipped?: boolean },
): boolean {
  if (state.readiness === 'notApplicable' || state.readiness === 'readyEmpty') return true
  if (state.readiness === 'blocked' && !state.classDependentBlocked) return true
  if (state.readiness === 'complete' && options?.equipmentSkipped) return true
  return false
}

export function showsBuilderStepReviewMessage(state: BuilderStepReadinessState): boolean {
  return state.readiness === 'complete' && Boolean(state.message) && !state.classDependentBlocked
}

export function visibleProficiencySections(
  sections: readonly ProficiencyInteractiveSection[],
  classDependentBlocked: boolean | undefined,
): ProficiencyInteractiveSection[] {
  if (!classDependentBlocked) return [...sections]
  return sections.filter((section) => section.kind === 'languages')
}

export function visibleProficiencyFixedGrants(
  fixedGrants: ProficiencyStepModel['fixedGrants'],
  classDependentBlocked: boolean | undefined,
): ProficiencyStepModel['fixedGrants'] {
  if (!classDependentBlocked) return [...fixedGrants]
  return []
}

export function resolveVisibleProficiencyStepContent(
  model: Pick<ProficiencyStepModel, 'fixedGrants' | 'sections'>,
  classDependentBlocked: boolean | undefined,
): Pick<ProficiencyStepModel, 'fixedGrants' | 'sections'> {
  return {
    fixedGrants: visibleProficiencyFixedGrants(model.fixedGrants, classDependentBlocked),
    sections: visibleProficiencySections(model.sections, classDependentBlocked),
  }
}
