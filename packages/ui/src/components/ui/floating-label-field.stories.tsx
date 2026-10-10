import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { useState } from 'react'

import { FloatingLabelField } from './floating-label-field.client'
import { Input } from './input.client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'
import { SelectLikeCaretSlot, SelectLikeValueSlot } from './select-like-trigger-slots.client'
import { selectTriggerShellClasses } from './select-compact-trigger.variants'
import type { FloatingLabelFieldSize } from './floating-label-field.variants'

const meta = {
  title: 'Primitives/FloatingLabelField',
  component: FloatingLabelField,
  parameters: {
    docs: {
      description: {
        component:
          'Floating label composite. Reduced motion zeroes label and placeholder delay together so copy never overlaps. Forced colours replace the mask with a solid Canvas background.',
      },
    },
  },
} satisfies Meta<typeof FloatingLabelField>

export default meta
type Story = StoryObj<typeof meta>

function TextControl({
  size,
  value,
  placeholder,
  disabled,
}: {
  size: FloatingLabelFieldSize
  value: string
  placeholder?: string
  disabled?: boolean
}) {
  const [text, setText] = useState(value)
  return (
    <FloatingLabelField
      label="School"
      size={size}
      populated={text.length > 0}
      placeholder={placeholder}
      disabled={disabled}
    >
      <Input
        value={text}
        size={size}
        disabled={disabled}
        onChange={(event) => setText(event.target.value)}
      />
    </FloatingLabelField>
  )
}

function SelectControl({
  size,
  value,
  disabled,
}: {
  size: FloatingLabelFieldSize
  value?: string
  disabled?: boolean
}) {
  const [current, setCurrent] = useState(value)
  return (
    <Select value={current} onValueChange={setCurrent} disabled={disabled}>
      <FloatingLabelField
        label="School"
        size={size}
        populated={Boolean(current)}
        disabled={disabled}
      >
        <SelectTrigger size={size} disabled={disabled}>
          <SelectValue placeholder="Choose a school…" />
        </SelectTrigger>
      </FloatingLabelField>
      <SelectContent>
        <SelectItem value="__all__">All schools</SelectItem>
        <SelectItem value="evocation">Evocation</SelectItem>
        <SelectItem value="abjuration">Abjuration</SelectItem>
      </SelectContent>
    </Select>
  )
}

function ComboboxControl({
  size,
  text,
  open = false,
  loading = false,
  disabled = false,
  populated,
}: {
  size: FloatingLabelFieldSize
  text: string
  open?: boolean
  loading?: boolean
  disabled?: boolean
  populated: boolean
}) {
  return (
    <FloatingLabelField label="School" size={size} populated={populated} disabled={disabled}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className={selectTriggerShellClasses(size, { grouped: false, groupedPosition: 'end' })}
      >
        <SelectLikeValueSlot size={size} position="standalone" trailingSlot prose>
          <span>{loading ? 'Loading schools…' : text}</span>
        </SelectLikeValueSlot>
        <SelectLikeCaretSlot size={size} />
      </button>
    </FloatingLabelField>
  )
}

function Pair({
  size,
  children,
}: {
  size: FloatingLabelFieldSize
  children: (size: FloatingLabelFieldSize) => ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end gap-6 bg-background p-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Compact</span>
        {children('sm')}
      </div>
      {size === 'md' ? null : (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">Comfortable</span>
          {children('md')}
        </div>
      )}
    </div>
  )
}

function Controls({
  mode,
}: {
  mode:
    | 'empty'
    | 'value'
    | 'default'
    | 'disabled'
    | 'error'
    | 'error-hint'
    | 'hint'
    | 'loading'
    | 'long-label'
    | 'long-value'
}) {
  return (
    <div className="flex flex-col gap-8 bg-background p-6">
      {(['sm', 'md'] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-end gap-6">
          {mode === 'empty' ? (
            <>
              <TextControl size={size} value="" placeholder="Choose a school…" />
              <SelectControl size={size} />
              <ComboboxControl size={size} text="" populated={false} />
            </>
          ) : null}
          {mode === 'value' || mode === 'default' ? (
            <>
              <TextControl size={size} value="Evocation" />
              <SelectControl size={size} value="evocation" />
              <ComboboxControl size={size} text="Evocation" populated />
            </>
          ) : null}
          {mode === 'disabled' ? (
            <>
              <TextControl size={size} value="" disabled />
              <SelectControl size={size} value="evocation" disabled />
              <ComboboxControl size={size} text="Evocation" populated disabled />
            </>
          ) : null}
          {mode === 'error' ? (
            <FloatingLabelField
              label="School"
              size={size}
              populated={false}
              error="Choose a school"
            >
              <Input value="" onChange={() => undefined} size={size} aria-invalid />
            </FloatingLabelField>
          ) : null}
          {mode === 'error-hint' ? (
            <FloatingLabelField
              label="School"
              size={size}
              populated={false}
              hint="Persistent guidance"
              error="Choose a school"
            >
              <Input value="" onChange={() => undefined} size={size} aria-invalid />
            </FloatingLabelField>
          ) : null}
          {mode === 'hint' ? (
            <FloatingLabelField
              label="School"
              size={size}
              populated={false}
              hint="Persistent guidance"
            >
              <Input value="" onChange={() => undefined} size={size} />
            </FloatingLabelField>
          ) : null}
          {mode === 'loading' ? <ComboboxControl size={size} text="" loading populated /> : null}
          {mode === 'long-label' ? (
            <FloatingLabelField
              label="Extraordinary school of magic classification"
              size={size}
              populated={false}
            >
              <Input value="" onChange={() => undefined} size={size} />
            </FloatingLabelField>
          ) : null}
          {mode === 'long-value' ? (
            <TextControl size={size} value="Extraordinary evocation school of elemental fire" />
          ) : null}
        </div>
      ))}
    </div>
  )
}

