import type { Meta, StoryObj } from '@storybook/react-vite'
import { Check, Search, X } from 'lucide-react'
import * as React from 'react'

import { Button } from './button.client'
import { Input } from './input.client'
import { ListResultEmpty, ListResultList } from './list-result-list.client'
import { ListResultGroupHeading } from './list-result-group-heading.client'
import { ListResultItem } from './list-result-item.client'
import { ListResultToolbar } from './list-result-toolbar.client'
import { ListResultViewport } from './list-result-viewport.client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'

const meta = {
  title: 'UI/ListResult',
  parameters: {
    layout: 'centered',
  },
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

export const Anatomy: Story = {
  render: () => (
    <DemoPanel>
      <ListResultToolbar
        search={
          <div className="relative flex h-9 w-full items-center">
            <Search className="pointer-events-none absolute left-0 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search content"
              aria-label="Search"
              size="sm"
              className="border-0 bg-transparent pl-6 shadow-none"
            />
          </div>
        }
        filter={
          <Select defaultValue="all">
            <SelectTrigger size="sm" aria-label="Filter by type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="spell">Spells</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <ListResultViewport>
        <ListResultGroupHeading id="spells-group">Spells · 2</ListResultGroupHeading>
        <ListResultList role="listbox" aria-label="Results">
          <ListResultItem
            name="Fireball"
            classification="Spell"
            metadata="Level 3 · Evocation"
            highlighted
            endSlot={<Check className="size-4 shrink-0 opacity-0" aria-hidden />}
          />
          <ListResultItem
            name="Magic Missile"
            classification="Spell"
            metadata="Level 1 · Evocation"
            selected
            endSlot={<Check className="size-4 shrink-0" aria-hidden />}
          />
        </ListResultList>
      </ListResultViewport>
    </DemoPanel>
  ),
}

export const SplitRowTrailingAction: Story = {
  render: () => (
    <DemoPanel>
      <ListResultList>
        <ListResultItem
          name="Fireball"
          classification="Spell"
          metadata="Homebrew"
          selected
          asChild
          trailingAction={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Clear selection"
            >
              <X className="size-3.5" />
            </Button>
          }
        >
          <button type="button" className="w-full">
            Select
          </button>
        </ListResultItem>
      </ListResultList>
    </DemoPanel>
  ),
}

export const Empty: Story = {
  render: () => (
    <DemoPanel>
      <ListResultViewport>
        <ListResultList>
          <ListResultEmpty>No content matches your search.</ListResultEmpty>
        </ListResultList>
      </ListResultViewport>
    </DemoPanel>
  ),
}
