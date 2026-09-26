import type { ContentDisplayFallback } from '@rpg/contracts'
import {
  Backpack,
  BookOpen,
  Castle,
  Dna,
  Drama,
  Landmark,
  ListChecks,
  MapPin,
  Medal,
  Sparkles,
  Tags,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

/** Canonical semantic fallback key → icon component (sidebar, cards, search). */
export const CONTENT_DISPLAY_FALLBACK_ICONS: Record<ContentDisplayFallback, LucideIcon> = {
  character: UserRound,
  npc: Drama,
  location: MapPin,
  organization: Landmark,
  campaign: Castle,
  equipment: Backpack,
  class: BookOpen,
  species: Dna,
  spell: Sparkles,
  feat: Medal,
  'skill-proficiency': ListChecks,
  'game-term': Tags,
  generic: Castle,
}
