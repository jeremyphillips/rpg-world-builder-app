import type { Decorator } from '@storybook/react-vite'
import { createStorybookPreview } from '@rpg/config/storybook/preview-base'
import { withSemanticClassCaption } from '@rpg/ui/storybook/semantic-class-caption'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import {
  rowAnatomyOutlineGlobalTypes,
  rowAnatomyOutlineInitialGlobals,
  withRowAnatomyOutline,
} from '../src/stories/card-recipes/with-row-anatomy-outline'

import '../src/index.css'

const withMemoryRouter: Decorator = (Story) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
)

export default createStorybookPreview({
  decorators: [withMemoryRouter, withRowAnatomyOutline, withSemanticClassCaption],
  globalTypes: rowAnatomyOutlineGlobalTypes,
  initialGlobals: rowAnatomyOutlineInitialGlobals,
})
