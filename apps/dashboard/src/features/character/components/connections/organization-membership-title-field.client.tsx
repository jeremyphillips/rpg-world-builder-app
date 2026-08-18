'use client'

import { RadioGroupField } from '@rpg/ui'

import { buildOrganizationMembershipTitleRadioOptions } from './organization-membership-title-field.lib'
import type { OrganizationMembershipTitleFieldProps } from './organization-membership-title-field.types'

export type { OrganizationMembershipTitleFieldProps } from './organization-membership-title-field.types'

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
