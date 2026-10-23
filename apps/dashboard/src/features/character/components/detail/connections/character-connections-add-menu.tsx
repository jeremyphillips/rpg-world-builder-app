import { ChevronDown } from 'lucide-react'

import {
  ActionButton,
  Icon,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconContainer,
} from '@rpg/ui'

import {
  CONNECTION_SECTION_CATALOG,
  CONNECTION_TOP_LEVEL_SECTION_IDS,
  type ConnectionTopLevelSectionId,
} from '../../../lib/relationship/connection-section-catalog'
import { getConnectionSectionIcon } from '../../../lib/relationship/connection-section-icons'

export type CharacterConnectionsAddMenuProps = {
  disabled?: boolean
  onSelectSection: (sectionId: ConnectionTopLevelSectionId) => void
}

export function CharacterConnectionsAddMenu({
  disabled,
  onSelectSection,
}: CharacterConnectionsAddMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ActionButton type="button" variant="outline" size="sm" action="add" disabled={disabled}>
          Add connection
          <ChevronDown className="size-4" aria-hidden />
        </ActionButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {CONNECTION_TOP_LEVEL_SECTION_IDS.map((sectionId) => {
          const section = CONNECTION_SECTION_CATALOG[sectionId]
          return (
            <DropdownMenuItem key={sectionId} onSelect={() => onSelectSection(sectionId)}>
              <IconContainer size="sm">
                <Icon name={getConnectionSectionIcon(sectionId)} size="md" />
              </IconContainer>
              Add {section.singularAddLabel}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
