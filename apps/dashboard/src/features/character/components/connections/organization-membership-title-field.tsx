import type { OrganizationMembershipTitleDefinition } from '@rpg/contracts'
import { RadioGroupField } from '@rpg/ui'

import { buildOrganizationMembershipTitleRadioOptions } from '../../lib/organization-membership/organization-membership-title.lib'

export type OrganizationMembershipTitleFieldProps = {
  titles: readonly OrganizationMembershipTitleDefinition[]
  value: string
  onValueChange: (value: string) => void
  idPrefix: string
}

/** Organization catalog title radios for membership chooser/editor. */
export function OrganizationMembershipTitleField({
  titles,
  value,
  onValueChange,
  idPrefix,
}: OrganizationMembershipTitleFieldProps) {
  const options = buildOrganizationMembershipTitleRadioOptions({
    titles,
    currentValue: value,
  })

  return (
    <RadioGroupField
      id={`${idPrefix}-title`}
      label="Title"
      options={options}
      value={value}
      onValueChange={onValueChange}
    />
  )
}
