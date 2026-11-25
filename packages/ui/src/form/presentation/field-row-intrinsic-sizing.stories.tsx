'use client'

import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { Field } from '../../components/ui/field.client'
import { FieldLayout } from '../../components/ui/field-layout'
import { FieldRowAnatomyProvider } from '../../components/ui/field-row-anatomy.context'
import { Input } from '../../components/ui/input.client'
import { resolveFieldRowAnatomyPresentation } from '../../components/ui/field-row-anatomy.variants'
import {
  assertFieldIntrinsicRowParticipant,
  participantWidthDelta,
} from '../../storybook/field-intrinsic-row-geometry'

const LONG_HINT =
  'Choose at least two alternative movement modes. Spider climb also grants climb when this trait is present on the creature.'
const SHORT_LABEL = 'Available modes'

function IntrinsicRowHarness({
  leftHint,
  rightHint,
  leftLabel = SHORT_LABEL,
  rowTestId = 'intrinsic-row',
  modesTestId = 'modes-field',
}: {
  leftHint?: string
  rightHint?: string
  leftLabel?: string
  rowTestId?: string
  modesTestId?: string
}) {
  const presentation = resolveFieldRowAnatomyPresentation(['auto', 'auto'])

  return (
    <FieldRowAnatomyProvider>
      <div
        data-field-row=""
        data-field-row-anatomy=""
        data-testid={rowTestId}
        className={presentation.className}
        style={presentation.style}
      >
        <Field.Root
          id={`${modesTestId}-control`}
          width="auto"
          hint={leftHint}
          anatomy
          rowParticipation
          data-testid={modesTestId}
        >
          <FieldLayout
            label={<Field.Label>{leftLabel}</Field.Label>}
            control={<Input aria-label="Modes" defaultValue="fly" className="w-24" />}
          />
        </Field.Root>
        <Field.Root
          id="speed-control"
          width="auto"
          hint={rightHint}
          anatomy
          rowParticipation
          data-testid="speed-field"
        >
          <FieldLayout
            label={<Field.Label>Speed</Field.Label>}
            control={<Input aria-label="Speed" defaultValue="30" className="w-16" />}
          />
        </Field.Root>
      </div>
    </FieldRowAnatomyProvider>
  )
}

const meta = {
  title: 'Internal/Forms/Layout/FieldRowIntrinsicSizing',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Geometry gate for auto row participants — label∪control set column width; spill hints wrap without zero-width regression.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ProductionIntrinsicSizing: Story = {
  render: () => <IntrinsicRowHarness leftHint={LONG_HINT} />,
  play: async ({ canvasElement }) => {
    const participant = canvasElement.querySelector('[data-testid="modes-field"]') as HTMLElement
    await assertFieldIntrinsicRowParticipant(participant)
  },
}

export const HintDoesNotExpandColumn: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <IntrinsicRowHarness
        rowTestId="row-no-hint"
        modesTestId="modes-no-hint"
        leftHint={undefined}
      />
      <IntrinsicRowHarness
        rowTestId="row-long-hint"
        modesTestId="modes-long-hint"
        leftHint={LONG_HINT}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const withoutHint = canvasElement.querySelector('[data-testid="modes-no-hint"]') as HTMLElement
    const withHint = canvasElement.querySelector('[data-testid="modes-long-hint"]') as HTMLElement
    await assertFieldIntrinsicRowParticipant(withHint)
    await assertFieldIntrinsicRowParticipant(withoutHint)
    await expect(participantWidthDelta(withHint, withoutHint)).toBeLessThanOrEqual(3)
  },
}

/**
 * Manual baseline — do not apply spill CSS to `[data-field-intrinsic-sizing]`.
 * Automated guard: `ProductionIntrinsicSizing` play asserts label/hint width &gt; 0.
 */
export const ZeroWidthRegressionBaseline: Story = {
  render: () => (
    <>
      <style>
        {`
          [data-testid="modes-field"] [data-field-intrinsic-sizing] {
            width: 0;
            min-width: 100%;
          }
        `}
      </style>
      <IntrinsicRowHarness leftHint={LONG_HINT} />
    </>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Illustrates the prior failure mode when spill constraints target sizing nodes. The production play suite guards non-zero label/hint width.',
      },
    },
  },
}

export const LongLabelWidensColumn: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <IntrinsicRowHarness rowTestId="row-short-label" modesTestId="modes-short" />
      <IntrinsicRowHarness
        rowTestId="row-long-label"
        modesTestId="modes-long"
        leftLabel="A deliberately extended available modes label for sizing"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const longParticipant = canvasElement.querySelector('[data-testid="modes-long"]') as HTMLElement
    const shortParticipant = canvasElement.querySelector(
      '[data-testid="modes-short"]',
    ) as HTMLElement
    await assertFieldIntrinsicRowParticipant(longParticipant)
    const longW = longParticipant.getBoundingClientRect().width
    const shortW = shortParticipant.getBoundingClientRect().width
    await expect(longW).toBeGreaterThan(shortW)
  },
}
