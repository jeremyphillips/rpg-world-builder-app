import type { Meta, StoryObj } from '@storybook/react-vite'
import { Check } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { ComboboxOptionRow } from './combobox-option-row.client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu.client'
import { IdentityRow } from './identity-row.client'
import { InteractiveList } from './interactive-list.client'
import { InteractiveListRow } from './interactive-list-row.client'
import { MenuChoiceRow } from './menu-choice-row.client'
import { interactiveListChoiceMenuContentClasses } from './dropdown-menu-choice.variants'
import { interactiveFocusVariants } from './interactive-focus.variants'

const meta = {
  title: 'UI/InteractiveList/Parity',
  parameters: { layout: 'centered' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const FIXTURE = {
  heading: 'Fireball',
  classification: 'Spell',
  supporting: 'Level 3 · Evocation',
} as const

const menuIdentityFixture = {
  heading: FIXTURE.heading,
  supporting: `${FIXTURE.classification} · ${FIXTURE.supporting}`,
} as const

function DemoPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-96 overflow-hidden rounded-md border border-border bg-background">
      {children}
    </div>
  )
}

export const RowSeparators: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <DemoPanel>
        <InteractiveList role="listbox" aria-label="Three combobox rows">
          <ComboboxOptionRow
            optionId="fireball"
            {...FIXTURE}
            selected={false}
            onSelect={() => {}}
          />
          <ComboboxOptionRow
            optionId="magic-missile"
            heading="Magic Missile"
            classification="Spell"
            supporting="Level 1 · Evocation"
            selected={false}
            onSelect={() => {}}
          />
          <ComboboxOptionRow
            optionId="shield"
            heading="Shield"
            classification="Spell"
            supporting="Level 1 · Abjuration"
            selected={false}
            onSelect={() => {}}
          />
        </InteractiveList>
      </DemoPanel>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline">
            Menu with two rows
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={cn(interactiveListChoiceMenuContentClasses)}>
          <InteractiveList>
            <MenuChoiceRow {...menuIdentityFixture} supportingWrap onSelect={() => {}} />
            <MenuChoiceRow
              heading="Magic Missile"
              supporting="Spell · Level 1 · Evocation"
              supportingWrap
              onSelect={() => {}}
            />
          </InteractiveList>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
}

export const SameIdentityAcrossHosts: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <DemoPanel>
        <InteractiveList role="listbox" aria-label="Combobox options">
          <ComboboxOptionRow
            optionId="fireball-option"
            {...FIXTURE}
            selected
            endSlot={<Check className="size-4 shrink-0" aria-hidden />}
            onSelect={() => {}}
          />
        </InteractiveList>
      </DemoPanel>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline">
            Menu choice
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={cn(interactiveListChoiceMenuContentClasses)}>
          <InteractiveList>
            <MenuChoiceRow {...menuIdentityFixture} supportingWrap onSelect={() => {}} />
          </InteractiveList>
        </DropdownMenuContent>
      </DropdownMenu>
      <DemoPanel>
        <InteractiveList>
          <InteractiveListRow content={<IdentityRow {...FIXTURE} size="md" />} asChild>
            <a href="/example" className={cn(interactiveFocusVariants({ context: 'standalone' }))}>
              Navigate
            </a>
          </InteractiveListRow>
        </InteractiveList>
      </DemoPanel>
    </div>
  ),
}
