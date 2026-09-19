import {
  characterBuilderDependentChoiceMessages,
  DEPENDENT_CHOICE_KINDS,
  formatFieldMessage,
} from '@rpg/contracts'

/** Internal kind label for species heritage dependent choices. */
export const DEPENDENT_KIND_HERITAGE = DEPENDENT_CHOICE_KINDS.heritage

/** Sheet and panel affordance for revisiting species heritage choices. */
export const CHANGE_HERITAGE_LABEL = formatFieldMessage(
  characterBuilderDependentChoiceMessages.changeHeritage(),
)

// Future subclass step:
// export const DEPENDENT_KIND_SUBCLASS = DEPENDENT_CHOICE_KINDS.subclass
// export const CHANGE_SUBCLASS_LABEL = formatFieldMessage(
//   characterBuilderDependentChoiceMessages.changeSubclass(),
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
}: ParentChoiceTitleMetaInput): string | undefined {
  if (selectedOptionLabel) {
    return formatFieldMessage(
      characterBuilderDependentChoiceMessages.parentChoiceSelected({
        selectedOptionLabel,
        kind: dependentKindLabel,
      }),
    )
  }

  if (required) {
    return formatFieldMessage(
      characterBuilderDependentChoiceMessages.parentChoiceRequired({ kind: dependentKindLabel }),
    )
  }

  return undefined
}
