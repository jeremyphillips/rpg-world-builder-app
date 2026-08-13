'use client'

import { Button, RadioGroupField } from '@rpg/ui'

import {
  resolveDisclosureChoicePresentation,
  type DisclosureChoice,
} from './add-pending-workflow.lib'
import {
  disclosureChoiceComposerActionsClasses,
  disclosureChoiceComposerClasses,
} from './disclosure-choice-composer.variants'

export type { DisclosureChoice }

export type DisclosureChoiceComposerProps = {
  id: string
  label?: string
  choices: readonly DisclosureChoice[]
  value: string | null
  onValueChange: (value: string) => void
  confirmLabel: string
  confirmType?: 'button' | 'submit'
  confirmDisabled?: boolean
  onConfirm?: () => void
  secondaryAction?: { label: string; onSelect: () => void }
}

const DEFAULT_CHOICE_LABEL = 'Relationship'

export function DisclosureChoiceComposer({
  id,
  label = DEFAULT_CHOICE_LABEL,
  choices,
  value,
  onValueChange,
  confirmLabel,
  confirmType = 'button',
  confirmDisabled = false,
  onConfirm,
  secondaryAction,
}: DisclosureChoiceComposerProps) {
  const presentation = resolveDisclosureChoicePresentation(choices, value)
  const confirmIsDisabled = confirmDisabled || presentation.resolvedValue == null

  return (
    <div className={disclosureChoiceComposerClasses}>
      {presentation.showRadios ? (
        <RadioGroupField
          id={id}
          label={label}
          options={choices.map((choice) => ({
            value: choice.value,
            label:
              choice.disabled && choice.disabledReason
                ? `${choice.label} — ${choice.disabledReason}`
                : choice.label,
            disabled: choice.disabled,
          }))}
          value={value ?? undefined}
          onValueChange={onValueChange}
        />
      ) : null}
      <div className={disclosureChoiceComposerActionsClasses}>
        {secondaryAction ? (
          <Button type="button" variant="ghost" onClick={secondaryAction.onSelect}>
            {secondaryAction.label}
          </Button>
        ) : null}
        <Button
          type={confirmType}
          disabled={confirmIsDisabled}
          onClick={confirmType === 'button' ? onConfirm : undefined}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  )
}
