import { ChevronDown, Plus } from 'lucide-react'

import {
  Button,
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
        <Button type="button" variant="outline" size="sm" disabled={disabled}>
          <Plus aria-hidden />
          Add connection
          <ChevronDown className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {CONNECTION_TOP_LEVEL_SECTION_IDS.map((sectionId) => {
          const section = CONNECTION_SECTION_CATALOG[sectionId]
          const SectionIcon = getConnectionSectionIcon(sectionId)

          return (
            <DropdownMenuItem key={sectionId} onSelect={() => onSelectSection(sectionId)}>
              <IconContainer size="sm">
                <SectionIcon className="size-3.5" aria-hidden />
              </IconContainer>
              Add {section.singularAddLabel}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
