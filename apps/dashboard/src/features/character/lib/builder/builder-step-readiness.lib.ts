import type { BuilderStepReadinessState, ProficiencyStepSection } from '@rpg/contracts'

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
  sections: readonly ProficiencyStepSection[],
  classDependentBlocked: boolean | undefined,
): ProficiencyStepSection[] {
  if (!classDependentBlocked) return [...sections]
  return sections.filter((section) => section.kind === 'languages')
}
