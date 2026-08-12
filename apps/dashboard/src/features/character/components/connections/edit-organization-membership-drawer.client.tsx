'use client'

import * as React from 'react'

import { getOrganizationDomainLabel } from '@rpg/contracts'
import {
  Button,
  ConfirmDialog,
  Text,
  dialogPanelActionRowClasses,
  dialogPanelSectionInsetXClasses,
} from '@rpg/ui'

import { DrawerShell } from '@/components/drawer'
import { drawerShellBodyVariants } from '@/components/drawer/drawer-shell.variants'

import { OrganizationMembershipTitleField } from './organization-membership-title-field.client'
import {
  membershipRadioValueFromTitle,
  titleFromMembershipRadioValue,
} from './organization-membership-title-field.lib'
import {
  CHARACTER_SHEET_EDIT_MEMBERSHIP_COPY,
  formatRemoveMembershipHeadline,
  type EditOrganizationMembershipDrawerProps,
} from './edit-organization-membership-drawer.types'

export type { EditOrganizationMembershipDrawerProps } from './edit-organization-membership-drawer.types'

const EDIT_MEMBERSHIP_SAVE_FAILED = 'Could not save this organization membership.'
const EDIT_MEMBERSHIP_REMOVE_FAILED = 'Could not remove this organization membership.'

export function EditOrganizationMembershipDrawer({
  open,
  onOpenChange,
  organization,
  characterName,
  currentTitle,
  copy = CHARACTER_SHEET_EDIT_MEMBERSHIP_COPY,
  onSave,
  onRemove,
}: EditOrganizationMembershipDrawerProps) {
  const [selectedTitle, setSelectedTitle] = React.useState(() =>
    membershipRadioValueFromTitle(currentTitle),
  )
  const [pending, setPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [confirmRemoveOpen, setConfirmRemoveOpen] = React.useState(false)

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (pending) return
      onOpenChange(nextOpen)
    },
    [onOpenChange, pending],
  )

  const handleSave = React.useCallback(async () => {
    if (pending) return
    setPending(true)
    setSubmitError(null)
    try {
      await onSave(titleFromMembershipRadioValue(selectedTitle))
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : EDIT_MEMBERSHIP_SAVE_FAILED
      setSubmitError(message)
      setPending(false)
    }
  }, [onOpenChange, onSave, pending, selectedTitle])

  const handleRemove = React.useCallback(async () => {
    if (pending) return
    setPending(true)
    setSubmitError(null)
    try {
      await onRemove()
      setConfirmRemoveOpen(false)
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : EDIT_MEMBERSHIP_REMOVE_FAILED
      setSubmitError(message)
      setPending(false)
      setConfirmRemoveOpen(false)
    }
  }, [onOpenChange, onRemove, pending])

  const kindLabel = getOrganizationDomainLabel(organization.organizationDomain)

  return (
    <>
      <DrawerShell
        open={open}
        onOpenChange={handleOpenChange}
        title={copy.drawerTitle}
        description={`${organization.name} · ${kindLabel}`}
        bodyMode="composed"
      >
        <DrawerShell.Body className={drawerShellBodyVariants({ mode: 'managed' })}>
          <div className={dialogPanelSectionInsetXClasses}>
            <OrganizationMembershipTitleField
              kind={organization.organizationDomain}
              form={organization.organizationForm}
              activities={organization.activities}
              value={selectedTitle}
              onValueChange={setSelectedTitle}
              idPrefix={`edit-organization-membership-${organization.id}`}
            />
          </div>
        </DrawerShell.Body>
        <DrawerShell.Footer>
          {submitError ? (
            <Text variant="destructive" role="alert">
              {submitError}
            </Text>
          ) : null}
          <div className="flex flex-col gap-3">
            <div className={dialogPanelActionRowClasses}>
              <DrawerShell.Close asChild>
                <Button type="button" variant="outline" disabled={pending}>
                  Cancel
                </Button>
              </DrawerShell.Close>
              <Button
                type="button"
                disabled={pending}
                onClick={() => {
                  void handleSave()
                }}
              >
                Save changes
              </Button>
            </div>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => setConfirmRemoveOpen(true)}
            >
              {copy.removeLabel}
            </Button>
          </div>
        </DrawerShell.Footer>
      </DrawerShell>

      <ConfirmDialog
        open={confirmRemoveOpen}
        onOpenChange={setConfirmRemoveOpen}
        headline={formatRemoveMembershipHeadline(characterName, organization.name)}
        description={copy.removeConfirmDescription}
        confirmLabel={copy.removeLabel}
        confirmVariant="destructive"
        onConfirm={() => {
          void handleRemove()
        }}
      />
    </>
  )
}
