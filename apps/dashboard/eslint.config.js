import react from '@rpg/config/eslint/react'
import storybook from 'eslint-plugin-storybook'

export default [...react, ...storybook.configs['flat/recommended']]
