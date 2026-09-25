import { useMemo } from 'react'
import { type CharacterBuildContext, type CharacterBuilderDraft } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import type { MediaScope } from '@rpg/contracts'
import { Form } from '@rpg/ui/form'

import {
  buildIdentityStepFormFields,
  identityFormSchema,
} from '../../../../lib/steps/identity-form-fields'
import type { IdentityFormValues } from '../../../../lib/steps/identity-form-fields'
import {
  identityDraftToFormValues,
  identityFormValuesToDraft,
} from '../../../../lib/steps/identity-form-values'
import { BUILDER_STEP_FORM_IDS } from '../../../../lib/steps/builder-step-form-ids'
import { BuilderFormContinueRegistration } from '../../builder-form-continue-registration'
import { IdentityDraftSync } from './identity-draft-sync'
import { IdentityNameField } from './identity-name-field'
import { IdentityNarrativeGenerateAction } from './identity-narrative-generate-action'
import { BuilderStepFrame } from '../shared/builder-step-frame'
import { ManagedMediaField } from '@/features/media'
import { useSession } from '@/features/auth'

export type IdentityStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
  onStepComplete: (patch: Partial<CharacterBuilderDraft>) => void
  onFormContinueValidationFailed: (patch: Partial<CharacterBuilderDraft>) => void
}

export function IdentityStep({
  context,
  draft,
  validationIssues,
  onDraftChange,
  onStepComplete,
  onFormContinueValidationFailed,
}: IdentityStepProps) {
  const { data: session } = useSession()
  const mediaScope = useMemo((): MediaScope | undefined => {
    if (
      context.characterKind === 'npc' &&
      'ownershipTarget' in context &&
      context.ownershipTarget.type === 'campaign'
    ) {
      return { kind: 'campaign-npc', campaignId: context.ownershipTarget.campaignId }
    }

    if (
      'ownershipTarget' in context &&
      'userId' in context.ownershipTarget &&
      typeof context.ownershipTarget.userId === 'string'
    ) {
      return { kind: 'user-pc', userId: context.ownershipTarget.userId }
    }

    const userId = session?.user.id
    return userId ? { kind: 'user-pc', userId } : undefined
  }, [context, session?.user.id])
  const fields = useMemo(
    () =>
      buildIdentityStepFormFields({
        renderNameField: () => <IdentityNameField buildContext={context} draft={draft} />,
        renderGenerateNarrative: () => (
          <IdentityNarrativeGenerateAction context={context} draft={draft} />
        ),
        renderDraftSync: () => (
          <IdentityDraftSync draftIdentity={draft.identity} onDraftChange={onDraftChange} />
        ),
        renderContinueRegistration: () => (
          <BuilderFormContinueRegistration<IdentityFormValues>
            stepId="identity"
            toDraftPatch={(values) => ({ identity: identityFormValuesToDraft(values) })}
            onStepComplete={onStepComplete}
            onContinueValidationFailed={onFormContinueValidationFailed}
          />
        ),
        renderMediaManager: () =>
          mediaScope ? (
            <ManagedMediaField
              config={{ domain: 'character', presentation: { layout: 'expanded' } }}
              scope={mediaScope}
              label="Character images"
            />
          ) : null,
      }),
    [context, draft, mediaScope, onDraftChange, onFormContinueValidationFailed, onStepComplete],
  )

  return (
    <BuilderStepFrame stepId="identity" validationIssues={validationIssues}>
      <Form
        id={BUILDER_STEP_FORM_IDS.identity}
        schema={identityFormSchema}
        fields={fields}
        defaultValues={identityDraftToFormValues(draft.identity)}
        mode="onChange"
        onSubmit={(values) => {
          onStepComplete({ identity: identityFormValuesToDraft(values) })
        }}
      />
    </BuilderStepFrame>
  )
}
