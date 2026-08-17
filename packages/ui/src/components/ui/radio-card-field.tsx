import { cn } from '../../lib/utils'
import { Eyebrow } from './eyebrow'
import {
  RadioCard,
  RadioCardItem,
  type RadioCardDensity,
  type RadioCardOption,
} from './radio-card.client'
import { radioCardGroupGapVariants } from './radio-card.variants'
import { RadioGroup } from './radio-group.client'
import { RadioFieldShell, type BaseRadioFieldProps } from './radio-field-shell'

export type RadioCardOptionGroup = {
  id: string
  eyebrow: string
  options: RadioCardOption[]
}

export interface RadioCardFieldProps extends BaseRadioFieldProps {
  options: RadioCardOption[]
  optionGroups?: RadioCardOptionGroup[]
  density?: RadioCardDensity
  name?: string
  disabled?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Forwarded to the group root so RHF's `field.onBlur` (touched state) can fire. */
  onBlur?: () => void
}

type GroupedRadioCardOptionsProps = {
  idPrefix: string
  labelId: string
  density?: RadioCardDensity
  optionGroups: RadioCardOptionGroup[]
  name?: string
  disabled?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onBlur?: () => void
}

function GroupedRadioCardOptions({
  idPrefix,
  labelId,
  density,
  optionGroups,
  name,
  disabled,
  value,
  defaultValue,
  onValueChange,
  onBlur,
}: GroupedRadioCardOptionsProps) {
  return (
    <RadioGroup
      className={cn(radioCardGroupGapVariants({ variant: 'card', density }), 'gap-4')}
      aria-labelledby={labelId}
      name={name}
      disabled={disabled}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      onBlur={onBlur}
    >
      {optionGroups.map((group) => (
        <div key={group.id} className="flex flex-col gap-2">
          <Eyebrow size="xs">{group.eyebrow}</Eyebrow>
          <div className={radioCardGroupGapVariants({ variant: 'card', density })}>
            {group.options.map((option) => (
              <RadioCardItem
                key={option.value}
                id={`${idPrefix}-${option.value}`}
                value={option.value}
                disabled={option.disabled}
                label={option.label}
                description={option.description}
                badge={option.badge}
                titleMeta={option.titleMeta}
                meta={option.meta}
                summaryItems={option.summaryItems}
                summaryLines={option.summaryLines}
                density={density}
              />
            ))}
          </div>
        </div>
      ))}
    </RadioGroup>
  )
}

/**
 * A labelled card-style radio group. The group is labelled via `aria-labelledby`
 * (a radiogroup is not a labelable element).
 */
export function RadioCardField({
  id,
  label,
  options,
  optionGroups,
  density,
  error,
  hint,
  hintPosition,
  info,
  required,
  width,
  name,
  disabled,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  labelVisibility,
  chrome,
}: RadioCardFieldProps) {
  return (
    <RadioFieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      hintPosition={hintPosition}
      info={info}
      required={required}
      width={width}
      labelVisibility={labelVisibility}
      chrome={chrome}
      controlBand="content-sized"
    >
      {(labelId) =>
        optionGroups && optionGroups.length > 0 ? (
          <GroupedRadioCardOptions
            idPrefix={id}
            labelId={labelId}
            density={density}
            optionGroups={optionGroups}
            name={name}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            onBlur={onBlur}
          />
        ) : (
          <RadioCard
            idPrefix={id}
            aria-labelledby={labelId}
            name={name}
            disabled={disabled}
            density={density}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            onBlur={onBlur}
            options={options}
          />
        )
      }
    </RadioFieldShell>
  )
}
