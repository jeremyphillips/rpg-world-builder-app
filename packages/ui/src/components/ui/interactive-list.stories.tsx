import type { Meta, StoryObj } from '@storybook/react-vite'
import { Check } from 'lucide-react'

import { ComboboxOptionRow } from './combobox-option-row.client'
import { InteractiveList } from './interactive-list.client'
import { InteractiveListRow } from './interactive-list-row.client'
import { InteractiveListViewport } from './interactive-list-viewport.client'

const meta = {
  title: 'UI/InteractiveList',
  parameters: { layout: 'centered' },
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
