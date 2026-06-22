import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { render, type RenderOptions, type RenderResult } from '@testing-library/react'

interface RenderWithDataRouterOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  initialIndex?: number
}

/** Renders UI under a React Router data router — required for `useBlocker` tests. */
export function renderWithDataRouter(
  routes: RouteObject[],
  { initialEntries = ['/'], initialIndex, ...renderOptions }: RenderWithDataRouterOptions = {},
): RenderResult {
  const router = createMemoryRouter(routes, { initialEntries, initialIndex })
  return render(<RouterProvider router={router} />, renderOptions)
}
