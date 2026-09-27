import type { RulesConfigNavLeaf, RulesConfigNavSection } from '@/features/campaign'
import { InPageSectionNav } from '@/lib/in-page-nav/in-page-section-nav'

export type { RulesConfigNavLeaf, RulesConfigNavSection }

const RULES_CONFIG_NAV_EYEBROW = 'Sections'

type RulesConfigFieldNavProps = {
  sections: readonly RulesConfigNavSection[]
  navLabel: string
  mobileSelectLabel: string
  activeSectionId?: string
  activeLeafId?: string
}

/** Desktop anchor rail + mobile select for in-page rules configuration sections. */
export function RulesConfigFieldNav({
  sections,
  navLabel,
  mobileSelectLabel,
  activeSectionId,
  activeLeafId,
}: RulesConfigFieldNavProps) {
  return (
    <InPageSectionNav
      sections={sections}
      eyebrowLabel={RULES_CONFIG_NAV_EYEBROW}
      navLabel={navLabel}
      mobileSelectLabel={mobileSelectLabel}
      activeSectionId={activeSectionId}
      activeLeafId={activeLeafId}
    />
  )
}
