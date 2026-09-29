import { SplitButton } from '@rpg/ui'

import {
  CONTENT_CREATE_FROM_SCRATCH_LABEL,
  CONTENT_CREATE_QUICK_CREATE_LABEL,
  CONTENT_CREATE_START_WITH_SETUP_LABEL,
  contentCreateFromScratchDescription,
  contentCreateQuickCreateDescription,
  contentCreateStartWithSetupDescription,
} from './content-create-split-action.copy'

export type ContentCreateSplitActionProps = {
  entityLabel: string
  primaryLabel: string
  onCreateFromScratch: () => void
  onStartWithSetup: () => void
  onQuickCreate: () => void
  disabled?: boolean
}

/** Overview create control — primary scratch action plus setup and quick-create shortcuts. */
export function ContentCreateSplitAction({
  entityLabel,
  primaryLabel,
  onCreateFromScratch,
  onStartWithSetup,
  onQuickCreate,
  disabled,
}: ContentCreateSplitActionProps) {
  return (
    <SplitButton
      label={primaryLabel}
      showLeadingIcon={false}
      disabled={disabled}
      onPrimaryClick={onCreateFromScratch}
      menuAriaLabel={`${primaryLabel} options`}
      menuGroups={[
        {
          id: 'create-modes',
          items: [
            {
              id: 'scratch',
              label: CONTENT_CREATE_FROM_SCRATCH_LABEL,
              description: contentCreateFromScratchDescription(entityLabel),
              onSelect: onCreateFromScratch,
            },
            {
              id: 'setup',
              label: CONTENT_CREATE_START_WITH_SETUP_LABEL,
              description: contentCreateStartWithSetupDescription(entityLabel),
              onSelect: onStartWithSetup,
            },
            {
              id: 'quick',
              label: CONTENT_CREATE_QUICK_CREATE_LABEL,
              description: contentCreateQuickCreateDescription(),
              onSelect: onQuickCreate,
            },
          ],
        },
      ]}
    />
  )
}
