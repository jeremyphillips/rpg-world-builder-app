'use client'

import { RadioGroupField } from '@rpg/ui'

import { buildOrganizationMembershipTitleRadioOptions } from './organization-membership-title-field.lib'
import type { OrganizationMembershipTitleFieldProps } from './organization-membership-title-field.types'

export type { OrganizationMembershipTitleFieldProps } from './organization-membership-title-field.types'

/** Classification-scoped title radios for organization membership chooser/editor. */
export function OrganizationMembershipTitleField({
  kind,
  form,
  activities,
  value,
  onValueChange,
  idPrefix,
}: OrganizationMembershipTitleFieldProps) {
  const options = buildOrganizationMembershipTitleRadioOptions({
    kind,
    form,
    activities,
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
