import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { cn } from '../../lib/utils'
import { Badge } from './badge'
import { BADGE_APPEARANCES, BADGE_TONES, badgeSurfaceClasses } from './badge-appearance.lib'
import { badgeEmphasisClass, badgeLayoutVariants } from './badge.variants'
import { establishSurfaceCurrent } from './surface-current.lib'

const BADGE_CLASS_SPECS = [
  {
    key: 'badge / outline / neutral / md',
    className: cn('ui-pill', badgeSurfaceClasses('outline', 'neutral')),
    keyValues: 'transparent fill, neutral outline foreground',
    useCase: 'Default metadata badge',
  },
  {
    key: 'badge / soft / destructive / sm',
    className: cn('ui-pill', badgeSurfaceClasses('soft', 'destructive')),
    keyValues: 'semantic destructive soft fill',
    useCase: 'Compact table or rail status',
  },
  {
    key: 'badge / strong / info / md',
    className: cn('ui-pill', badgeSurfaceClasses('strong', 'info')),
    keyValues: 'semantic info strong fill',
    useCase: 'High-emphasis classification',
  },
  {
    key: 'badge / subdued / neutral soft / sm',
    className: cn('ui-pill', badgeSurfaceClasses('soft', 'neutral'), badgeEmphasisClass('subdued')),
    keyValues: 'muted foreground, soft neutral well',
    useCase: 'Exhausted or completed labels',
  },
  {
    key: 'badge / counter / destructive soft / sm',
    className: cn(
      'ui-pill',
      badgeSurfaceClasses('soft', 'destructive'),
      badgeLayoutVariants({ layout: 'counter' }),
    ),
    keyValues: 'tabular nums, min-width, tight padding-inline',
    useCase: 'Issue or validation counts',
  },
] as const

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: { layout: 'centered', semanticClasses: true },
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

/** Neutral borders should mix toward each shell’s `--surface-current`, not the page root only. */
export const NeutralSoftNestedSurfaces: Story = {
  name: 'Neutral soft / nested surfaces',
  parameters: { layout: 'padded', semanticClasses: true },
  render: () => (
    <div className="flex flex-col gap-6">
      <section className="space-y-2">
        <h3 className="text-style-label">Page background</h3>
        <div className={`rounded-lg bg-background p-4 ${establishSurfaceCurrent('background')}`}>
          <Badge appearance="soft" tone="neutral">
            Homebrew
          </Badge>
        </div>
      </section>
      <section className="space-y-2">
        <h3 className="text-style-label">Card</h3>
        <div className="ui-card p-4">
          <Badge appearance="soft" tone="neutral">
            Homebrew
          </Badge>
        </div>
      </section>
      <section className="space-y-2">
        <h3 className="text-style-label">Popover plane</h3>
        <div className="ui-popover-content ui-popover-content--popover w-fit p-4">
          <Badge appearance="soft" tone="neutral">
            Homebrew
          </Badge>
        </div>
      </section>
    </div>
  ),
}

export const SubduedEmphasis: Story = {
  name: 'Subdued emphasis',
  args: {
    appearance: 'soft',
    tone: 'neutral',
    emphasis: 'subdued',
    size: 'sm',
    children: 'Complete',
  },
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
          <h3 className="mb-2 text-style-label capitalize">{appearance}</h3>
          <div className={`flex flex-wrap gap-2 rounded-lg p-4 ${surfaceClass}`}>
            {BADGE_TONES.map((tone) => (
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

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={BADGE_CLASS_SPECS.map((spec) => ({
        key: spec.key,
        sample: (
          <span data-semantic-class-target className={spec.className}>
            {spec.useCase}
          </span>
        ),
        propsLabel: spec.key,
        className: spec.className,
        keyValues: spec.keyValues,
        useCase: spec.useCase,
      }))}
    />
  ),
}
