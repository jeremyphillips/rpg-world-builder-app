'use client'

import * as React from 'react'

import {
  resolveOrganizationMembershipMetadata,
  type CampaignNpcDetail,
  type CharacterBuildContext,
  type OrganizationKind,
} from '@rpg/contracts'
import { Button } from '@rpg/ui'
import { Form, FormFooterActions } from '@rpg/ui/form'

import { useSubmitHandler } from '@/lib/use-submit-handler'

import { titleFromMembershipRadioValue } from '../../components/connections/organization-membership-title-field.lib'
import { useCreateNpc } from '../hooks/use-create-npc'
import { buildQuickNpcCreateInput, formatQuickNpcCreationError } from '../lib/quick-npc-create'
import {
  buildQuickNpcContentOptions,
  buildQuickNpcFormFields,
  buildQuickNpcSeed,
  quickNpcFormDefaultValues,
  quickNpcFormSchema,
  resolveQuickNpcMaxLevel,
  type QuickNpcFormValues,
} from '../lib/quick-npc-form-fields'

export const QUICK_NPC_CREATE_TITLE = 'Create NPC'
export const QUICK_NPC_CREATE_SUBMIT_LABEL = 'Create NPC'
export const QUICK_NPC_CREATE_BACK_LABEL = 'Back'
export const QUICK_NPC_CREATE_FALLBACK_ERROR = 'Could not create this NPC.'

export type QuickNpcCreateFormOrganization = {
  id: string
  name: string
  organizationKind: OrganizationKind
  organizationSubtype?: string
}

export type QuickNpcCreateFormProps = {
  campaignId: string
  /** Resolved campaign NPC build context — pass from the host feature's existing hook. */
  buildContext: CharacterBuildContext
  organization: QuickNpcCreateFormOrganization
  /** Per-session values restored when returning from the picker view. */
  initialValues?: QuickNpcFormValues | undefined
  /** Back to the picker view — receives current values for session preservation. */
  onBack: (values: QuickNpcFormValues) => void
  onCreated: (npc: CampaignNpcDetail) => void | Promise<void>
  /** Notified while creation is in flight — hosts should block dismissal until false. */
  onPendingChange?: (pending: boolean) => void
}

/**
 * Quick NPC shortcut form — seed fields plus contextual membership title.
 * Submission runs the automatic build resolver and the canonical finalize
 * path; failures surface inline via the existing builder issue messages.
 */
export function QuickNpcCreateForm({
  campaignId,
  buildContext,
  organization,
  initialValues,
  onBack,
  onCreated,
  onPendingChange,
}: QuickNpcCreateFormProps) {
  const { mutateAsync, isPending, isSuccess } = useCreateNpc()

  React.useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  const maxLevel = resolveQuickNpcMaxLevel(buildContext)
  const schema = React.useMemo(() => quickNpcFormSchema(maxLevel), [maxLevel])
  const fields = React.useMemo(
    () =>
      buildQuickNpcFormFields({
        ...buildQuickNpcContentOptions(buildContext),
        maxLevel,
        membership: {
          kind: organization.organizationKind,
          ...(organization.organizationSubtype !== undefined
            ? { subtype: organization.organizationSubtype }
            : {}),
        },
      }),
    [buildContext, maxLevel, organization.organizationKind, organization.organizationSubtype],
  )

  const { onSubmit, formError } = useSubmitHandler<QuickNpcFormValues>({
    submit: async (values) => {
      const membershipMetadata = resolveOrganizationMembershipMetadata({
        kind: organization.organizationKind,
        ...(organization.organizationSubtype !== undefined
          ? { subtype: organization.organizationSubtype }
          : {}),
        selectedTitle: titleFromMembershipRadioValue(values.membershipTitle),
      })

      const input = buildQuickNpcCreateInput({
        seed: buildQuickNpcSeed(values),
        context: buildContext,
        membership: {
          organizationId: organization.id,
          ...(membershipMetadata.title !== undefined ? { title: membershipMetadata.title } : {}),
          ...(membershipMetadata.priority !== undefined
            ? { priority: membershipMetadata.priority }
            : {}),
        },
      })

      const npc = await mutateAsync({ campaignId, input })
      await onCreated(npc)
    },
    fallbackMessage: QUICK_NPC_CREATE_FALLBACK_ERROR,
    mapError: formatQuickNpcCreationError,
  })

  return (
    <Form<QuickNpcFormValues>
      schema={schema}
      fields={fields}
      defaultValues={{ ...quickNpcFormDefaultValues, ...initialValues }}
      onSubmit={onSubmit}
      formError={formError ?? null}
      footer={(form) => (
        <FormFooterActions
          pending={isPending}
          isSuccess={isSuccess}
          submitLabel={QUICK_NPC_CREATE_SUBMIT_LABEL}
          secondary={
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onBack(form.getValues())}
            >
              {QUICK_NPC_CREATE_BACK_LABEL}
            </Button>
          }
        />
      )}
    />
  )
}
