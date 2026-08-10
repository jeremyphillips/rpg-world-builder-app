import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button.client'
import { Input } from './input.client'
import { InputActionGroup } from './input-action-group.client'
import { inputActionGroupActionSegmentVariants } from './input-action-group.variants'
import {
  fieldGroupedControlActionPaddingClasses,
  fieldGroupedControlHeightClasses,
} from './field-sizing.variants'

const TYPOGRAPHY_PATTERN = /\b(text-|font-)/

describe('InputActionGroup', () => {
  it('renders input and action as one grouped control', () => {
    render(
      <InputActionGroup>
        <Input grouped aria-label="Name" />
        <InputActionGroup.Action>
          <Button type="button" variant="attached">
            Generate
          </Button>
        </InputActionGroup.Action>
      </InputActionGroup>,
    )

    expect(screen.getByRole('group')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument()
  })

  it('keeps the input editable when only the action is disabled', () => {
    render(
      <InputActionGroup>
        <Input grouped aria-label="Name" />
        <InputActionGroup.Action disabled>
          <Button type="button" variant="attached">
            Generate
          </Button>
        </InputActionGroup.Action>
      </InputActionGroup>,
    )

    expect(screen.getByRole('textbox', { name: 'Name' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled()
  })

  it('disables input and action when the whole group is disabled', () => {
    render(
      <InputActionGroup disabled>
        <Input grouped aria-label="Name" disabled />
        <InputActionGroup.Action>
          <Button type="button" variant="attached">
            Generate
          </Button>
        </InputActionGroup.Action>
      </InputActionGroup>,
    )

    expect(screen.getByRole('textbox', { name: 'Name' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled()
  })

  it('does not submit a surrounding form from the attached action', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault())

    render(
      <form onSubmit={onSubmit}>
        <InputActionGroup>
          <Input grouped aria-label="Name" />
          <InputActionGroup.Action>
            <Button type="button" variant="attached">
              Generate
            </Button>
          </InputActionGroup.Action>
        </InputActionGroup>
      </form>,
    )

    await user.click(screen.getByRole('button', { name: 'Generate' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('wires action aria-describedby to the action button', () => {
    render(
      <InputActionGroup>
        <Input grouped aria-label="Name" />
        <InputActionGroup.Action aria-describedby="action-error">
          <Button type="button" variant="attached">
            Generate
          </Button>
        </InputActionGroup.Action>
      </InputActionGroup>,
    )

    expect(screen.getByRole('button', { name: 'Generate' })).toHaveAttribute(
      'aria-describedby',
      'action-error',
    )
  })

  it('keeps action segment geometry aligned across field sizes', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { unmount } = render(
        <InputActionGroup size={size}>
          <Input grouped aria-label="Name" size={size} />
          <InputActionGroup.Action>
            <Button type="button" variant="attached">
              Generate
            </Button>
          </InputActionGroup.Action>
        </InputActionGroup>,
      )

      const segment = screen.getByRole('button', { name: 'Generate' }).parentElement
      expect(segment?.className).toContain(fieldGroupedControlHeightClasses[size])
      expect(segment?.className).not.toMatch(TYPOGRAPHY_PATTERN)
      unmount()
    }
  })

  it('resolves attached button size from group size when omitted', () => {
    render(
      <InputActionGroup size="md">
        <Input grouped aria-label="Name" size="md" />
        <InputActionGroup.Action>
          <Button type="button" variant="attached">
            Generate
          </Button>
        </InputActionGroup.Action>
      </InputActionGroup>,
    )

    const button = screen.getByRole('button', { name: 'Generate' })
    expect(button.className).toContain(fieldGroupedControlActionPaddingClasses.md)
    expect(button.className).toContain('h-full')
    expect(button.className).toContain('w-full')
    expect(button.className).not.toMatch(/\bh-9\b/)
  })

  it('makes the attached button fill the action segment surface', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { unmount } = render(
        <InputActionGroup size={size}>
          <Input grouped aria-label="Name" size={size} />
          <InputActionGroup.Action>
            <Button type="button" variant="attached">
              Generate
            </Button>
          </InputActionGroup.Action>
        </InputActionGroup>,
      )

      const button = screen.getByRole('button', { name: 'Generate' })
      const segment = button.parentElement

      expect(button.className).toContain('h-full')
      expect(button.className).toContain('w-full')
      expect(button.className).toContain(fieldGroupedControlActionPaddingClasses[size])
      expect(button.className).toContain('rounded-r-md')
      expect(button.className).not.toMatch(/\bh-(8|9|10|11)\b/)

      expect(segment?.className).toBe(inputActionGroupActionSegmentVariants({ size }))
      expect(segment?.className).not.toMatch(/\b(p|px|py)-/)

      unmount()
    }
  })

  it('does not apply typography classes to action segment wrappers', () => {
    render(
      <InputActionGroup size="md">
        <Input grouped aria-label="Name" size="md" />
        <InputActionGroup.Action>
          <Button type="button" variant="attached" size="default">
            Generate
          </Button>
        </InputActionGroup.Action>
      </InputActionGroup>,
    )

    const segment = screen.getByRole('button', { name: 'Generate' }).parentElement
    expect(segment?.className).toBe(inputActionGroupActionSegmentVariants({ size: 'md' }))

    const button = screen.getByRole('button', { name: 'Generate' })
    expect(button.className).toContain('font-body-emphasis')
    expect(button.className).toContain('text-sm')
    expect(button.className).not.toContain('text-md')
  })
})
