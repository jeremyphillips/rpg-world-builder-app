'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

import { Button } from './button.client'
import { Checkbox } from './checkbox.client'
import { Text } from './text'

export type FilterPopoverGroup = {
  id: string
  label: string
  options: readonly { value: string; label: string }[]
  selectedValues: readonly string[]
  onSelectedValuesChange: (values: string[]) => void
}

export type FilterPopoverProps = {
  triggerLabel: string
  triggerAriaLabel: string
  groups: readonly FilterPopoverGroup[]
  contentClassName?: string
  gridClassName?: string
  primaryColumnClassName?: string
  secondaryColumnClassName?: string
}

export function FilterPopover({
  triggerLabel,
  triggerAriaLabel,
  groups,
  contentClassName = 'z-50 w-[min(100vw-2rem,28rem)] rounded-md border border-border bg-popover p-4 shadow-md outline-none',
  gridClassName = 'grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]',
  primaryColumnClassName = 'min-w-0',
  secondaryColumnClassName = 'min-w-0 space-y-4',
}: FilterPopoverProps) {
  const [open, setOpen] = React.useState(false)

  const toggleValue = (
    selectedValues: readonly string[],
    value: string,
    onSelectedValuesChange: (values: string[]) => void,
  ) => {
    if (selectedValues.includes(value)) {
      onSelectedValuesChange(selectedValues.filter((entry) => entry !== value))
      return
    }
    onSelectedValuesChange([...selectedValues, value])
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button type="button" variant="outline" size="sm" aria-label={triggerAriaLabel}>
          {triggerLabel}
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content align="start" className={contentClassName}>
          <div className={gridClassName}>
            {groups.map((group, index) => (
              <div
                key={group.id}
                className={index === 0 ? primaryColumnClassName : secondaryColumnClassName}
              >
                <Text as="p" variant="muted" className="mb-2 text-xs font-body-emphasis">
                  {group.label}
                </Text>
                <div className="space-y-2">
                  {group.options.map((option) => {
                    const checked = group.selectedValues.includes(option.value)
                    const checkboxId = `${group.id}-${option.value}`
                    return (
                      <label
                        key={option.value}
                        htmlFor={checkboxId}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          id={checkboxId}
                          checked={checked}
                          onCheckedChange={() =>
                            toggleValue(
                              group.selectedValues,
                              option.value,
                              group.onSelectedValuesChange,
                            )
                          }
                        />
                        <Text as="span" className="text-sm">
                          {option.label}
                        </Text>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
