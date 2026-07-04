import { describe, expect, it, vi } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { render, screen } from '@testing-library/react'

import { ConcentrationShell } from '@/components/layout/concentration-shell'

vi.mock('./character-create', () => ({
  CharacterCreate: () => <div>Character create screen</div>,
}))

vi.mock('./character-detail', () => ({
  CharacterDetail: () => <div>Character detail screen</div>,
}))

import { CharacterCreate } from './character-create'
import { CharacterDetail } from './character-detail'

describe('character routes', () => {
  it('renders the builder for /characters/new instead of the detail route', async () => {
    const router = createMemoryRouter(
      [
        {
          path: 'characters',
          children: [
            {
              element: <ConcentrationShell />,
              children: [{ path: 'new', element: <CharacterCreate /> }],
            },
            { path: ':characterId', element: <CharacterDetail /> },
          ],
        },
      ],
      { initialEntries: ['/characters/new'] },
    )

    render(<RouterProvider router={router} />)

    expect(await screen.findByText('Character create screen')).toBeInTheDocument()
    expect(screen.queryByText('Character detail screen')).not.toBeInTheDocument()
  })
})
