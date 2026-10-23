'use client'

import * as React from 'react'

import { Button } from './button.client'
import { CollapsibleTrigger } from './collapsible.client'
import { DisclosureIndicator } from './disclosure-indicator.client'
import { SelectionTargetRaised } from './selection-target.client'

export function DisclosureChevronTrigger({ label }: { label: string }): React.JSX.Element {
  return (
    <SelectionTargetRaised>
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          density="compact"
          className="shrink-0 p-0"
          aria-label={label}
        >
          <DisclosureIndicator size="md" />
        </Button>
      </CollapsibleTrigger>
    </SelectionTargetRaised>
  )
}
