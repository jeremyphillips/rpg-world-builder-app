import { useState } from 'react'

import { ActionButton, Button, Modal } from '@rpg/ui'
import { Form, FormFooterActions } from '@rpg/ui/form'

import { useRunnerFormSubmit } from '@/lib/runner-form-submit.lib'

import {
  INVITE_MEMBER_DIALOG_COPY,
  mapInviteSendError,
} from '../../lib/overview/campaign-overview-labels'
import {
  inviteMemberDefaultValues,
  inviteMemberFields,
  inviteMemberSchema,
  type InviteMemberValues,
} from '../../lib/forms/invite-member-form-fields'
import { useSendCampaignInvite } from '../../hooks/use-send-campaign-invite'

export type InviteMemberDialogProps = {
  campaignId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
}

/** Manager-only invite dialog for the campaign overview. */
export function InviteMemberDialog({
  campaignId,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: InviteMemberDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const [deliveryFailed, setDeliveryFailed] = useState(false)
  const { mutateAsync, isPending, isSuccess } = useSendCampaignInvite(campaignId)

  function handleOpenChange(nextOpen: boolean) {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
    if (!nextOpen) {
      setDeliveryFailed(false)
    }
  }

  const { onSubmit, formError, ProducerBoundary } = useRunnerFormSubmit<InviteMemberValues>({
    schema: inviteMemberSchema,
    resolverFields: inviteMemberFields,
    formId: `invite-member-${campaignId}`,
    fallbackMessage: INVITE_MEMBER_DIALOG_COPY.fallbackError,
    mapError: mapInviteSendError,
    persist: async (values, form) => {
      const result = await mutateAsync(values.email.trim())
      if (result.invite.deliveryStatus === 'failed') {
        setDeliveryFailed(true)
        return
      }

      form.reset(inviteMemberDefaultValues)
      setDeliveryFailed(false)
      handleOpenChange(false)
    },
  })

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      {showTrigger ? (
        <Modal.Trigger asChild>
          <ActionButton action="invite" variant="outline" size="sm">
            Invite member
          </ActionButton>
        </Modal.Trigger>
      ) : null}
      <Modal.Content size="md">
        {deliveryFailed ? (
          <>
            <Modal.Header
              headline={INVITE_MEMBER_DIALOG_COPY.deliveryFailureHeadline}
              description={INVITE_MEMBER_DIALOG_COPY.deliveryFailureDescription}
            />
            <Modal.Body>
              <div className="flex justify-end">
                <Button type="button" onClick={() => handleOpenChange(false)}>
                  {INVITE_MEMBER_DIALOG_COPY.closeLabel}
                </Button>
              </div>
            </Modal.Body>
          </>
        ) : (
          <>
            <Modal.Header
              headline={INVITE_MEMBER_DIALOG_COPY.headline}
              description={INVITE_MEMBER_DIALOG_COPY.description}
            />
            <Modal.Body>
              {open ? (
                <Form<InviteMemberValues>
                  schema={inviteMemberSchema}
                  fields={inviteMemberFields}
                  defaultValues={inviteMemberDefaultValues}
                  onSubmit={onSubmit}
                  formError={formError}
                  producerBoundary={ProducerBoundary}
                  footer={() => (
                    <FormFooterActions
                      pending={isPending}
                      isSuccess={isSuccess}
                      submitLabel={INVITE_MEMBER_DIALOG_COPY.submitLabel}
                      secondary={
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleOpenChange(false)}
                          disabled={isPending}
                        >
                          {INVITE_MEMBER_DIALOG_COPY.cancelLabel}
                        </Button>
                      }
                    />
                  )}
                />
              ) : null}
            </Modal.Body>
          </>
        )}
      </Modal.Content>
    </Modal.Root>
  )
}
