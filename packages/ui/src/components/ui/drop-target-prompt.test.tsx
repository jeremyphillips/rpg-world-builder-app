import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import {
  dropTargetActiveSurfaceClasses,
  dropTargetInvalidSurfaceClasses,
} from './drop-target.variants'
import { DropTargetPrompt } from './drop-target-prompt.client'

const inlineIdleProps = {
  accept: ['image/jpeg', 'image/png'] as string[],
  showBrowse: true,
  onBrowse: vi.fn(),
  maxSize: 5_242_880,
  layout: 'inline' as const,
}

describe('DropTargetPrompt', () => {
  it('renders idle copy and browse files', () => {
    render(<DropTargetPrompt {...inlineIdleProps} />)
    expect(screen.getByText('Add an image')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /browse files/i })).toBeInTheDocument()
    expect(screen.getByText('JPG or PNG · Max 5 MB')).toBeInTheDocument()
  })

  it('renders active and invalid shared titles', () => {
    const { rerender } = render(<DropTargetPrompt accept={['image/png']} multiple state="active" />)
    expect(screen.getByText('Drop to upload')).toBeInTheDocument()

    rerender(<DropTargetPrompt accept={['image/png']} multiple state="invalid" layout="cover" />)
    expect(screen.getByText("These files can't be added")).toBeInTheDocument()
  })

  it.each(['inline', 'cover'] as const)(
    'uses overlay scrim SSOT for %s active and invalid states',
    (layout) => {
      const { rerender, container } = render(
        <DropTargetPrompt accept={['image/png']} multiple layout={layout} state="active" />,
      )
      for (const className of dropTargetActiveSurfaceClasses.split(' ')) {
        expect(container.firstElementChild).toHaveClass(className)
      }

      rerender(<DropTargetPrompt accept={['image/png']} multiple layout={layout} state="invalid" />)
      for (const className of dropTargetInvalidSurfaceClasses.split(' ')) {
        expect(container.firstElementChild).toHaveClass(className)
      }
    },
  )

  it('preserves inline height during active by hiding idle chrome in place', () => {
    const { rerender, container } = render(<DropTargetPrompt {...inlineIdleProps} state="idle" />)
    const surface = container.firstElementChild as HTMLElement
    const idleHeight = surface.getBoundingClientRect().height

    rerender(<DropTargetPrompt {...inlineIdleProps} state="active" />)

    expect(surface.getBoundingClientRect().height).toBe(idleHeight)
    expect(surface.querySelector('p.text-sm.text-muted-foreground')).toHaveClass('invisible')
    expect(surface.querySelector('p.text-xs.text-muted-foreground')).toHaveClass('invisible')
    expect(surface.querySelector('button')).toHaveClass('invisible')
  })

  it('unmounts idle chrome on cover active state', () => {
    render(
      <DropTargetPrompt
        {...inlineIdleProps}
        layout="cover"
        state="active"
        showBrowse
        onBrowse={vi.fn()}
      />,
    )
    expect(
      screen.queryByText('Drag and drop an image here, or choose a file'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Browse files')).not.toBeInTheDocument()
  })
})
