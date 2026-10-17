'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { CollapsibleTrigger } from './collapsible.client'
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
          className="size-6 shrink-0 p-0"
          aria-label={label}
        >
          <ChevronDown
            className={cn('size-4 transition-transform [[data-state=open]_&]:rotate-180')}
          />
        </Button>
      </CollapsibleTrigger>
    </SelectionTargetRaised>
  )
}
