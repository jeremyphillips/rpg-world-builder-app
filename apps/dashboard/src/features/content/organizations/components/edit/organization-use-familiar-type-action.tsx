import { useEffect, useRef } from 'react'
import { Button, INLINE_HEADER_ACTION_BUTTON_SIZE } from '@rpg/ui'

import { useOrganizationAuthoringContext } from '../authoring/use-organization-authoring-context'
import { ORGANIZATION_USE_FAMILIAR_TYPE_LABEL } from '../../lib/presets/organization-form-copy.lib'

export function OrganizationUseFamiliarTypeAction() {
  const { editFamiliarTypeOpen, openEditFamiliarType } = useOrganizationAuthoringContext()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const wasOpenRef = useRef(editFamiliarTypeOpen)

  useEffect(() => {
    if (wasOpenRef.current && !editFamiliarTypeOpen) {
      requestAnimationFrame(() => triggerRef.current?.focus())
    }
    wasOpenRef.current = editFamiliarTypeOpen
  }, [editFamiliarTypeOpen])

  if (editFamiliarTypeOpen) {
    return null
  }

  return (
    <Button
      ref={triggerRef}
      type="button"
      variant="text"
      tone="neutral"
      size={INLINE_HEADER_ACTION_BUTTON_SIZE}
      density="compact"
      className="shrink-0"
      onClick={openEditFamiliarType}
    >
      {ORGANIZATION_USE_FAMILIAR_TYPE_LABEL}
    </Button>
  )
}
