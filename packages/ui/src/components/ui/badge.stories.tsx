import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from './badge'
import { BADGE_APPEARANCES } from './badge-appearance.lib'
import { COMPACT_LABEL_TONES } from './compact-label.lib'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  args: {
    children: 'Label',
    size: 'md',
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const SoftInformative: Story = {
  args: { appearance: 'soft', tone: 'info', children: 'System' },
}

export const NeutralSoft: Story = {
  name: 'Neutral soft',
  args: { appearance: 'soft', tone: 'neutral', children: 'Homebrew' },
}

export const Outline: Story = {
  args: { appearance: 'outline', tone: 'neutral', children: 'Outline' },
}

export const Strong: Story = {
  args: { appearance: 'strong', tone: 'success', children: 'Essential' },
}

export const Small: Story = {
  name: 'Small (table source)',
  args: { appearance: 'soft', tone: 'neutral', size: 'sm', children: 'System' },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge appearance="soft" tone="neutral" size="sm">
        sm
      </Badge>
      <Badge appearance="soft" tone="neutral" size="md">
        md
      </Badge>
      <Badge appearance="soft" tone="neutral" size="lg">
        lg
      </Badge>
    </div>
  ),
}

function SurfaceMatrix({ surface, size }: { surface: 'base' | 'subtle'; size: 'sm' | 'md' }) {
  const surfaceClass = surface === 'subtle' ? 'bg-surface-muted' : 'bg-background'

  return (
    <div className="space-y-6">
      {BADGE_APPEARANCES.map((appearance) => (
        <section key={appearance}>
          <h3 className="mb-2 text-sm font-medium capitalize">{appearance}</h3>
          <div className={`flex flex-wrap gap-2 rounded-lg p-4 ${surfaceClass}`}>
            {COMPACT_LABEL_TONES.map((tone) => (
              <Badge key={`${appearance}-${tone}`} appearance={appearance} tone={tone} size={size}>
                {tone}
              </Badge>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/** Contrast matrix — appearance × tone on base and subtle surfaces (light/dark via Storybook theme). */
export const ContrastMatrixBaseSm: Story = {
  name: 'Contrast matrix / base / sm',
  parameters: { layout: 'padded' },
  render: () => <SurfaceMatrix surface="base" size="sm" />,
}

export const ContrastMatrixSubtleSm: Story = {
  name: 'Contrast matrix / subtle / sm',
  parameters: { layout: 'padded' },
  render: () => <SurfaceMatrix surface="subtle" size="sm" />,
}

export const ContrastMatrixBaseMd: Story = {
  name: 'Contrast matrix / base / md',
  parameters: { layout: 'padded' },
  render: () => <SurfaceMatrix surface="base" size="md" />,
}

export const ContrastMatrixSubtleMd: Story = {
  name: 'Contrast matrix / subtle / md',
  parameters: { layout: 'padded' },
  render: () => <SurfaceMatrix surface="subtle" size="md" />,
}

/** Legibility gate: sm badges with leading icon must not change height. */
export const LegibilitySmWithIcon: Story = {
  name: 'Legibility / sm with icon',
  render: () => (
    <div className="space-y-4">
      <div className="rounded-lg bg-background p-4">
        <Badge appearance="outline" tone="info" size="sm" leadingIcon="●">
          11px outline
        </Badge>
      </div>
      <div className="rounded-lg bg-surface-muted p-4">
        <Badge appearance="strong" tone="warning" size="sm" leadingIcon="●">
          11px strong
        </Badge>
      </div>
    </div>
  ),
}
