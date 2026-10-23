import { TriangleAlert } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../../stories/semantic-classes/class-reference-table'
import { SemanticText } from './semantic-text'
import { SEMANTIC_TEXT_CLASS_SPECS } from './semantic-text.styles'
import type { SemanticTextEmphasis, SemanticTextTone } from './semantic-text.variants'

const meta = {
  title: 'Typography/SemanticText',
  component: SemanticText,
  args: {
    children: 'Semantic label',
    emphasis: 'medium',
  },
} satisfies Meta<typeof SemanticText>

export default meta
type Story = StoryObj<typeof meta>

const TONES: SemanticTextTone[] = ['neutral', 'info', 'success', 'warning', 'destructive']
const EMPHASES: SemanticTextEmphasis[] = ['low', 'medium', 'high']

const EQUIPMENT_CALLOUT_SAMPLES = [
  { label: 'Standard gear', tone: 'info' as const, emphasis: 'low' as const },
  { label: 'Spellcasting focus', tone: 'info' as const, emphasis: 'medium' as const },
  { label: 'Essential', tone: 'info' as const, emphasis: 'high' as const },
]

function ToneRow({ tone }: { tone: SemanticTextTone }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {EMPHASES.map((emphasis) => (
        <SemanticText key={emphasis} tone={tone} emphasis={emphasis}>
          {tone} / {emphasis}
        </SemanticText>
      ))}
    </div>
  )
}

function SurfaceMatrix({ surface }: { surface: 'base' | 'subtle' }) {
  return (
    <div
      className={
        surface === 'subtle'
          ? 'space-y-3 rounded-md bg-surface-muted p-4'
          : 'space-y-3 rounded-md border border-border p-4'
      }
    >
      {TONES.map((tone) => (
        <ToneRow key={tone} tone={tone} />
      ))}
    </div>
  )
}

function EquipmentCalloutComparison({ surface }: { surface: 'base' | 'subtle' }) {
  return (
    <div
      className={
        surface === 'subtle'
          ? 'space-y-2 rounded-md bg-surface-muted p-4'
          : 'space-y-2 rounded-md border border-border bg-background p-4'
      }
    >
      {EQUIPMENT_CALLOUT_SAMPLES.map((sample) => (
        <SemanticText key={sample.label} tone={sample.tone} emphasis={sample.emphasis}>
          {sample.label}
        </SemanticText>
      ))}
    </div>
  )
}

export const Neutral: Story = {
  args: { tone: 'neutral', children: 'Standard gear' },
}

export const Informative: Story = {
  args: { tone: 'info', children: 'Starting option' },
}

export const Positive: Story = {
  args: { tone: 'success', children: 'Proficient' },
}

export const Caution: Story = {
  args: {
    tone: 'warning',
    emphasis: 'medium',
    icon: <TriangleAlert aria-hidden />,
    children: 'Not proficient',
  },
}

export const Negative: Story = {
  args: {
    tone: 'destructive',
    emphasis: 'high',
    icon: <TriangleAlert aria-hidden />,
    children: 'Cannot afford',
  },
}

export const BaseSurface: Story = {
  render: () => <SurfaceMatrix surface="base" />,
}

export const SubtleSurface: Story = {
  render: () => <SurfaceMatrix surface="subtle" />,
}

/** Equipment picker callout severities — compare hierarchy on the drawer base surface. */
export const EquipmentCalloutsBaseSurface: Story = {
  render: () => <EquipmentCalloutComparison surface="base" />,
}

/** Equipment picker callout severities on `bg-surface-muted` row shells (dark theme recommended). */
export const EquipmentCalloutsSubtleSurface: Story = {
  render: () => <EquipmentCalloutComparison surface="subtle" />,
}

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={SEMANTIC_TEXT_CLASS_SPECS.map((spec) => ({
        key: spec.key,
        sample: (
          <span data-semantic-class-target className={spec.className}>
            Status
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
