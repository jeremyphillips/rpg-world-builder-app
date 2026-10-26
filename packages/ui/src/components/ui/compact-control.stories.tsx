import { Icon } from './icon/icon'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { Button } from './button.client'
import {
  COMPACT_CONTROL_RECIPE_SPECS,
  resolveCompactControlRecipeClasses,
  UI_COMPACT_CONTROL_BLOCK_CLASS,
} from './compact-control.styles'

const meta = {
  title: 'Design tokens/Compact control',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `${UI_COMPACT_CONTROL_BLOCK_CLASS} geometry for dense chrome — see compact-control.css.`,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const HitTargetPairings: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        aria-label="Compact icon"
        className={resolveCompactControlRecipeClasses('icon-compact')}
      >
        <Icon name="plus" size="2xl" />
      </button>
      <button type="button" className={resolveCompactControlRecipeClasses('text-compact')}>
        View
      </button>
      <button
        type="button"
        className={resolveCompactControlRecipeClasses('text-with-icon-compact')}
      >
        <Icon name="settings" size="2xl" />
        Compact text
      </button>
      <button
        type="button"
        aria-label="Default icon"
        className={resolveCompactControlRecipeClasses('icon-default')}
      >
        <Icon name="settings" size="2xl" />
      </button>
      <button
        type="button"
        aria-label="Large icon"
        className={resolveCompactControlRecipeClasses('icon-lg')}
      >
        <Icon name="settings" size="2xl" />
      </button>
    </div>
  ),
}

export const ButtonIntegration: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="icon-xs" aria-label="Remove">
        <Icon name="plus" size="2xl" />
      </Button>
      <Button size="xs">
        <Icon name="settings" size="2xl" />
        Compact
      </Button>
      <Button size="icon" aria-label="Settings">
        <Icon name="settings" size="2xl" />
      </Button>
      <Button size="icon-lg" aria-label="Settings large">
        <Icon name="settings" size="2xl" />
      </Button>
    </div>
  ),
}

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={COMPACT_CONTROL_RECIPE_SPECS.map((spec) => ({
        key: spec.recipe,
        sample: (
          <button
            type="button"
            aria-label={spec.recipe}
            className={resolveCompactControlRecipeClasses(spec.recipe)}
            data-semantic-class-target
          >
            {spec.recipe.startsWith('icon') ? <Icon name="plus" size="2xl" /> : spec.recipe}
          </button>
        ),
        propsLabel: spec.recipe,
        className: resolveCompactControlRecipeClasses(spec.recipe),
        keyValues: `hit target: ${spec.hitTarget}; glyph: ${spec.iconGlyph}`,
        useCase: spec.useCase,
      }))}
    />
  ),
}
