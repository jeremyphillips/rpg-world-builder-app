import {
  resolveInPageNavScrollContainer,
  resolveInPageNavScrollOffsetPxForContainer,
} from './in-page-nav-scroll-container.lib'
import { resolveInPageNavScrollOffsetPx } from './in-page-nav-scroll-spy.lib'
import type { InPageNavSection } from './in-page-nav.types'

export function scrollToInPageNavAnchor(anchorId: string) {
  const anchor = document.getElementById(anchorId)
  if (!anchor) return

  const scrollContainer = resolveInPageNavScrollContainer(anchor)
  const documentOffset = resolveInPageNavScrollOffsetPx()
  const offset = resolveInPageNavScrollOffsetPxForContainer(scrollContainer, documentOffset)

  if (scrollContainer === 'document') {
    const top = window.scrollY + anchor.getBoundingClientRect().top - offset
    window.scrollTo({ top, behavior: 'smooth' })
    return
  }

  const top =
    scrollContainer.scrollTop +
    anchor.getBoundingClientRect().top -
    scrollContainer.getBoundingClientRect().top -
    offset
  scrollContainer.scrollTo({ top, behavior: 'smooth' })
}

type MobileNavItem = {
  id: string
  label: string
  sectionId: string
  isLeaf: boolean
}

export function buildInPageMobileNavItems(sections: readonly InPageNavSection[]): MobileNavItem[] {
  return sections.flatMap((section) => {
    const sectionItem: MobileNavItem = {
      id: section.id,
      label: section.label,
      sectionId: section.id,
      isLeaf: false,
    }
    const leafItems =
      section.leaves?.map((leaf) => ({
        id: leaf.id,
        label: `${section.label} · ${leaf.label}`,
        sectionId: section.id,
        isLeaf: true,
      })) ?? []
    return [sectionItem, ...leafItems]
  })
}

export function resolveInPageMobileSelectValue(
  sections: readonly InPageNavSection[],
  activeSectionId?: string,
  activeLeafId?: string,
): string {
  if (activeLeafId) return activeLeafId
  if (activeSectionId) return activeSectionId
  return sections[0]?.id ?? ''
}

export function resolveInPageSectionLinkState(
  sectionId: string,
  activeSectionId?: string,
  activeLeafId?: string,
): 'inactive' | 'active' | 'activeWithLeaf' {
  if (activeSectionId !== sectionId) return 'inactive'
  if (activeLeafId) return 'activeWithLeaf'
  return 'active'
}
