import type { Meta, StoryObj } from '@storybook/react-vite'
import { Check } from 'lucide-react'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { ComboboxOptionRow } from './combobox-option-row.client'
import { InteractiveList } from './interactive-list.client'
import { InteractiveListRow } from './interactive-list-row.client'
import { InteractiveListViewport } from './interactive-list-viewport.client'
import { INTERACTIVE_ROW_CLASS_SPECS } from './interactive-row.styles'
import { interactiveRowVariants } from './interactive-row.variants'

const meta = {
  title: 'UI/InteractiveList',
  parameters: { layout: 'centered', semanticClasses: true },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

function DemoPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-96 overflow-hidden rounded-md border border-border bg-background">
      {children}
    </div>
  )
}

export const RowStates: Story = {
  render: () => (
    <DemoPanel>
      <InteractiveListViewport>
        <InteractiveList role="listbox" aria-label="Spells">
          <InteractiveListRow
            name="Fireball"
            classification="Spell"
            metadata="Level 3 · Evocation"
            highlighted
          />
          <ComboboxOptionRow
            optionId="magic-missile"
            heading="Magic Missile"
            classification="Spell"
            supporting="Level 1 · Evocation"
            selected
            endSlot={<Check className="size-4 shrink-0" aria-hidden />}
            onSelect={() => {}}
          />
        </InteractiveList>
      </InteractiveListViewport>
    </DemoPanel>
  ),
}

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={INTERACTIVE_ROW_CLASS_SPECS.map((spec) => ({
        key: spec.key,
        sample: (
          <div data-semantic-class-target className={interactiveRowVariants()}>
            {spec.useCase}
          </div>
        ),
        propsLabel: spec.key,
        className: `${interactiveRowVariants()} ${spec.className}`,
        keyValues: spec.keyValues,
        useCase: spec.useCase,
      }))}
    />
  ),
}
