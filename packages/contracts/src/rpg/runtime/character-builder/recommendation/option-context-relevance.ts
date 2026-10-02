import type {
  ActiveChoiceContext,
  OptionContextRelevance,
  OptionRequirement,
  OptionState,
} from './recommendation-envelope'

/** Derived from option state and the task the user is doing. Never stored on the recommendation. */
export function resolveOptionContextRelevance(args: {
  state: OptionState
  requirements?: readonly OptionRequirement[]
  activeChoice?: ActiveChoiceContext
}): OptionContextRelevance {
  const activeChoice = args.activeChoice ?? { kind: 'none' }
  if (activeChoice.kind === 'none' || activeChoice.kind === 'allowance') return 'none'
  if (activeChoice.kind === 'requirement') {
    return relevanceForRequirementContext(args.requirements, activeChoice.requirementId)
  }
  return relevanceForChoiceContext(args.state.choice, activeChoice)
}

function relevanceForRequirementContext(
  requirements: readonly OptionRequirement[] | undefined,
  requirementId: string,
): OptionContextRelevance {
  const match = requirements?.find(
    (requirement) =>
      requirement.requirementId === requirementId && requirement.role === 'candidate',
  )
  return match ? 'activeTarget' : 'none'
}

function relevanceForChoiceContext(
  choice: OptionState['choice'],
  activeChoice: Extract<ActiveChoiceContext, { kind: 'pool' | 'package' }>,
): OptionContextRelevance {
  if (!choice) return 'none'
  if (activeChoice.kind === 'pool') {
    return matchesOpenPool(choice, activeChoice.choiceSetId) ? 'activeTarget' : 'none'
  }
  if (matchesOpenPool(choice, activeChoice.choiceSetId)) return 'activeTarget'
  return choice.inSelectedPackage ? 'related' : 'none'
}

function matchesOpenPool(choice: NonNullable<OptionState['choice']>, choiceSetId: string): boolean {
  return choice.inOpenPool && choice.choiceSetId === choiceSetId
}
