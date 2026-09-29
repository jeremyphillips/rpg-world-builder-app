import type { Organization } from '@rpg/contracts'

import { ContentDetailSection } from '../../../lib/detail/page/content-detail-section'
import {
  ORGANIZATION_MEMBERSHIP_TITLES_DESCRIPTION,
  ORGANIZATION_MEMBERSHIP_TITLES_HEADING_ID,
  ORGANIZATION_SECTION_LABELS,
} from '../../lib/organization-display'

import { OrganizationMembershipTitlesSummary } from './organization-membership-titles-summary'

export function OrganizationMembershipTitlesDetailSection({
  organization,
}: {
  organization: Organization
}) {
  return (
    <ContentDetailSection
      heading={ORGANIZATION_SECTION_LABELS.membershipTitles}
      headingId={ORGANIZATION_MEMBERSHIP_TITLES_HEADING_ID}
      helper={ORGANIZATION_MEMBERSHIP_TITLES_DESCRIPTION}
    >
      <OrganizationMembershipTitlesSummary titles={organization.members.titles} />
    </ContentDetailSection>
  )
}
