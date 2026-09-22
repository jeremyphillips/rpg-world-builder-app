import { useMemo } from 'react'

import type { CharacterBuildContext, CharacterBuilderDraft } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Form, useRelationshipFieldContext, type FormItem } from '@rpg/ui/form'

import {
  buildConnectionsStepFormFields,
  connectionsFormSchema,
} from '../../../../lib/steps/connections-form-fields'
import { connectionsDraftToFormValues } from '../../../../lib/steps/connections-form-values'
import { CharacterRelationshipFormProvider } from '../../../../lib/relationship/character-relationship-field-registry'
import type { CharacterRelationshipFieldContext } from '../../../../lib/relationship/character-relationship-field-context.types'
import { BuilderStepFrame } from '../shared/builder-step-frame'
import { ConnectionsDraftSync } from './connections-draft-sync'

export type ConnectionsStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

type ConnectionsStepFormProps = {
  draft: CharacterBuilderDraft
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

function ConnectionsStepForm({ draft, onDraftChange }: ConnectionsStepFormProps) {
  const { context } = useRelationshipFieldContext()
  const relationshipContext = context as CharacterRelationshipFieldContext

  const fields = useMemo(
    (): FormItem[] =>
      buildConnectionsStepFormFields({
        relationshipContext,
        renderDraftSync: () => (
          <ConnectionsDraftSync
            draftRelationshipEdges={draft.relationshipEdges}
            onDraftChange={onDraftChange}
          />
        ),
      }),
    [draft.relationshipEdges, onDraftChange, relationshipContext],
  )

  return (
    <Form
      schema={connectionsFormSchema}
      fields={fields}
      defaultValues={connectionsDraftToFormValues(draft.relationshipEdges)}
      mode="onChange"
      onSubmit={() => undefined}
    />
  )
}

export function ConnectionsStep({
  context,
  draft,
  validationIssues,
  onDraftChange,
}: ConnectionsStepProps) {
  return (
    <BuilderStepFrame stepId="connections" validationIssues={validationIssues}>
      <CharacterRelationshipFormProvider buildContext={context}>
        <ConnectionsStepForm draft={draft} onDraftChange={onDraftChange} />
      </CharacterRelationshipFormProvider>
    </BuilderStepFrame>
  )
}
