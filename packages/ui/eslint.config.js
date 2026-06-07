import react from '@rpg/config/eslint/react'
import storybook from 'eslint-plugin-storybook'

export default [
  ...react,
  ...storybook.configs['flat/recommended'],
  {
    // This is a component library, not an app with React Fast Refresh, so the
    // "only export components" hygiene rule does not apply. shadcn primitives
    // intentionally export variant helpers (e.g. `buttonVariants`) alongside
    // their component.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]
