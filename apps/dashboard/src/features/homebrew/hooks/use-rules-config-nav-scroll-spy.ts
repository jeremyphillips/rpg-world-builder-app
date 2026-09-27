import type { RulesConfigNavSection } from '@/features/campaign'
import { useInPageNavScrollSpy } from '@/lib/in-page-nav/use-in-page-nav-scroll-spy'

export function useRulesConfigNavScrollSpy(sections: readonly RulesConfigNavSection[]) {
  return useInPageNavScrollSpy(sections)
}
