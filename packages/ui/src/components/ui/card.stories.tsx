import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Text } from './text'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { Card, CardHeader } from './card'
import './card-surface-interaction-matrix.css'
import {
  CARD_CLASS_SPECS,
  CARD_SURFACE_TONES,
  cardSurfaceVariants,
  type CardSurfaceTone,
} from './card.variants'
import { IdentityRowHeadingLine } from './identity-row.client'
import { Input } from './input.client'
import { RadioOptionCard } from './radio-option-card.client'
import { RadioGroup } from './radio-group.client'

const meta = {
  title: 'Primitives/Card',
  component: Card,
  parameters: { semanticClasses: true },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const DefaultCard: Story = {
  name: 'Default (strong / flat / comfortable)',
  render: () => (
    <Card
      className="w-80"
      header={{
        title: 'Default Card',
        description: 'Strong tone, flat elevation, comfortable density.',
      }}
      footer={
        <>
          <Button variant="ghost">Cancel</Button>
          <Button>Create</Button>
        </>
      }
    >
      <div className="space-y-2">
        <label htmlFor="campaign-name" className="text-style-label">
          Name
        </label>
        <Input id="campaign-name" placeholder="The Sunless Citadel" />
      </div>
    </Card>
  ),
}

export const Default: Story = DefaultCard

export const ToneComparison: Story = {
  render: () => (
    <div className="grid max-w-5xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card header={{ title: 'Strong / flat', description: 'Default generic card.' }} />
      <Card
        tone="subtle"
        header={{ title: 'Subtle / flat', description: 'Light wash between lift and strong.' }}
      />
      <Card
        tone="quiet"
        header={{ title: 'Quiet / flat', description: 'Entity row and catalog frames.' }}
      />
      <Card
        tone="transparent"
        header={{ title: 'Transparent / flat', description: 'Border-only on parent surface.' }}
      />
    </div>
  ),
}

export const ElevationComparison: Story = {
  render: () => (
    <div className="grid max-w-4xl gap-6">
      {CARD_SURFACE_TONES.map((tone) => (
        <div key={tone} className="space-y-2">
          <Text variant="label">{tone} tone</Text>
          <div className="grid gap-4 md:grid-cols-3">
            {(['flat', 'subtle', 'raised'] as const).map((elevation) => (
              <Card
                key={elevation}
                tone={tone}
                elevation={elevation}
                header={{
                  title: elevation,
                  description: `${tone} · ${elevation}`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
}

export const Interactive: Story = {
  render: () => (
    <Card
      interactive
      className="w-80"
      header={{
        title: 'Equipment',
        description: 'Open a catalog family.',
      }}
    />
  ),
}

export const NavigableCompact: Story = {
  render: () => (
    <Card
      className="max-w-md"
      link={<a href="#creature-types">Creature types</a>}
      density="compact"
      tone="quiet"
      header={{
        title: 'Creature types',
        description: 'Taxonomic classification shared by species and monsters.',
      }}
    >
      <Text variant="caption">12 terms · 1 unavailable</Text>
    </Card>
  ),
}

export const NavigableStrong: Story = {
  render: () => (
    <div className="h-40 max-w-xs">
      <Card
        link={<a href="#weapons">Weapons</a>}
        stretch
        className="h-full"
        density="comfortable"
        tone="strong"
        header={{ title: 'Weapons' }}
      />
    </div>
  ),
}

export const DensityTypography: Story = {
  parameters: { semanticClasses: true },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <section className="space-y-3">
        <h2 className="text-style-label">Generic Card — compact / comfortable / spacious</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
            <Card
              key={density}
              density={density}
              header={{
                title: 'Equipment',
                description: 'Manage catalog content for this family.',
              }}
            />
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-style-label">Card + identity heading — density copy ladder</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
            <Card key={density} density={density} className="w-full">
              <CardHeader>
                <div data-testid={`card-identity-title-${density}`}>
                  <IdentityRowHeadingLine heading={<h3>Harbor District</h3>} />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-style-label">Reference — radio comfortable (16px bold title)</h2>
        <RadioGroup defaultValue="a" className="max-w-sm">
          <RadioOptionCard value="a" label="Fighter" description="Martial prowess" />
        </RadioGroup>
      </section>
    </div>
  ),
}

const SURFACE_MATRIX_TONES = CARD_SURFACE_TONES

const SURFACE_MATRIX_TONE_LABEL: Record<CardSurfaceTone, string> = {
  transparent: 'Transparent',
  quiet: 'Quiet',
  subtle: 'Subtle (tone)',
  strong: 'Strong',
}

type SurfaceMatrixState =
  | 'static-rest'
  | 'rest'
  | 'hover'
  | 'pressed'
  | 'selected'
  | 'selected-hover'
  | 'disabled'
  | 'focus'

const SURFACE_MATRIX_STATE_ROWS: { state: SurfaceMatrixState; label: string }[] = [
  { state: 'static-rest', label: 'Static rest' },
  { state: 'rest', label: 'Rest' },
  { state: 'hover', label: 'Hover' },
  { state: 'pressed', label: 'Pressed' },
  { state: 'selected', label: 'Selected' },
  { state: 'selected-hover', label: 'Selected + hover' },
  { state: 'disabled', label: 'Disabled' },
  { state: 'focus', label: 'Focus visible' },
]

function surfaceMatrixPreviewClass(state: SurfaceMatrixState): string | undefined {
  if (state === 'hover' || state === 'selected-hover') {
    return 'ui-card-surface-matrix-preview--hover'
  }
  if (state === 'pressed') {
    return 'ui-card-surface-matrix-preview--pressed'
  }
  if (state === 'focus') {
    return 'ui-card-surface-matrix-preview--focus'
  }
  return undefined
}

function surfaceMatrixShellClassName(tone: CardSurfaceTone, state: SurfaceMatrixState): string {
  const interactive = state !== 'static-rest'
  const selected = state === 'selected' || state === 'selected-hover'
  const disabled = state === 'disabled'

  return cn(
    cardSurfaceVariants({
      tone,
      density: 'comfortable',
      interactive,
      selected,
      disabled,
    }),
    'w-full min-h-[5.5rem]',
    surfaceMatrixPreviewClass(state),
  )
}

function surfaceMatrixTestId(tone: CardSurfaceTone, state: SurfaceMatrixState): string {
  return `matrix-${tone}-${state}`
}

function shellBackgroundColor(element: HTMLElement): string {
  return getComputedStyle(element).backgroundColor
}

function SurfaceMatrixCell({
  tone,
  state,
  label,
}: {
  tone: CardSurfaceTone
  state: SurfaceMatrixState
  label: string
}) {
  return (
    <div
      data-testid={surfaceMatrixTestId(tone, state)}
      data-matrix-tone={tone}
      data-matrix-state={state}
      className={surfaceMatrixShellClassName(tone, state)}
    >
      <div className={'ui-card__content'}>
        <Text variant="label">{label}</Text>
        <Text variant="caption">{tone} · comfortable inset</Text>
      </div>
    </div>
  )
}

function SurfaceMatrixTable({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[68rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="p-3 text-xs font-medium text-muted-foreground">State</th>
            {SURFACE_MATRIX_TONES.map((tone) => (
              <th key={tone} className="p-3 text-xs font-medium text-muted-foreground">
                {SURFACE_MATRIX_TONE_LABEL[tone]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SURFACE_MATRIX_STATE_ROWS.map(({ state, label }) => (
            <tr key={state} className="border-b border-border-subtle align-top">
              <th className="p-3 font-normal text-style-caption">{label}</th>
              {SURFACE_MATRIX_TONES.map((tone) => (
                <td key={tone} className="p-3">
                  <SurfaceMatrixCell tone={tone} state={state} label={label} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const SurfaceInteractionMatrix: Story = {
  name: 'Surface interaction matrix',
  tags: ['card-surface-colors'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Tone × interaction state grid with comfortable card inset. `Subtle (tone)` is surface fill (`--surface-subtle`), not `elevation="subtle"`. Hover, pressed, and focus cells use story-only preview classes that mirror `card.css`.',
      },
    },
  },
  render: () => (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <header className="space-y-1">
        <h2 className="text-style-label">Card surface interaction matrix</h2>
        <Text variant="supporting">
          Compare rest, hover, pressed, selected, disabled, and focus-visible fills on canvas and on
          a muted parent.
        </Text>
      </header>

      <section className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          On canvas
        </h3>
        <SurfaceMatrixTable />
      </section>

      <section className="space-y-3 rounded-lg border border-border bg-muted p-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Nested on muted panel
        </h3>
        <Text variant="supporting">
          Quiet interactive rest vs hover — common entity-row context.
        </Text>
        <div className="grid gap-4 md:grid-cols-2">
          <SurfaceMatrixCell tone="quiet" state="rest" label="Rest" />
          <SurfaceMatrixCell tone="quiet" state="hover" label="Hover" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Elevation (strong · interactive rest)
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {(['flat', 'subtle', 'raised'] as const).map((elevation) => (
            <div
              key={elevation}
              data-testid={`matrix-strong-rest-elevation-${elevation}`}
              className={cn(
                cardSurfaceVariants({
                  tone: 'strong',
                  density: 'comfortable',
                  interactive: true,
                  elevation,
                }),
                'min-h-[5.5rem] w-full',
              )}
            >
              <div className={'ui-card__content'}>
                <Text variant="label">{elevation}</Text>
                <Text variant="caption">strong · elevation</Text>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.ownerDocument.documentElement
    const selectedToken = getComputedStyle(root).getPropertyValue('--ui-surface-selected-bg').trim()
    expect(selectedToken.length).toBeGreaterThan(0)

    const query = (tone: CardSurfaceTone, state: SurfaceMatrixState) =>
      canvasElement.querySelector<HTMLElement>(
        `[data-testid="${surfaceMatrixTestId(tone, state)}"]`,
      )

    for (const tone of SURFACE_MATRIX_TONES) {
      for (const { state } of SURFACE_MATRIX_STATE_ROWS) {
        expect(query(tone, state), `missing ${tone} ${state}`).toBeTruthy()
      }
    }

    const transparentRest = query('transparent', 'rest')!
    const quietRest = query('quiet', 'rest')!
    const strongRest = query('strong', 'rest')!
    expect(shellBackgroundColor(quietRest)).not.toBe(shellBackgroundColor(strongRest))
    expect(shellBackgroundColor(transparentRest)).not.toBe(shellBackgroundColor(strongRest))

    for (const tone of SURFACE_MATRIX_TONES) {
      const rest = query(tone, 'rest')!
      const hover = query(tone, 'hover')!
      expect(shellBackgroundColor(hover)).not.toBe(shellBackgroundColor(rest))

      const pressed = query(tone, 'pressed')!
      expect(shellBackgroundColor(pressed)).not.toBe(shellBackgroundColor(hover))
    }

    const selectedByTone = SURFACE_MATRIX_TONES.map((tone) =>
      shellBackgroundColor(query(tone, 'selected')!),
    )
    expect(new Set(selectedByTone).size).toBe(1)

    for (const tone of SURFACE_MATRIX_TONES) {
      const selected = query(tone, 'selected')!
      const selectedHover = query(tone, 'selected-hover')!
      expect(shellBackgroundColor(selectedHover)).toBe(shellBackgroundColor(selected))
    }

    const quietDisabled = query('quiet', 'disabled')!
    expect(Number.parseFloat(getComputedStyle(quietDisabled).opacity)).toBeLessThan(1)
  },
}

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={CARD_CLASS_SPECS.map((spec) => ({
        key: spec.key,
        sample: (
          <div data-semantic-class-target className={spec.className}>
            <div className={'ui-card__content'}>{spec.useCase}</div>
          </div>
        ),
        propsLabel: spec.key,
        className: spec.className,
        keyValues: spec.keyValues,
        useCase: spec.useCase,
      }))}
    />
  ),
}
