import { Chip, ChipGroup, Eyebrow, Heading } from '@rpg/ui'

import {
  PERSON_ROLE_GROUP_LABELS,
  listPersonRolesByGroup,
  type PersonRoleGroupId,
} from '../../../lib/relationship/connection-role-catalog'

const PERSON_ROLE_GROUPS: readonly PersonRoleGroupId[] = ['family', 'social', 'guidance']

export type PersonRelationshipRoleStepProps = {
  characterName: string
  selectedRoleId: string | null
  onSelectedRoleIdChange: (roleId: string | null) => void
}

export function PersonRelationshipRoleStep({
  characterName,
  selectedRoleId,
  onSelectedRoleIdChange,
}: PersonRelationshipRoleStepProps) {
  return (
    <div className="space-y-4">
      <Heading variant="nav" as="p">
        How is {characterName} connected to this character?
      </Heading>
      {PERSON_ROLE_GROUPS.map((group) => (
        <div key={group} className="space-y-2">
          <Eyebrow size="sm">{PERSON_ROLE_GROUP_LABELS[group]}</Eyebrow>
          <ChipGroup semanticRole="radiogroup" aria-label={PERSON_ROLE_GROUP_LABELS[group]}>
            {listPersonRolesByGroup(group).map((role) => (
              <Chip
                key={role.id}
                id={`person-role-${role.id}`}
                mode="selectable"
                selectionRole="radio"
                selected={selectedRoleId === role.id}
                onSelectedChange={(selected) => {
                  onSelectedRoleIdChange(selected ? role.id : null)
                }}
              >
                {role.label}
              </Chip>
            ))}
          </ChipGroup>
        </div>
      ))}
    </div>
  )
}
