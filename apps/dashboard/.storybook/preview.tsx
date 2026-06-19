import type { Decorator } from '@storybook/react-vite'
import { createStorybookPreview } from '@rpg/config/storybook/preview-base'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import '../src/index.css'

const withMemoryRouter: Decorator = (Story) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
)

export default createStorybookPreview({
  decorators: [withMemoryRouter],
})
