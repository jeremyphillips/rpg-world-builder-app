import type { ReactNode } from 'react'
import { Table2 } from 'lucide-react'
import { InsetPanel } from '@rpg/ui'

import {
  tableBuilderInsetGateCopyClasses,
  tableBuilderInsetGateDescriptionClasses,
  tableBuilderInsetGateHeadlineClasses,
  tableBuilderInsetGateIconClasses,
  tableBuilderInsetGateIntroClasses,
  tableBuilderInsetGatePanelClasses,
} from './table-builder-inset-gate.variants'

export type TableBuilderInsetGateProps = {
  description: string
  headline?: string
  icon?: ReactNode
  action?: ReactNode
}

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
        {icon ?? <Table2 className={tableBuilderInsetGateIconClasses} aria-hidden />}
        <div className={tableBuilderInsetGateCopyClasses}>
          {headline ? <p className={tableBuilderInsetGateHeadlineClasses}>{headline}</p> : null}
          <p className={tableBuilderInsetGateDescriptionClasses}>{description}</p>
        </div>
      </div>
      {action}
    </InsetPanel>
  )
}
