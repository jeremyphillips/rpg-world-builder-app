import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  defaultEmblemPresentation,
  mediaRoleSurfaceCopy,
  type ContainPresentation,
} from '@rpg/contracts'

import { MediaEmblemEditor } from './media-emblem-editor.client'

function StatefulEditor({
  initialLayout = defaultEmblemPresentation(),
  onChange = vi.fn(),
}: {
  initialLayout?: ContainPresentation
  onChange?: (layout: ContainPresentation) => void
}) {
  const [layout, setLayout] = useState(initialLayout)
  return (
    <MediaEmblemEditor
      src="/emblem.png"
      source={{ width: 512, height: 256 }}
      layout={layout}
      instructions={mediaRoleSurfaceCopy.emblem.instructions}
      onChange={(next) => {
        onChange(next)
        setLayout(next)
      }}
    />
  )
}

describe('MediaEmblemEditor', () => {
  it('updates artwork size and resets to default', () => {
    const onChange = vi.fn()

    render(<StatefulEditor onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Artwork size'), { target: { value: '0.75' } })
    expect(onChange).toHaveBeenLastCalledWith({ mode: 'contain', scale: 0.75 })

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(onChange).toHaveBeenLastCalledWith(defaultEmblemPresentation())
  })

  it('centers a shifted emblem and disables Center when already centered', () => {
    const onChange = vi.fn()

    render(
      <StatefulEditor
        initialLayout={{ mode: 'contain', scale: 0.5, offset: { x: 0.5, y: 0 } }}
        onChange={onChange}
      />,
    )

    const center = screen.getByRole('button', { name: 'Center' })
    expect(center).not.toBeDisabled()
    fireEvent.click(center)
    expect(onChange).toHaveBeenLastCalledWith({ mode: 'contain', scale: 0.5 })
  })

  it('disables Reset when the presentation is already default', () => {
    render(
      <MediaEmblemEditor
        src="/emblem.png"
        source={{ width: 256, height: 256 }}
        layout={defaultEmblemPresentation()}
        instructions={mediaRoleSurfaceCopy.emblem.instructions}
        onChange={() => {}}
      />,
    )

    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
  })
})
