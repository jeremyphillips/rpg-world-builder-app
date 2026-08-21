import * as React from 'react'
import { Button, toast, usePendingAwareOpenChange } from '@rpg/ui'
import type { ContentCampaignAccessPatch } from '@rpg/contracts'
import { FormShellFooterScope, FormShellFooterSlot, FormShellSubmitButton } from '@rpg/ui/form'

import {
  CreateModalShell,
  formatNestedCreateHandoffFailure,
  invokeOnContentCreated,
  type OnContentCreated,
} from '@/lib/create-flow'
import { notifyContentCreated } from '@/lib/notify'
import { createWithDeferredCampaignAccess } from '../../../lib/campaign-access/create-with-deferred-campaign-access'
import { CAMPAIGN_ACCESS_CREATE_DEFERRED_WARNING } from '../../../lib/campaign-access/campaign-access-labels'
import { CampaignAccessFormProvider } from '../../../lib/campaign-access/campaign-access-form-context'
import {
  formatContentCreateActionLabel,
  formatContentCreateHeading,
} from '../../../lib/content-type-labels'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  ContentFormHost,
  type ContentFormHostLeaveBridge,
} from '../../../lib/forms/shells/host/content-form-host'
import { ContentFormHeader } from '../../../lib/forms/shells/layout/content-form-shell-layout.lib'
import { useContentFormSubmit } from '../../../lib/forms/shells/submit/content-form-submit'
import {
  resolveContentFormHostConfig,
  resolveContentFormNavigationFields,
} from '../../../lib/forms/shells/host/content-form-host-projection'
import { useContentWriteMutation } from '../../../lib/list/use-content-mutations'
import { ContentFormOptionsGate } from '../../../lib/forms/shells/layout/content-form-shell-layout'
import { OrganizationAuthoringFormShell } from './organization-authoring-form-shell'
import { OrganizationAuthoringPresetBridge } from './organization-authoring-preset-bridge'
import { useOrganizationAuthoringContext } from './organization-authoring-context'
import { organizationFormDef } from '../../lib/organization-form-def'
import '../../lib/organization-form-def'
import type { OrganizationFormValues } from '../../../lib/forms/organization-form-projection'

export type OrganizationCreateModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  formOptionsCtx?: ContentFormCtx
  onCreated?: OnContentCreated
}

