// First stylesheet to name a cascade layer fixes order for the page.
import './preview.css'
import { createStorybookPreview } from '@rpg/config/storybook/preview-base'

import { withThemeContext } from '../src/storybook/with-theme-context'
import { withSemanticClassCaption } from '../src/stories/semantic-classes/with-semantic-class-caption'

export default createStorybookPreview({
  decorators: [withThemeContext, withSemanticClassCaption],
})
