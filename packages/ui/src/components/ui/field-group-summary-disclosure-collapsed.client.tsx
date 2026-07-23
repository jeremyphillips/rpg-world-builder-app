import { Button } from './button.client'
import type { FieldGroupSummary } from './field-group-disclosure.types'
import { fieldGroupSummaryDisclosureActionButtonClasses } from './field-group-summary-disclosure.variants'
import { Text } from './text'

export type FieldGroupSummaryDisclosureCollapsedProps = {
  legend: string
  legendId: string
  panelId: string
  summary: FieldGroupSummary
  openLabel: string
  unsavedSuffix: string
  showDirtySuffix: boolean
  disabled: boolean
  onOpen: () => void
}

export function FieldGroupSummaryDisclosureCollapsed({
  legend,
  legendId,
  panelId,
  summary,
  openLabel,
  unsavedSuffix,
  showDirtySuffix,
  disabled,
  onOpen,
}: FieldGroupSummaryDisclosureCollapsedProps) {
  return (
    <>
      <Text id={legendId} variant="muted" className="text-sm">
        {legend}
      </Text>
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          aria-expanded={false}
          aria-controls={panelId}
          disabled={disabled}
          onClick={onOpen}
        >
          <Text as="span" className="text-sm">
            {summary.primary}
            {showDirtySuffix ? (
              <Text as="span" variant="muted">
                {unsavedSuffix}
              </Text>
            ) : null}
          </Text>
          {summary.secondary ? (
            <Text variant="muted" className="mt-1 text-sm">
              {summary.secondary}
            </Text>
          ) : null}
        </button>
        <Button
          type="button"
          variant="text"
          size="sm"
          className={fieldGroupSummaryDisclosureActionButtonClasses}
          aria-expanded={false}
          aria-controls={panelId}
          disabled={disabled}
          onClick={onOpen}
        >
          {openLabel}
        </Button>
      </div>
    </>
  )
}
