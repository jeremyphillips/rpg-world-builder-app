import type { Meta, StoryObj } from '@storybook/react-vite'

import { ActionButton } from './action-button.client'
import { ACTION_ICON_VERBS, type ActionIconVerb } from './action-icons.map'

function actionVerbAriaLabel(action: ActionIconVerb): string {
  const spaced = action.replace(/([A-Z])/g, ' $1')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

const meta = {
  title: 'UI/ActionButton',
  component: ActionButton,
  tags: ['autodocs'],
} satisfies Meta<typeof ActionButton>

export default meta

type Story = StoryObj<typeof meta>

export const AddWithLabel: Story = {
  args: {
    action: 'add',
    children: 'Add row',
    variant: 'outline',
    size: 'sm',
  },
}

export const EditIconOnly: Story = {
  args: {
    action: 'edit',
    variant: 'ghost',
    size: 'icon',
    'aria-label': 'Edit',
  },
}

/** Title-line details affordance: neutral text chrome, icon-xs, default accessible name. */
export const DetailsTextIcon: Story = {
  args: {
    action: 'details',
    variant: 'text',
    tone: 'neutral',
    size: 'icon-xs',
  },
}

/** Every verb in `ACTION_ICON_VERBS` — ghost icon buttons with registry glyphs. */
export const ActionVerbs: Story = {
  args: {
    action: 'add',
    children: 'Add',
  },
  render: () => (
    <ul className="flex flex-wrap gap-4">
      {ACTION_ICON_VERBS.map((action) => (
        <li key={action} className="flex flex-col items-center gap-2">
          <ActionButton
            action={action}
            variant="ghost"
            size="icon"
            aria-label={actionVerbAriaLabel(action)}
          />
          <span className="text-style-caption">{action}</span>
        </li>
      ))}
    </ul>
  ),
}

/** Labeled and icon-only sizes — owner glyph from button host `--icon-size`. */
export const SizeLadder: Story = {
  args: {
    action: 'add',
    children: 'Add',
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col items-start gap-1">
          <span className="text-style-caption">xs (24px, 12px glyph)</span>
          <ActionButton action="add" variant="outline" size="xs">
            Add
          </ActionButton>
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-style-caption">sm (32px, 14px glyph)</span>
          <ActionButton action="add" variant="outline" size="sm">
            Add
          </ActionButton>
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-style-caption">default (36px, 14px glyph)</span>
          <ActionButton action="add" variant="outline">
            Add
          </ActionButton>
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-style-caption">lg (40px, 16px glyph)</span>
          <ActionButton action="add" variant="outline" size="lg">
            Add
          </ActionButton>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col items-start gap-1">
          <span className="text-style-caption">icon-xs (24px, 14px glyph)</span>
          <ActionButton action="edit" variant="ghost" size="icon-xs" aria-label="Edit" />
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-style-caption">icon-sm (32px, 16px glyph)</span>
          <ActionButton action="edit" variant="ghost" size="icon-sm" aria-label="Edit" />
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-style-caption">icon (36px, 20px glyph)</span>
          <ActionButton action="edit" variant="ghost" size="icon" aria-label="Edit" />
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-style-caption">icon-lg (40px, 24px glyph)</span>
          <ActionButton action="edit" variant="ghost" size="icon-lg" aria-label="Edit" />
        </div>
      </div>
    </div>
  ),
}
