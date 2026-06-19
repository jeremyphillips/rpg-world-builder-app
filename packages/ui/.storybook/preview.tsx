import { createStorybookPreview } from '@rpg/config/storybook/preview-base'

import { withThemeContext } from '../src/storybook/with-theme-context'
import '@fontsource-variable/inter'
import '@fontsource-variable/lora'
import '../src/styles/globals.css'

export default createStorybookPreview({
  decorators: [withThemeContext],
})
