import { describe, expect, it, vi } from 'vitest'
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom'
import { render, screen } from '@testing-library/react'

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
          element: <Outlet />,
          children: [
            {
              path: 'characters',
              children: [{ path: ':characterId', element: <CharacterDetail /> }],
            },
          ],
        },
        { path: 'characters/new', element: <CharacterCreate /> },
      ],
      { initialEntries: ['/characters/new'] },
    )

    render(<RouterProvider router={router} />)

    expect(await screen.findByText('Character create screen')).toBeInTheDocument()
    expect(screen.queryByText('Character detail screen')).not.toBeInTheDocument()
  })
})
