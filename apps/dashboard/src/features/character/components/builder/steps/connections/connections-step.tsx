import { useMemo } from 'react'

import type { CharacterBuildContext, CharacterBuilderDraft } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Form } from '@rpg/ui/form'

import {
  buildConnectionsStepFormFields,
  connectionsFormSchema,
} from '../../../../lib/steps/connections-form-fields'
import { connectionsDraftToFormValues } from '../../../../lib/steps/connections-form-values'
import { CharacterRelationshipFormProvider } from '../../../../lib/relationship/character-relationship-field-registry'
import { BuilderStepFrame } from '../shared/builder-step-frame'
import { ConnectionsDraftSync } from './connections-draft-sync'

export type ConnectionsStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

export function ConnectionsStep({
  context,
  draft,
  validationIssues,
  onDraftChange,
}: ConnectionsStepProps) {
  const fields = useMemo(
    () =>
      buildConnectionsStepFormFields({
        renderDraftSync: () => (
          <ConnectionsDraftSync
            draftConnections={draft.connections}
            onDraftChange={onDraftChange}
          />
        ),
      }),
    [draft.connections, onDraftChange],
  )

  return (
    <BuilderStepFrame stepId="connections" validationIssues={validationIssues}>
      <CharacterRelationshipFormProvider buildContext={context}>
        <Form
          schema={connectionsFormSchema}
          fields={fields}
          defaultValues={connectionsDraftToFormValues(draft.connections)}
          mode="onChange"
          onSubmit={() => undefined}
        />
      </CharacterRelationshipFormProvider>
    </BuilderStepFrame>
  )
}
