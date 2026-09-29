import { OrganizationMembershipTitlesEditor } from './organization-membership-titles-editor'

export type OrganizationEditMembershipTitlesFieldProps = {
  prefix?: string
}

/** Organization form editor for `members.titles`. */
export function OrganizationEditMembershipTitlesField({
  prefix,
}: OrganizationEditMembershipTitlesFieldProps) {
  return (
    <OrganizationMembershipTitlesEditor
      prefix={prefix}
      idPrefix={prefix ? `${prefix}-membership-titles` : 'organization-membership-titles'}
    />
  )
}
