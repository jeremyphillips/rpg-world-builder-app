'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

import { cn } from '../../lib/utils'
import { establishSurfaceCurrent } from './surface-current.lib'
import { SelectLayerPortal } from './layer-portal-container.client'
import type { FieldControlVariantProps } from './field-control.variants'
import type { FieldDigits } from './field-digit-metrics'
import {
  selectTriggerShellClasses,
  selectValueSlotClasses,
} from './select-compact-trigger.variants'
import { SelectLikeCaretSlot, SelectLikeValueSlot } from './select-like-trigger-slots.client'
import {
  assertSelectCompactSizing,
  isSelectCompactTrigger,
  resolveSelectSizingGhostLabels,
  SELECT_CARET_SLOT_DATA_ATTR,
  SELECT_SIZING_LABEL_DATA_ATTR,
  SELECT_VALUE_SLOT_DATA_ATTR,
} from './select-trigger.lib'

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

export { SELECT_CARET_SLOT_DATA_ATTR, SELECT_SIZING_LABEL_DATA_ATTR, SELECT_VALUE_SLOT_DATA_ATTR }

function selectTriggerWidthClasses(isCompact: boolean, grouped: boolean): string {
  if (isCompact) {
    return 'w-auto shrink-0'
  }

  if (grouped) {
    return 'shrink-0'
  }

  return 'w-full'
}

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> &
    Pick<FieldControlVariantProps, 'size'> & {
      /** When true, styles for embedding inside a grouped control such as InputSelectField. */
      grouped?: boolean
      /** Corner rounding when `grouped` — defaults to `end` (unit column). */
      groupedPosition?: 'start' | 'end'
      /** Compact numeric sizing — N×ch in the value slot. Mutually exclusive with text sizing props. */
      digits?: FieldDigits
      /** Compact text sizing — single reserve label (grid ghost). Mutually exclusive with `digits` / `sizingLabels`. */
      sizingLabel?: string
      /** Compact text sizing — all option labels as overlapping grid ghosts. Mutually exclusive with `digits` / `sizingLabel`. */
      sizingLabels?: readonly string[]
    }
>(
  (
    {
      className,
      size: sizeProp = 'md',
      grouped = false,
      groupedPosition = 'end',
      digits,
      sizingLabel,
      sizingLabels,
      children,
      ...props
    },
    ref,
  ) => {
    assertSelectCompactSizing({ digits, sizingLabel, sizingLabels })

    const size = sizeProp ?? 'md'
    const groupedStart = grouped && groupedPosition === 'start'
    const compact = isSelectCompactTrigger({ digits, sizingLabel, sizingLabels })
    const ghostLabels = resolveSelectSizingGhostLabels({ sizingLabel, sizingLabels })
    const valuePosition = grouped ? (groupedPosition === 'end' ? 'end' : 'start') : 'standalone'
    const valueTrailing =
      valuePosition === 'end' || valuePosition === 'standalone'
        ? ('slot' as const)
        : ('content' as const)

    return (
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          selectTriggerShellClasses(size, { grouped, groupedPosition }),
          selectTriggerWidthClasses(compact, grouped),
          'gap-0 text-left data-[placeholder]:text-muted-foreground',
          className,
        )}
        {...props}
      >
        {ghostLabels.length > 0 ? (
          <SelectLikeValueSlot
            size={size}
            position={valuePosition}
            trailing={valueTrailing}
            digits={digits}
            sizingGhostLabels={ghostLabels}
          >
            {children}
          </SelectLikeValueSlot>
        ) : (
          <span
            {...{ [SELECT_VALUE_SLOT_DATA_ATTR]: '' }}
            className={selectValueSlotClasses(size, {
              digits,
              prose: !compact,
              grouped,
              groupedPosition,
              trailing: valueTrailing,
            })}
          >
            {children}
          </span>
        )}
        <SelectLikeCaretSlot size={size} groupedStart={groupedStart} />
      </SelectPrimitive.Trigger>
    )
  },
)
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronUp className="size-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDown className="size-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectLayerPortal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface-lift text-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        establishSurfaceCurrent('surface-lift'),
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className,
      )}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectLayerPortal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-xs font-semibold text-muted-foreground', className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
