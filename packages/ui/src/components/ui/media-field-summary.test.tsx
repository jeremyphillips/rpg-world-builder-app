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
    expect(screen.getByText('1 image · Limit reached')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Manage images' }))
    expect(onOpen).toHaveBeenCalledWith('one')
  })

  it('shows attachment count without capacity and opens from the gear control', () => {
    const onOpen = vi.fn()
    render(
      <MediaFieldSummary
        label="Images"
        layout="compact"
        items={[{ id: 'one' }, { id: 'two' }]}
        representativeId="two"
        maxItems={20}
        onOpen={onOpen}
      />,
    )
    expect(screen.getByText('2 images')).toBeInTheDocument()
    expect(screen.queryByText(/of 20/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Manage images' }))
    expect(onOpen).toHaveBeenCalledWith('two')
  })

  it('shows one image when a derived preview item is present without uploads', () => {
    const onOpen = vi.fn()
    render(
      <MediaFieldSummary
        label="Images"
        layout="compact"
        items={[{ id: 'system:elf' }]}
        attachmentCount={0}
        maxItems={20}
        representativeId="system:elf"
        onOpen={onOpen}
      />,
    )
    expect(screen.getByText('1 image')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Manage images' }))
    expect(onOpen).toHaveBeenCalledWith('system:elf')
  })

  it('restores pointer cursor and hover chrome on the preview control', () => {
    render(
      <MediaFieldSummary
        label="Images"
        layout="compact"
        items={[{ id: 'one' }]}
        maxItems={20}
        onOpen={vi.fn()}
      />,
    )
    const previewButton = screen.getByRole('button', { name: 'Images: 1 image' })
    expect(previewButton).toHaveClass('enabled:cursor-pointer')
    expect(previewButton.querySelector('.group-hover\\:border-ring\\/50')).toBeInTheDocument()
  })

  it('shows limit reached copy at capacity', () => {
    render(
      <MediaFieldSummary
        label="Images"
        layout="compact"
        items={Array.from({ length: 20 }, (_, index) => ({ id: `image-${index}` }))}
        attachmentCount={20}
        maxItems={20}
        onOpen={vi.fn()}
      />,
    )
    expect(screen.getByText('20 images · Limit reached')).toBeInTheDocument()
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
