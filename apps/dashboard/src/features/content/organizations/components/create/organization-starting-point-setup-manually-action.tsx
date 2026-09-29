import { Button, INLINE_HEADER_ACTION_BUTTON_SIZE } from '@rpg/ui'

import { ORGANIZATION_SET_UP_MANUALLY_LABEL } from '../../lib/presets/organization-form-copy.lib'
import { useOrganizationAuthoringContext } from '../authoring/organization-authoring-context'

/** Quick-create trailing legend action — reveals profile without a starting point preset. */
export function OrganizationStartingPointSetupManuallyAction() {
  const { presentation, hasEnteredProfileSetup, enterProfileSetup } =
    useOrganizationAuthoringContext()

  if (presentation !== 'quick' || hasEnteredProfileSetup) {
    return null
  }

  return (
    <Button
      type="button"
      variant="text"
      tone="neutral"
      size={INLINE_HEADER_ACTION_BUTTON_SIZE}
      density="compact"
      className="shrink-0"
      onClick={enterProfileSetup}
    >
      {ORGANIZATION_SET_UP_MANUALLY_LABEL}
    </Button>
  )
}
