import type { ReactNode } from 'react'
import { Icon, InsetPanel } from '@rpg/ui'

import {
  tableBuilderInsetGateCopyClasses,
  tableBuilderInsetGateDescriptionClasses,
  tableBuilderInsetGateHeadlineClasses,
  tableBuilderInsetGateIntroClasses,
  tableBuilderInsetGatePanelClasses,
} from './table-builder-inset-gate.variants'

export type TableBuilderInsetGateProps = {
  description: string
  headline?: string
  icon?: ReactNode
  action?: ReactNode
}

// TODO(empty-well): promote this icon, title, supporting, and action stack into a shared well component.
export function TableBuilderInsetGate({
  description,
  headline,
  icon,
  action,
}: TableBuilderInsetGateProps) {
  return (
    <InsetPanel
      borderStyle="dashed"
      surface={{ elevation: 'sunken' }}
      size="md"
      align="center"
      className={tableBuilderInsetGatePanelClasses}
    >
      <div className={tableBuilderInsetGateIntroClasses}>
        {icon ?? (
          <Icon
            name="table"
            size="owner"
            className="ui-empty-state-well__icon ui-empty-state-well__icon--md shrink-0"
          />
        )}
        <div className={tableBuilderInsetGateCopyClasses}>
          {headline ? <p className={tableBuilderInsetGateHeadlineClasses}>{headline}</p> : null}
          <p className={tableBuilderInsetGateDescriptionClasses}>{description}</p>
        </div>
      </div>
      {action}
    </InsetPanel>
  )
}
