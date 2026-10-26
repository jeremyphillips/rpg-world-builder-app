import { Icon } from './icon/icon'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { semanticClassSelectArgType } from '../../stories/semantic-classes/semantic-class-arg-types.lib'
import { Button } from './button.client'
import { buttonVariants, type ButtonVariantProps } from './button.variants'
import { BUTTON_APPEARANCE_SPECS, BUTTON_SIZE_SPECS, UI_BUTTON_BLOCK_CLASS } from './button.styles'

const meta = {
  title: 'Primitives/Button',
  component: Button,
  parameters: {
    semanticClasses: true,
    docs: {
      description: {
        component: `${UI_BUTTON_BLOCK_CLASS} owns labeled, icon, text, and attached geometry in CSS. Appearances use semantic modifiers; \`size="xs"\` is the 24px micro tier.`,
      },
    },
  },
  args: {
    children: 'Button',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'text'],
      ...semanticClassSelectArgType(
        BUTTON_APPEARANCE_SPECS.map((spec) => ({
          value: spec.appearance === 'primary' ? 'default' : spec.appearance,
          className: spec.className,
        })),
        'variant',
      ),
    },
    size: {
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-lg'],
      ...semanticClassSelectArgType(
        BUTTON_SIZE_SPECS.map((spec) => ({
          value: spec.size === 'default' ? 'default' : spec.size,
          className: spec.className,
        })),
        'size',
      ),
    },
    tone: {
      control: 'select',
      options: ['accent', 'neutral', 'danger'],
      if: { arg: 'variant', eq: 'text' },
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Destructive: Story = {
  args: { variant: 'destructive' },
}

export const Outline: Story = {
  args: { variant: 'outline' },
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
}

export const TextNeutral: Story = {
  args: { variant: 'text', children: 'Change package' },
}

export const TextAccent: Story = {
  args: { variant: 'text', tone: 'accent', children: 'Choose class →' },
}

export const TextDanger: Story = {
  args: { variant: 'text', tone: 'danger', children: 'Delete draft' },
}

export const TextXsAdd: Story = {
  render: () => (
    <Button variant="text" size="xs">
      <Icon name="plus" size="owner" />
      Add relationship
    </Button>
  ),
}

export const TextAccentWithIcon: Story = {
  render: () => (
    <Button variant="text" tone="accent">
      Choose class
      <Icon name="arrow-right" size="owner" />
    </Button>
  ),
}

/** Desktop-dense micro-actions (11px labels, 24px chrome). Review touch targets on mobile. */
export const ExtraSmallMicroActions: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs" variant="outline">
        Change
      </Button>
      <Button size="xs" variant="ghost">
        Reset
      </Button>
      <Button size="xs" variant="ghost">
        Remove
      </Button>
      <Button size="xs" variant="text">
        Change
      </Button>
    </div>
  ),
}

export const SizeLadder: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col items-start gap-1">
        <span className="text-style-caption">xs (24px)</span>
        <Button size="xs" variant="outline">
          Reset
        </Button>
      </div>
      <div className="flex flex-col items-start gap-1">
        <span className="text-style-caption">sm (32px)</span>
        <Button size="sm" variant="outline">
          Reset
        </Button>
      </div>
      <div className="flex flex-col items-start gap-1">
        <span className="text-style-caption">default (36px)</span>
        <Button variant="outline">Reset</Button>
      </div>
    </div>
  ),
}

export const IconExtraSmall: Story = {
  render: () => (
    <Button size="icon-xs" variant="ghost" aria-label="Remove">
      <Icon name="trash" size="owner" />
    </Button>
  ),
}

export const Small: Story = {
  args: { size: 'sm' },
}

export const ExtraSmall: Story = {
  args: { size: 'xs' },
}

export const Large: Story = {
  args: { size: 'lg' },
}

export const IconLarge: Story = {
  render: () => (
    <Button size="icon-lg" aria-label="Large icon action">
      +
    </Button>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={BUTTON_SIZE_SPECS.map((spec) => ({
        key: spec.size,
        sample: (
          <Button
            variant="outline"
            size={spec.size as NonNullable<ButtonVariantProps['size']>}
            data-semantic-class-target
          >
            {spec.size}
          </Button>
        ),
        propsLabel: `size="${spec.size}"`,
        className: buttonVariants({
          variant: 'outline',
          size: spec.size as NonNullable<ButtonVariantProps['size']>,
        }),
        keyValues: `control height: ${spec.controlHeight}`,
        useCase: spec.useCase,
      }))}
    />
  ),
}
