import * as React from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  ArrayAddActionInterceptProvider,
  getArrayFieldMutators,
  useRelationshipFieldContext,
  type ArrayAddActionInterceptRegistry,
} from '@rpg/ui/form'

import {
  CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY,
  CHARACTER_RESIDENCE_VOCABULARY,
} from '../../lib/relationship/character-relationship-vocabulary'
import { characterOrganizationMembershipRelationshipAdapter } from '../../lib/relationship/character-organization-membership-relationship.adapter'
import { characterResidenceRelationshipAdapter } from '../../lib/relationship/character-residence-relationship.adapter'
import { CHARACTER_RELATIONSHIP_VOCABULARY_CONFIG } from '../../lib/relationship/character-relationship-vocabulary-config'
import type { OrganizationMembershipSelection } from '../connections/picker/organization-picker-drawer.types'
import type { ResidenceLocationSelection } from '../connections/picker/residence-location-picker-drawer.types'
import type { CharacterRelationshipFieldContext } from '../../lib/relationship/character-relationship-field-context.types'
import type { CharacterRelationshipVocabulary } from '../../lib/relationship/character-relationship-vocabulary'

type CharacterRelationshipPickerOpenContextValue = {
  openVocabulary: CharacterRelationshipVocabulary | null
  setOpenVocabulary: React.Dispatch<React.SetStateAction<CharacterRelationshipVocabulary | null>>
}

const CharacterRelationshipPickerOpenContext =
  React.createContext<CharacterRelationshipPickerOpenContextValue | null>(null)

function useCharacterRelationshipPickerOpen(): CharacterRelationshipPickerOpenContextValue {
  const value = React.useContext(CharacterRelationshipPickerOpenContext)
  if (!value) {
    throw new Error(
      'useCharacterRelationshipPickerOpen must be used within CharacterRelationshipArrayAddInterceptProvider',
    )
  }
  return value
}

type CharacterRelationshipArrayAddInterceptProviderProps = {
  children: React.ReactNode
}

function CharacterRelationshipPickerBridge({
  vocabulary,
}: {
  vocabulary: CharacterRelationshipVocabulary
}) {
  const { context } = useRelationshipFieldContext()
  const relationshipContext = context as CharacterRelationshipFieldContext
  const { openVocabulary, setOpenVocabulary } = useCharacterRelationshipPickerOpen()
  const { control } = useFormContext()
  const config = CHARACTER_RELATIONSHIP_VOCABULARY_CONFIG[vocabulary]
  const adapter =
    vocabulary === CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY
      ? characterOrganizationMembershipRelationshipAdapter
      : characterResidenceRelationshipAdapter
  const items = useWatch({ control, name: config.fieldName }) ?? []

  const handleAdd = React.useCallback(
    async (selection: unknown) => {
      const edge =
        vocabulary === CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY
          ? characterOrganizationMembershipRelationshipAdapter.createEdge(
              selection as OrganizationMembershipSelection,
              items,
              relationshipContext,
            )
          : characterResidenceRelationshipAdapter.createEdge(
              selection as ResidenceLocationSelection,
              items,
              relationshipContext,
            )
      const mutators = getArrayFieldMutators(control as never, config.fieldName)
      if (vocabulary === CHARACTER_RESIDENCE_VOCABULARY) {
        const current = mutators?.getValues() ?? []
        for (let index = current.length - 1; index >= 0; index -= 1) {
          mutators?.remove(index)
        }
      }
      mutators?.append(edge as Record<string, unknown>)
      setOpenVocabulary(null)
    },
    [config.fieldName, control, items, relationshipContext, setOpenVocabulary, vocabulary],
  )

  return adapter.renderPicker({
    open: openVocabulary === vocabulary,
    onOpenChange: (open) => setOpenVocabulary(open ? vocabulary : null),
    items,
    onAdd: handleAdd,
    context: relationshipContext,
  })
}

/** Wires picker-driven inline array add actions for character relationship fields. */
export function CharacterRelationshipArrayAddInterceptProvider({
  children,
}: CharacterRelationshipArrayAddInterceptProviderProps) {
  const [openVocabulary, setOpenVocabulary] =
    React.useState<CharacterRelationshipVocabulary | null>(null)

  const intercepts = React.useMemo<ArrayAddActionInterceptRegistry>(
    () => ({
      [CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY]: {
        onSelect: () => setOpenVocabulary(CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY),
      },
      [CHARACTER_RESIDENCE_VOCABULARY]: {
        onSelect: () => setOpenVocabulary(CHARACTER_RESIDENCE_VOCABULARY),
      },
    }),
    [],
  )

  const pickerOpenValue = React.useMemo(
    () => ({ openVocabulary, setOpenVocabulary }),
    [openVocabulary],
  )

  return (
    <ArrayAddActionInterceptProvider registry={intercepts}>
      <CharacterRelationshipPickerOpenContext.Provider value={pickerOpenValue}>
        {children}
      </CharacterRelationshipPickerOpenContext.Provider>
    </ArrayAddActionInterceptProvider>
  )
}

/** Mount inside the connections `<Form>` so picker bridges can access RHF context. */
export function CharacterRelationshipPickerBridges() {
  return (
    <>
      <CharacterRelationshipPickerBridge
        vocabulary={CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY}
      />
      <CharacterRelationshipPickerBridge vocabulary={CHARACTER_RESIDENCE_VOCABULARY} />
    </>
  )
}
