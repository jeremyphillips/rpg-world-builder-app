import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MediaFieldSummary } from './media-field-summary.client'

describe('MediaFieldSummary', () => {
  it('uses one compact control with singular empty copy at capacity one', () => {
    const onOpen = vi.fn()
    render(
      <MediaFieldSummary
        label="Portrait"
        layout="compact"
        items={[]}
        maxItems={1}
        onOpen={onOpen}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Portrait: No image. Add' }))
    expect(onOpen).toHaveBeenCalledWith(undefined)
  })

  it('uses singular populated copy at capacity one', () => {
    const onOpen = vi.fn()
    render(
      <MediaFieldSummary
        label="Portrait"
        layout="compact"
        items={[{ id: 'one' }]}
        maxItems={1}
        onOpen={onOpen}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Portrait: Image. Change' }))
    expect(onOpen).toHaveBeenCalledWith('one')
  })

  it('shows capacity copy and opens the representative attachment', () => {
    const onOpen = vi.fn()
    render(
      <MediaFieldSummary
        label="Images"
        layout="compact"
        items={[{ id: 'one' }, { id: 'two' }]}
        representativeId="two"
        maxItems={3}
        onOpen={onOpen}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Images: 2 of 3 images · Manage' }))
    expect(onOpen).toHaveBeenCalledWith('two')
  })

  it('omits the built-in expanded header when showHeader is false', () => {
    render(
      <MediaFieldSummary
        label="Campaign images"
        layout="expanded"
        showHeader={false}
        items={[]}
        maxItems={20}
        onOpen={vi.fn()}
      />,
    )
    expect(screen.queryByText('Campaign images')).not.toBeInTheDocument()
    expect(screen.getByText('No images yet.')).toBeInTheDocument()
  })

  it('renders three thumbnails and a stable hidden-count tile after four items', () => {
    const onOpen = vi.fn()
    const items = Array.from({ length: 7 }, (_, index) => ({ id: `image-${index + 1}` }))
    render(
      <MediaFieldSummary
        label="Images"
        layout="expanded"
        items={items}
        maxItems={20}
        onOpen={onOpen}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Manage 4 more images' }))
    expect(onOpen).toHaveBeenCalledWith('image-4')
  })
})
