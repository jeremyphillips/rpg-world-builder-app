import type { Decorator } from '@storybook/react-vite'

import { rowAnatomyOutlineVariants } from './card-recipes.variants'

export const ROW_ANATOMY_OUTLINE_GLOBAL = 'rowAnatomyOutline' as const

export const rowAnatomyOutlineGlobalTypes = {
  [ROW_ANATOMY_OUTLINE_GLOBAL]: {
    description: 'Outline row-anatomy grids and cells',
    toolbar: {
      title: 'Show anatomy',
      icon: 'grid',
      items: [
        { value: 'off', title: 'Hide anatomy' },
        { value: 'on', title: 'Show anatomy' },
      ],
      dynamicTitle: true,
    },
  },
}

export const rowAnatomyOutlineInitialGlobals = { [ROW_ANATOMY_OUTLINE_GLOBAL]: 'off' }

export const withRowAnatomyOutline: Decorator = (Story, context) => {
  const enabled = context.globals[ROW_ANATOMY_OUTLINE_GLOBAL] === 'on'
  if (!enabled) return <Story />
  return (
    <div className={rowAnatomyOutlineVariants({ enabled })} data-row-anatomy-outline="">
      <Story />
    </div>
  )
}