export const EmptyIdle: Story = {
  args: { label: 'School', size: 'sm', populated: false, children: <Input /> },
  render: () => <Controls mode="empty" />,
}

export const TypedValue: Story = {
  args: { label: 'School', size: 'sm', populated: true, children: <Input /> },
  render: () => <Controls mode="value" />,
}

export const DefaultValue: Story = {
  args: { label: 'School', size: 'sm', populated: true, children: <Input /> },
  render: () => <Controls mode="default" />,
  play: async ({ canvasElement }) => {
    const labels = [...canvasElement.querySelectorAll<HTMLElement>('[data-floating-label]')]
    expect(labels.length).toBeGreaterThan(0)
    for (const label of labels) {
      expect(label.closest('[data-populated]')).toHaveAttribute('data-populated', 'true')
      expect(label.getAnimations().length).toBe(0)
    }
  },
}

export const Cleared: Story = {
  args: { label: 'School', size: 'sm', populated: false, children: <Input /> },
  render: () => <Controls mode="empty" />,
}

export const Disabled: Story = {
  args: { label: 'School', size: 'sm', populated: false, children: <Input /> },
  render: () => <Controls mode="disabled" />,
}

export const ValidationError: Story = {
  args: { label: 'School', size: 'sm', populated: false, children: <Input /> },
  render: () => <Controls mode="error" />,
}

export const ErrorWithHint: Story = {
  args: { label: 'School', size: 'sm', populated: false, children: <Input /> },
  render: () => <Controls mode="error-hint" />,
}

export const HintBelow: Story = {
  args: { label: 'School', size: 'sm', populated: false, children: <Input /> },
  render: () => <Controls mode="hint" />,
}

export const LoadingCombobox: Story = {
  args: { label: 'School', size: 'sm', populated: true, children: <Input /> },
  render: () => <Controls mode="loading" />,
}

export const LongLabel: Story = {
  args: { label: 'School', size: 'sm', populated: false, children: <Input /> },
  render: () => <Controls mode="long-label" />,
}

export const LongValue: Story = {
  args: { label: 'School', size: 'sm', populated: true, children: <Input /> },
  render: () => <Controls mode="long-value" />,
}

export const Narrow: Story = {
  args: { label: 'School', size: 'sm', populated: false, children: <Input /> },
  render: () => (
    <div className="w-24 bg-background p-4">
      <TextControl size="sm" value="" />
    </div>
  ),
}

export const Rtl: Story = {
  args: { label: 'School', size: 'sm', populated: true, children: <Input /> },
  render: () => (
    <div dir="rtl">
      <Controls mode="value" />
    </div>
  ),
}

export const EmptyFocused: Story = {
  args: { label: 'School', size: 'sm', populated: false, children: <Input /> },
  render: () => (
    <Pair size="sm">
      {(size) => <TextControl size={size} value="" placeholder="Choose a school…" />}
    </Pair>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const inputs = canvas.getAllByRole('textbox', { name: 'School' })
    await userEvent.click(inputs[0]!)
    expect(inputs[0]).toHaveFocus()
  },
}

function assertFocusRingClearance(label: HTMLElement, floatedSizeToken: string) {
  const root = label.ownerDocument.documentElement
  const token = getComputedStyle(root).getPropertyValue(floatedSizeToken).trim()
  const remMatch = token.match(/^([\d.]+)rem$/)
  const floatedSizePx = remMatch
    ? Number(remMatch[1]) * 16
    : Number.parseFloat(getComputedStyle(label).fontSize)
  const half = floatedSizePx / 2
  const ringOffset = 2
  const ringWidth = 2
  expect(half).toBeGreaterThanOrEqual(ringOffset + ringWidth)
}

export const FocusRing: Story = {
  args: { label: 'School', size: 'sm', populated: false, children: <Input /> },
  render: () => (
    <div className="flex items-end gap-6 bg-background p-8">
      <FloatingLabelField label="School" size="sm" populated={false}>
        <Input value="" onChange={() => undefined} size="sm" />
      </FloatingLabelField>
      <FloatingLabelField label="School" size="md" populated={false}>
        <Input value="" onChange={() => undefined} size="md" />
      </FloatingLabelField>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const labels = [...canvasElement.querySelectorAll<HTMLElement>('[data-floating-label]')]
    expect(labels).toHaveLength(2)
    assertFocusRingClearance(labels[0]!, '--field-floating-label-sm')
    assertFocusRingClearance(labels[1]!, '--field-floating-label-md')
  },
}
