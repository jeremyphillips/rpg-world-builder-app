import type { ReactNode } from 'react'

import {
  cn,
  Eyebrow,
  SelectionSummaryChangeAction,
  selectionSummaryCardRowHelperVariants,
} from '@rpg/ui'

import {
  setupAttributeRowBodyClasses,
  setupAttributeRowClasses,
  setupAttributeRowHeaderClasses,
  setupAttributeRowValueClasses,
} from './setup-attribute-row.variants'

export type SetupAttributeRowProps = {
  eyebrow: string
  /** Collapsed primary value when `children` is absent. */
  value?: ReactNode
  helper?: string
  /** When true, helper renders even while `children` is shown (e.g. level stepper). */
  showHelperWhileEditing?: boolean
  changeLabel?: string
  onChange?: () => void
  /** Expanded editor (radio field, stepper stack, …). Hides collapsed value when set. */
  children?: ReactNode
  className?: string
}

function SetupAttributeRowHelper({ helper }: { helper: string }) {
  return <p className={cn(selectionSummaryCardRowHelperVariants(), 'mt-0.5')}>{helper}</p>
}

function SetupAttributeRowCollapsedValue({ value }: { value: ReactNode }) {
  return <div className={setupAttributeRowValueClasses}>{value}</div>
}

function SetupAttributeRowHeader({
  eyebrow,
  changeLabel,
  onChange,
}: {
  eyebrow: string
  changeLabel?: string
  onChange?: () => void
}) {
  const showChange = changeLabel != null && onChange != null

  return (
    <div className={setupAttributeRowHeaderClasses}>
      <Eyebrow size="sm">{eyebrow}</Eyebrow>
      {showChange ? (
        <SelectionSummaryChangeAction
          changeLabel={changeLabel}
          ariaLabel={changeLabel}
          onChange={onChange}
        />
      ) : null}
    </div>
  )
}

export function SetupAttributeRow({
  eyebrow,
  value,
  helper,
  showHelperWhileEditing = false,
  changeLabel,
  onChange,
  children,
  className,
}: SetupAttributeRowProps) {
  const editing = children !== undefined
  const showHelper = helper != null && helper !== '' && (!editing || showHelperWhileEditing)
  const showCollapsedValue = !editing && value !== undefined && value !== null && value !== ''

  return (
    <div className={className ?? setupAttributeRowClasses}>
      <SetupAttributeRowHeader eyebrow={eyebrow} changeLabel={changeLabel} onChange={onChange} />
      {editing ? <div className={setupAttributeRowBodyClasses}>{children}</div> : null}
      {showCollapsedValue ? <SetupAttributeRowCollapsedValue value={value} /> : null}
      {showHelper ? <SetupAttributeRowHelper helper={helper} /> : null}
    </div>
  )
}
