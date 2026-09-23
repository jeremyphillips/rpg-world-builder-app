import { useMemo, useState } from 'react'
import {
  emptyContentMediaSchema,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
} from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
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
import { Button } from '@rpg/ui'
import { MediaManager } from '@/features/media'

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
  const [mediaOpen, setMediaOpen] = useState(false)
  const media = draft.identity.media ?? emptyContentMediaSchema
  const mediaScope = useMemo(
    () =>
      context.characterKind === 'npc' &&
      'ownershipTarget' in context &&
      context.ownershipTarget.type === 'campaign'
        ? { kind: 'campaign-npc' as const, campaignId: context.ownershipTarget.campaignId }
        : 'ownershipTarget' in context &&
            'userId' in context.ownershipTarget &&
            typeof context.ownershipTarget.userId === 'string'
          ? { kind: 'user-pc' as const, userId: context.ownershipTarget.userId }
          : { kind: 'user-pc' as const, userId: 'current-user' },
    [context],
  )
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
        renderMediaManager: () => (
          <>
            <Button type="button" variant="outline" onClick={() => setMediaOpen(true)}>
              {media.images.length
                ? `${media.images.length} images · Manage images`
                : 'Add character images'}
            </Button>
            <MediaManager
              open={mediaOpen}
              onOpenChange={setMediaOpen}
              domain="character"
              value={media}
              scope={mediaScope}
              mode="form"
              onSave={({ media: nextMedia }) =>
                onDraftChange({ identity: { ...draft.identity, media: nextMedia } })
              }
            />
          </>
        ),
      }),
    [
      context,
      draft,
      media,
      mediaOpen,
      mediaScope,
      onDraftChange,
      onFormContinueValidationFailed,
      onStepComplete,
    ],
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