function OrganizationCreateModalForm({
  campaignId,
  optionsCtx,
  open,
  leaveBridgeRef,
  onTrustedClose,
  onCancel,
  onPendingChange,
  onCreated,
}: {
  campaignId: string
  optionsCtx: ContentFormCtx
  open: boolean
  leaveBridgeRef: React.MutableRefObject<ContentFormHostLeaveBridge | null>
  onTrustedClose: () => void
  onCancel: () => void
  onPendingChange?: (pending: boolean) => void
  onCreated?: OnContentCreated
}) {
  const { practiceRecommendations } = useOrganizationAuthoringContext()
  const mutation = useContentWriteMutation(organizationFormDef, campaignId)
  const campaignAccessDraftRef = React.useRef<ContentCampaignAccessPatch | null>(null)

  const ctx = {
    ...optionsCtx,
    campaignId,
    mode: 'create' as const,
    entitySource: 'homebrew' as const,
    organizationPracticeRecommendationIds: practiceRecommendations,
  }

  const formKey = `organization-create-modal-${campaignId}`

  const { onSubmit, formError, UiBridge } = useContentFormSubmit<OrganizationFormValues>({
    def: organizationFormDef,
    ctx,
    fallbackMessage: 'Could not create organizations.',
    invalidPresentation: {
      resolverFields: resolveContentFormNavigationFields(organizationFormDef, ctx),
      formId: formKey,
    },
    persist: async (values) => {
      const { entity: created, deferredAccessFailed } = await createWithDeferredCampaignAccess({
        campaignId,
        routeKey: organizationFormDef.routeKey,
        createInput: {
          ...organizationFormDef.toInput(
            values,
            {
              weaponCategoryBySlug: ctx.options?.weaponCategoryBySlug,
              campaignRules: ctx.campaignRules,
              equipmentKind: ctx.equipmentKind,
            },
            'publish',
          ),
          status: 'published' as const,
        },
        mutateAsync: (input) => mutation.mutateAsync(input) as Promise<{ id: string }>,
        pendingAccess: campaignAccessDraftRef.current,
      })

      if (deferredAccessFailed) {
        toast.warning(CAMPAIGN_ACCESS_CREATE_DEFERRED_WARNING)
        return
      }

      try {
        await invokeOnContentCreated(onCreated, {
          contentType: 'organizations',
          id: created.id,
        })
      } catch (error) {
        toast.warning(formatNestedCreateHandoffFailure(error))
        return
      }

      notifyContentCreated('organizations')
    },
  })

  React.useEffect(() => {
    onPendingChange?.(mutation.isPending)
  }, [mutation.isPending, onPendingChange])

  return (
    <ContentFormHost
      mounted
      leaveGuardEnabled={open}
      pending={mutation.isPending}
      formError={formError}
      leaveBridgeRef={leaveBridgeRef}
      wrapForm={(form) => <CampaignAccessFormProvider>{form}</CampaignAccessFormProvider>}
      form={{
        ...resolveContentFormHostConfig<OrganizationFormValues>(organizationFormDef, ctx, {
          validationIntent: 'draft',
          formKey,
        }),
        header: () => (
          <>
            <UiBridge />
            <OrganizationAuthoringPresetBridge />
            <ContentFormHeader
              def={organizationFormDef}
              ctx={ctx}
              formKey={formKey}
              campaignId={campaignId}
              onCampaignAccessDraftChange={(patch) => {
                campaignAccessDraftRef.current = patch
              }}
            />
          </>
        ),
      }}
      chrome={{
        contentWrapper: (content) => content,
        footer: () => (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={onCancel}
            >
              Cancel
            </Button>
            <FormShellSubmitButton disabled={mutation.isPending}>
              {formatContentCreateActionLabel('organizations')}
            </FormShellSubmitButton>
          </>
        ),
      }}
      onSubmit={onSubmit}
      onTrustedClose={() => {
        campaignAccessDraftRef.current = null
        onTrustedClose()
      }}
    />
  )
}

function OrganizationCreateModalSession({
  open,
  onOpenChange,
  campaignId,
  formOptionsCtx,
  onCreated,
}: OrganizationCreateModalProps) {
  const leaveBridgeRef = React.useRef<ContentFormHostLeaveBridge | null>(null)
  const [pending, setPending] = React.useState(false)
  const { trustedClose } = usePendingAwareOpenChange({
    pending,
    onOpenChange,
  })

  const requestClose = React.useCallback(() => {
    if (pending) return
    const bridge = leaveBridgeRef.current
    if (bridge) {
      bridge.requestClose(trustedClose)
      return
    }
    trustedClose()
  }, [pending, trustedClose])

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        onOpenChange(true)
        return
      }
      requestClose()
    },
    [onOpenChange, requestClose],
  )

  const renderForm = (optionsCtx: ContentFormCtx) => (
    <OrganizationCreateModalForm
      campaignId={campaignId}
      optionsCtx={optionsCtx}
      open={open}
      leaveBridgeRef={leaveBridgeRef}
      onTrustedClose={trustedClose}
      onCancel={requestClose}
      onPendingChange={setPending}
      onCreated={onCreated}
    />
  )

  return (
    <FormShellFooterScope>
      <CreateModalShell
        open={open}
        onOpenChange={handleOpenChange}
        headline={formatContentCreateHeading('organizations')}
        contentMode="managed"
        footer={<FormShellFooterSlot />}
      >
        {formOptionsCtx ? (
          renderForm(formOptionsCtx)
        ) : (
          <ContentFormOptionsGate campaignId={campaignId}>{renderForm}</ContentFormOptionsGate>
        )}
      </CreateModalShell>
    </FormShellFooterScope>
  )
}

/** Canonical organization create modal for nested picker flows and other in-place create. */
export function OrganizationCreateModal(props: OrganizationCreateModalProps) {
  if (!props.open) return null
  return (
    <OrganizationAuthoringFormShell>
      <OrganizationCreateModalSession key={props.campaignId} {...props} />
    </OrganizationAuthoringFormShell>
  )
}
