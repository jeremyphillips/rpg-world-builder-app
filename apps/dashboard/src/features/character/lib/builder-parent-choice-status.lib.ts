import {
  characterBuilderDependentChoiceMessages,
  DEPENDENT_CHOICE_KINDS,
  formatFieldMessage,
} from '@rpg/contracts'

/** Internal kind label for species heritage dependent choices. */
export const DEPENDENT_KIND_HERITAGE = DEPENDENT_CHOICE_KINDS.heritage

/** Sheet/manage affordance for species heritage choices. */
export const MANAGE_HERITAGE_LABEL = formatFieldMessage(
  characterBuilderDependentChoiceMessages.manageHeritage(),
)

// Future subclass step:
// export const DEPENDENT_KIND_SUBCLASS = DEPENDENT_CHOICE_KINDS.subclass
// export const MANAGE_SUBCLASS_LABEL = formatFieldMessage(
//   characterBuilderDependentChoiceMessages.manageSubclass(),
// )

export type ParentChoiceTitleMetaInput = {
  dependentKindLabel: string
  required: boolean
  selectedOptionLabel?: string
}

/** Inline muted copy after a parent choice title, e.g. `Heritage required` or `Drow heritage`. */
export function formatParentChoiceTitleMeta({
  dependentKindLabel,
  required,
  selectedOptionLabel,
}: ParentChoiceTitleMetaInput): string {
  if (required || !selectedOptionLabel) {
    return formatFieldMessage(
      characterBuilderDependentChoiceMessages.parentChoiceRequired({ kind: dependentKindLabel }),
    )
  }

  return formatFieldMessage(
    characterBuilderDependentChoiceMessages.parentChoiceSelected({
      selectedOptionLabel,
      kind: dependentKindLabel,
    }),
  )
}
