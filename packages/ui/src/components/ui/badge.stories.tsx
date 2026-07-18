import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from './badge'
import { COMPACT_LABEL_APPEARANCES, COMPACT_LABEL_TONES } from './compact-label.lib'

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

export const Neutral: Story = {
  args: { appearance: 'neutral', tone: 'neutral', children: 'Homebrew' },
}

export const Outline: Story = {
  args: { appearance: 'outline', tone: 'neutral', children: 'Outline' },
}

export const AccentOutline: Story = {
  args: { appearance: 'accent-outline', tone: 'success', children: 'Equipped' },
}

export const Small: Story = {
  name: 'Small (table source)',
  args: { appearance: 'neutral', tone: 'neutral', size: 'sm', children: 'System' },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge appearance="neutral" tone="neutral" size="sm">
        sm
      </Badge>
      <Badge appearance="neutral" tone="neutral" size="md">
        md
      </Badge>
      <Badge appearance="neutral" tone="neutral" size="lg">
        lg
      </Badge>
    </div>
  ),
}

function SurfaceMatrix({ surface }: { surface: 'base' | 'subtle' }) {
  const surfaceClass = surface === 'subtle' ? 'bg-muted/30' : 'bg-background'

  return (
    <div className="space-y-6">
      {COMPACT_LABEL_APPEARANCES.map((appearance) => (
        <section key={appearance}>
          <h3 className="mb-2 text-sm font-medium capitalize">{appearance}</h3>
          <div className={`flex flex-wrap gap-2 rounded-lg p-4 ${surfaceClass}`}>
            {COMPACT_LABEL_TONES.map((tone) => (
              <Badge key={`${appearance}-${tone}`} appearance={appearance} tone={tone} size="sm">
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
export const ContrastMatrixBase: Story = {
  name: 'Contrast matrix / base surface',
  parameters: { layout: 'padded' },
  render: () => <SurfaceMatrix surface="base" />,
}

export const ContrastMatrixSubtle: Story = {
  name: 'Contrast matrix / subtle surface',
  parameters: { layout: 'padded' },
  render: () => <SurfaceMatrix surface="subtle" />,
}

/** Legibility gate: 11px + font-light on sm badges. */
export const LegibilitySmWeight300: Story = {
  name: 'Legibility / sm weight 300',
  render: () => (
    <div className="space-y-4">
      <div className="rounded-lg bg-background p-4">
        <Badge appearance="outline" tone="info" size="sm">
          11px outline
        </Badge>
      </div>
      <div className="rounded-lg bg-muted/30 p-4">
        <Badge appearance="accent-outline" tone="warning" size="sm">
          11px accent-outline
        </Badge>
      </div>
    </div>
  ),
}
