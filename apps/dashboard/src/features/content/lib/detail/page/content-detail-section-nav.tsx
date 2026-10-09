import { collectNavScrollSpyAnchors } from '@/lib/in-page-nav/in-page-nav-scroll-spy.lib'
import { InPageSectionNav } from '@/lib/in-page-nav/in-page-section-nav'
import { useInPageNavScrollSpy } from '@/lib/in-page-nav/use-in-page-nav-scroll-spy'

import {
  CONTENT_DETAIL_SECTION_MOBILE_SELECT_LABEL,
  CONTENT_DETAIL_SECTION_NAV_EYEBROW,
  CONTENT_DETAIL_SECTION_NAV_LABEL,
} from './content-detail-nav.constants'
import { useContentDetailNavSections } from './content-detail-nav-registration'

export function ContentDetailSectionNav() {
  const sections = useContentDetailNavSections()
  const anchorCount = collectNavScrollSpyAnchors(sections).length
  const { activeSectionId, activeLeafId } = useInPageNavScrollSpy(sections)

  if (anchorCount < 2) {
    return null
  }

  return (
    <InPageSectionNav
      sections={sections}
      eyebrowLabel={CONTENT_DETAIL_SECTION_NAV_EYEBROW}
      navLabel={CONTENT_DETAIL_SECTION_NAV_LABEL}
      mobileSelectLabel={CONTENT_DETAIL_SECTION_MOBILE_SELECT_LABEL}
      activeSectionId={activeSectionId}
      activeLeafId={activeLeafId}
    />
  )
}
