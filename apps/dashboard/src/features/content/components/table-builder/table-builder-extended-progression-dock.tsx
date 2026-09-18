import { useId, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Button, InsetPanel, NumberInput, Text } from '@rpg/ui'

import { useTableBuilderHostConfig } from '../../lib/table-builder/table-builder-host-context'
import type { TableBuilderFormValues } from '../../lib/table-builder/table-builder-draft'
import { tableBuilderAuthoringPaneClasses } from './table-builder.variants'
import {
  tableBuilderAuthoringDockBarClasses,
  tableBuilderAuthoringDockFootnoteTextClasses,
  tableBuilderAuthoringDockHeadingClasses,
  tableBuilderAuthoringDockHeadingMetaClasses,
  tableBuilderAuthoringDockHeadingTitleClasses,
  tableBuilderAuthoringDockIncrementInputClasses,
  tableBuilderAuthoringDockInputLabelClasses,
  tableBuilderAuthoringDockInputRowClasses,
  tableBuilderAuthoringDockLayoutClasses,
  tableBuilderAuthoringDockPanelClasses,
  tableBuilderAuthoringDockPreviewSpacerClasses,
  tableBuilderAuthoringDockShellClasses,
  tableBuilderAuthoringDockTriggerClasses,
  tableBuilderAuthoringDockWellClasses,
} from './table-builder-values.variants'

function toPresentationDraft(draft: TableBuilderFormValues): TableBuilderFormValues {
  return {
    kind: draft.kind ?? 'levelProgression',
    name: draft.name ?? '',
    columns: draft.columns ?? [],
    rows: draft.rows ?? [],
  }
}

/**
 * Extended-progression bulk action docked between the modal scrollport and footer.
 * Must render outside {@link DialogPanelScrollRegion} so it sits flush above
 * {@link Modal.Footer} without the scroll viewport `pb-6` gap.
 */
export function TableBuilderExtendedProgressionDock() {
  const incrementInputId = useId()
  const config = useTableBuilderHostConfig()
  const form = useFormContext<TableBuilderFormValues>()
  const draft = useWatch({ control: form.control }) as TableBuilderFormValues
  const [panelOpen, setPanelOpen] = useState(false)
  const [incrementDraft, setIncrementDraft] = useState('')

  const presentationDraft = toPresentationDraft(draft)
  const action = config.resolveExtendedProgressionAction?.({ draft: presentationDraft })

  if (action === undefined) return null

  function handleOpenPanel() {
    setIncrementDraft(action!.currentIncrement > 0 ? String(action!.currentIncrement) : '')
    setPanelOpen(true)
  }

  function handleApply() {
    const parsed = Number(incrementDraft.replace(/,/g, ''))
    if (!Number.isFinite(parsed) || parsed <= 0 || !config.applyExtendedProgressionIncrement) return

    const nextDraft = config.applyExtendedProgressionIncrement({
      draft: toPresentationDraft(form.getValues()),
      increment: parsed,
    })

    nextDraft.rows.forEach((row, rowIndex) => {
      form.setValue(`rows.${rowIndex}`, row, { shouldDirty: true })
    })
    setPanelOpen(false)
  }

  return (
    <div className={tableBuilderAuthoringDockShellClasses}>
      <div className={tableBuilderAuthoringDockLayoutClasses}>
        <div className={tableBuilderAuthoringPaneClasses}>
          <div className={tableBuilderAuthoringDockBarClasses}>
            {!panelOpen ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={tableBuilderAuthoringDockTriggerClasses}
                onClick={handleOpenPanel}
              >
                {action.label}
              </Button>
            ) : (
              <InsetPanel
                surface={{ elevation: 'sunken' }}
                size="sm"
                className={tableBuilderAuthoringDockWellClasses}
              >
                <div className={tableBuilderAuthoringDockPanelClasses}>
                  <p className={tableBuilderAuthoringDockHeadingClasses}>
                    <span className={tableBuilderAuthoringDockHeadingTitleClasses}>
                      Extended progression
                    </span>
                    <span className={tableBuilderAuthoringDockHeadingMetaClasses}>
                      {' '}
                      · Levels {action.extendedStartsAt}–{action.extendedEndLevel}
                    </span>
                  </p>
                  <div className={tableBuilderAuthoringDockInputRowClasses}>
                    <label
                      htmlFor={incrementInputId}
                      className={tableBuilderAuthoringDockInputLabelClasses}
                    >
                      XP increase per level
                    </label>
                    <NumberInput
                      id={incrementInputId}
                      size="sm"
                      formatGrouped
                      hideSteppers
                      value={incrementDraft}
                      onChange={(event) => setIncrementDraft(event.target.value)}
                      rootClassName={tableBuilderAuthoringDockIncrementInputClasses}
                    />
                    <Button type="button" size="sm" onClick={handleApply}>
                      Apply
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPanelOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <Text as="p" className={tableBuilderAuthoringDockFootnoteTextClasses}>
                    Replaces existing explicit thresholds in this range.
                  </Text>
                </div>
              </InsetPanel>
            )}
          </div>
        </div>
        <div aria-hidden className={tableBuilderAuthoringDockPreviewSpacerClasses} />
      </div>
    </div>
  )
}
