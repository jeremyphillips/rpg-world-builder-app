import * as React from 'react'

import { Button, Eyebrow, Text } from '@rpg/ui'

import { DrawerShell } from '@/components/drawer'

import type { CharacterPickerOption } from '../../../lib/picker/character-picker-option.lib'
import {
  PERSON_CONNECTION_ROLE_OPTIONS,
  type PersonConnectionRoleOption,
} from '../../../lib/relationship/connection-role-catalog'
import { CharacterPickerDrawer } from './character-picker-drawer'
import { PersonRelationshipRoleStep } from './person-relationship-role-step'

export type PersonRelationshipAddDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  characters: readonly CharacterPickerOption[]
  presetRole?: PersonConnectionRoleOption
  onAdd: (input: { characterId: string; role: PersonConnectionRoleOption }) => void | Promise<void>
}

function resolveSubmitError(error: unknown): string {
  return error instanceof Error && error.message.trim().length > 0
    ? error.message
    : 'Could not add this person connection.'
}

// Orchestrator: picker → role selection → confirm for person draft edges.
// fallow-ignore-next-line complexity
export function PersonRelationshipAddDrawer({
  open,
  onOpenChange,
  characters,
  presetRole,
  onAdd,
}: PersonRelationshipAddDrawerProps) {
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [selectedCharacterId, setSelectedCharacterId] = React.useState<string | null>(null)
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(presetRole?.id ?? null)
  const [pending, setPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const resetSession = React.useCallback(() => {
    setPickerOpen(false)
    setSelectedCharacterId(null)
    setSelectedRoleId(presetRole?.id ?? null)
    setPending(false)
    setSubmitError(null)
  }, [presetRole?.id])

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (pending) return
      if (!nextOpen) resetSession()
      onOpenChange(nextOpen)
    },
    [onOpenChange, pending, resetSession],
  )

  React.useEffect(() => {
    if (open) setPickerOpen(true)
  }, [open])

  const selectedCharacter = characters.find((character) => character.id === selectedCharacterId)
  const selectedRole = PERSON_CONNECTION_ROLE_OPTIONS.find((role) => role.id === selectedRoleId)
  const showRoleStep = Boolean(selectedCharacterId) && !presetRole
  const showConfirmStep = Boolean(selectedCharacterId) && Boolean(presetRole ?? selectedRole)
  const drawerTitle = presetRole?.shortcutLabel ?? 'Add person'

  const commitAdd = React.useCallback(async () => {
    const role = presetRole ?? selectedRole
    if (!selectedCharacterId || !role || pending) return

    setPending(true)
    setSubmitError(null)
    try {
      await onAdd({ characterId: selectedCharacterId, role })
      onOpenChange(false)
    } catch (error) {
      setSubmitError(resolveSubmitError(error))
    } finally {
      setPending(false)
    }
  }, [onAdd, onOpenChange, pending, presetRole, selectedCharacterId, selectedRole])

  const pickerItems = characters.map((character) => ({
    character,
    selected: false,
    disabled: false,
  }))

  return (
    <>
      <CharacterPickerDrawer
        open={open && pickerOpen && !showRoleStep && !showConfirmStep}
        closeOnSelect={false}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setPickerOpen(false)
            if (!selectedCharacterId) handleOpenChange(false)
            return
          }
          setPickerOpen(true)
        }}
        title={drawerTitle}
        items={pickerItems}
        onSelect={(characterId) => {
          setSelectedCharacterId(characterId)
          setPickerOpen(false)
        }}
      />
      <DrawerShell
        open={open && (showRoleStep || showConfirmStep)}
        onOpenChange={handleOpenChange}
        title={drawerTitle}
      >
        <div className="flex flex-col gap-6">
          {selectedCharacter ? (
            <div className="space-y-1">
              <Eyebrow size="sm">Person</Eyebrow>
              <Text>{selectedCharacter.name}</Text>
            </div>
          ) : null}

          {presetRole ? (
            <div className="space-y-1">
              <Eyebrow size="sm">Relationship</Eyebrow>
              <Text>{presetRole.label}</Text>
            </div>
          ) : null}

          {showRoleStep && selectedCharacter ? (
            <PersonRelationshipRoleStep
              characterName={selectedCharacter.name}
              selectedRoleId={selectedRoleId}
              onSelectedRoleIdChange={setSelectedRoleId}
            />
          ) : null}

          {submitError ? (
            <Text variant="destructive" role="alert">
              {submitError}
            </Text>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending || !showConfirmStep || (!presetRole && !selectedRole)}
              onClick={() => {
                void commitAdd()
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </DrawerShell>
    </>
  )
}
