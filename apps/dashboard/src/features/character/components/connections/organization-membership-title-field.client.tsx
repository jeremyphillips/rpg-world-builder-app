'use client'

import { RadioGroupField } from '@rpg/ui'

import { buildOrganizationMembershipTitleRadioOptions } from './organization-membership-title-field.lib'
import type { OrganizationMembershipTitleFieldProps } from './organization-membership-title-field.types'

export type { OrganizationMembershipTitleFieldProps } from './organization-membership-title-field.types'

/** Classification-scoped title radios for organization membership chooser/editor. */
export function OrganizationMembershipTitleField({
  kind,
  subtype,
  value,
  onValueChange,
  idPrefix,
}: OrganizationMembershipTitleFieldProps) {
  const options = buildOrganizationMembershipTitleRadioOptions({
    kind,
    subtype,
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
