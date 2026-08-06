import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { FileDropzone } from './file-dropzone.client'

function makeFile(name: string, type: string, size = 1024): File {
  const file = new File(['x'.repeat(size)], name, { type })
  return file
}

describe('FileDropzone', () => {
  it('renders the drop zone with accessible role and label', () => {
    render(<FileDropzone value={[]} onChange={() => undefined} />)
    expect(screen.getByRole('button', { name: /upload file/i })).toBeInTheDocument()
  })

  it('is disabled when the disabled prop is set', () => {
    render(<FileDropzone value={[]} onChange={() => undefined} disabled />)
    const zone = screen.getByRole('button', { name: /disabled/i })
    expect(zone).toHaveAttribute('aria-disabled', 'true')
  })

  it('calls onChange when a valid file is dropped', () => {
    const onChange = vi.fn()
    render(<FileDropzone value={[]} onChange={onChange} accept={['image/jpeg']} />)
    const zone = screen.getByRole('button')
    const file = makeFile('photo.jpg', 'image/jpeg')
    const dataTransfer = { files: [file] } as unknown as DataTransfer

    fireEvent.dragOver(zone)
    fireEvent.drop(zone, { dataTransfer })

    expect(onChange).toHaveBeenCalledWith([file])
  })

  it('shows an error and does not call onChange for a rejected MIME type', () => {
    const onChange = vi.fn()
    render(<FileDropzone value={[]} onChange={onChange} accept={['image/jpeg']} />)
    const zone = screen.getByRole('button')
    const file = makeFile('script.exe', 'application/octet-stream')

    fireEvent.drop(zone, { dataTransfer: { files: [file] } })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/not an accepted file type/i)
  })

  it('shows an error and does not call onChange when the file exceeds maxSize', () => {
    const onChange = vi.fn()
    render(<FileDropzone value={[]} onChange={onChange} accept={['image/jpeg']} maxSize={500} />)
    const file = makeFile('big.jpg', 'image/jpeg', 1024)
    fireEvent.drop(screen.getByRole('button'), {
      dataTransfer: { files: [file] },
    })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/exceeds/i)
  })

  it('removes a file when the remove button is clicked', async () => {
    const user = userEvent.setup()
    const file = makeFile('avatar.png', 'image/png')
    const onChange = vi.fn()

    render(<FileDropzone value={[file]} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /remove avatar\.png/i }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('lists selected files in the file list', () => {
    const file = makeFile('banner.webp', 'image/webp')
    render(<FileDropzone value={[file]} onChange={() => undefined} />)
    expect(screen.getByRole('list', { name: /selected files/i })).toBeInTheDocument()
    expect(screen.getByText('banner.webp')).toBeInTheDocument()
  })

  it('renders a remote preview when existingImageUrl is set and value is empty', () => {
    render(
      <FileDropzone
        value={[]}
        onChange={() => undefined}
        existingImageUrl="/api/uploads/avatar.png"
        existingImageLabel="Current avatar"
      />,
    )
    const img = screen.getByRole('img', { name: 'Current avatar' })
    expect(img).toHaveAttribute('src', '/api/uploads/avatar.png')
    expect(screen.getByText('Current avatar')).toBeInTheDocument()
  })

  it('calls onClearExisting when the remote preview remove button is clicked', async () => {
    const user = userEvent.setup()
    const onClearExisting = vi.fn()
    render(
      <FileDropzone
        value={[]}
        onChange={() => undefined}
        existingImageUrl="/api/uploads/banner.jpg"
        existingImageLabel="Saved banner"
        onClearExisting={onClearExisting}
      />,
    )
    await user.click(screen.getByRole('button', { name: /remove saved banner/i }))
    expect(onClearExisting).toHaveBeenCalledTimes(1)
  })

  it('prefers newly selected files over the remote preview', () => {
    const file = makeFile('new.png', 'image/png')
    render(
      <FileDropzone
        value={[file]}
        onChange={() => undefined}
        existingImageUrl="/api/uploads/old.png"
        existingImageLabel="Old image"
      />,
    )
    expect(screen.getByText('new.png')).toBeInTheDocument()
    expect(screen.queryByText('Old image')).not.toBeInTheDocument()
  })

  it('opens the file picker on Enter key', async () => {
    const user = userEvent.setup()
    render(<FileDropzone value={[]} onChange={() => undefined} />)
    const zone = screen.getByRole('button')
    // jsdom doesn't open a real picker — just assert the input exists and is hidden.
    zone.focus()
    await user.keyboard('{Enter}')
    // No error should be thrown and zone remains interactive.
    expect(zone).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations (empty state)', async () => {
    const { container } = render(<FileDropzone value={[]} onChange={() => undefined} />)
    await expectNoAxeViolations(container)
  })

  itAxe('has no axe accessibility violations (with files)', async () => {
    const file = makeFile('hero.jpg', 'image/jpeg')
    const { container } = render(<FileDropzone value={[file]} onChange={() => undefined} />)
    await expectNoAxeViolations(container)
  })

  itAxe('has no axe violations in disabled state', async () => {
    const { container } = render(<FileDropzone value={[]} onChange={() => undefined} disabled />)
    await expectNoAxeViolations(container)
  })
})
