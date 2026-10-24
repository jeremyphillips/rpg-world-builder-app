import type { ReactNode } from 'react'

import { cn, selectionSummaryCardRowHelperVariants } from '@rpg/ui'

import { EyebrowActionHeader } from './eyebrow-action-header'

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
  return <p className={cn(selectionSummaryCardRowHelperVariants, 'mt-0.5')}>{helper}</p>
}

function SetupAttributeRowCollapsedValue({ value }: { value: ReactNode }) {
  return <div className="text-base font-body-emphasis text-foreground">{value}</div>
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
    <div
      className={
        className ??
        'flex flex-col border-b border-border pb-2.5 mb-2.5 last:border-b-0 last:mb-0 last:pb-0'
      }
    >
      <EyebrowActionHeader eyebrow={eyebrow} actionLabel={changeLabel} onAction={onChange} />
      {editing ? <div className="flex flex-col gap-y-3">{children}</div> : null}
      {showCollapsedValue ? <SetupAttributeRowCollapsedValue value={value} /> : null}
      {showHelper ? <SetupAttributeRowHelper helper={helper} /> : null}
    </div>
  )
}
