export const ORGANIZATION_STARTING_POINT_LEGEND = 'Starting point'
export const ORGANIZATION_STARTING_POINT_PLACEHOLDER = 'Choose a familiar organization type…'
export const ORGANIZATION_STARTING_POINT_HINT =
  'Prefills the organization profile, common member classes, and membership titles. You can customize these afterward.'

export const ORGANIZATION_STARTING_POINT_CUSTOMIZED_LABEL = 'Customized'

export const ORGANIZATION_PROFILE_GROUP_LEGEND = 'Organization profile'
export const ORGANIZATION_PROFILE_GROUP_DESCRIPTION =
  'Define the organization’s domain, structure, activities, and practices.'

export const ORGANIZATION_DOMAIN_FIELD_HINT = 'The broad sphere this organization belongs to.'
export const ORGANIZATION_FORM_FIELD_PLACEHOLDER = 'Choose a form…'
export const ORGANIZATION_FORM_FIELD_HINT = 'How the organization is structurally organized.'
export const ORGANIZATION_FUNCTION_FIELD_HINT = 'What the organization primarily does.'
export const ORGANIZATION_PRACTICE_FIELD_HINT =
  'Distinctive methods, trades, or operational specialties.'

export const ORGANIZATION_MEMBER_AFFINITIES_GROUP_LEGEND = 'Member affinities'
export const ORGANIZATION_MEMBER_AFFINITIES_GROUP_DESCRIPTION =
  'Used to suggest suitable options when adding or creating members.'

export const ORGANIZATION_OPTIONAL_DETAILS_GROUP_LEGEND = 'Optional details'
export const ORGANIZATION_OPTIONAL_DETAILS_GROUP_DESCRIPTION = 'Member affinities and description'

export const ORGANIZATION_APPLY_FAMILIAR_TYPE_LABEL = 'Apply familiar type…'
export const ORGANIZATION_APPLY_FAMILIAR_TYPE_HINT =
  'Replace organization profile fields and common member classes with values from a familiar type. Membership titles will not change.'

export const ORGANIZATION_DOMAIN_PUBLISH_MESSAGE = 'Choose an organization domain.'

export function organizationChangeStartingPointDialogTitle(): string {
  return 'Change starting point?'
}

export function organizationChangeStartingPointDialogBody(presetLabel: string): string {
  return `Applying ${presetLabel} will replace your current Domain, Form, Functions, Practices, and Classes with the values from that starting point. Membership titles will also be replaced with ${presetLabel} defaults. Other organization details will not change.`
}

export function organizationApplyStartingPointConfirmLabel(presetLabel: string): string {
  return `Apply ${presetLabel}`
}

export function organizationApplyFamiliarTypeDialogTitle(presetLabel: string): string {
  return `Apply ${presetLabel}?`
}

export function organizationApplyFamiliarTypeDialogBody(presetLabel: string): string {
  return `This will replace Domain, Form, Functions, Practices, and Classes with ${presetLabel} values. Membership titles, Species, Name, Campaign availability, Description, and media will not change.`
}
