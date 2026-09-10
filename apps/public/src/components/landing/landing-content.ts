import type { LucideIcon } from 'lucide-react'
import { BookOpen, Castle, ScrollText, Sparkles, UserPlus, UsersRound } from 'lucide-react'

/** Primary conversion label — shared by the hero and the closing CTA band. */
export const PRIMARY_CTA_LABEL = 'Start building'
/** Secondary conversion label — shared by the hero and the closing CTA band. */
export const SECONDARY_CTA_LABEL = 'Log in'

export interface LandingFeature {
  icon: LucideIcon
  title: string
  description: string
}

export const LANDING_FEATURES: readonly LandingFeature[] = [
  {
    icon: Castle,
    title: 'Campaign command center',
    description:
      'Create and run multiple campaigns, each with its own rules, settings, and roster — every session starts from one focused dashboard.',
  },
  {
    icon: BookOpen,
    title: 'Homebrew everything',
    description:
      'Author spells, classes, species, feats, and equipment with structured editors that keep your custom rules consistent and playable.',
  },
  {
    icon: UsersRound,
    title: 'Characters and NPCs in minutes',
    description:
      'A guided builder for player characters, plus quick-NPC generation for the innkeeper your party decided to interrogate mid-session.',
  },
  {
    icon: Sparkles,
    title: 'Names that fit your world',
    description:
      'A fantasy name generator built on cultural naming conventions — elvish, dwarven, draconic, and more — for people, places, and factions.',
  },
  {
    icon: UserPlus,
    title: 'Bring your party in',
    description:
      'Send campaign invites so players join with exactly the content and character options you have approved for your table.',
  },
  {
    icon: ScrollText,
    title: 'Rules that understand your game',
    description:
      'Structured spell resolution metadata and customizable game-term vocabulary — your table\u2019s language, encoded into the tools.',
  },
] as const

export interface HomebrewShowcaseItem {
  value: string
  title: string
  description: string
}

export const HOMEBREW_SHOWCASE_ITEMS: readonly HomebrewShowcaseItem[] = [
  {
    value: 'spells',
    title: 'Spells with structured resolution',
    description:
      'Go beyond flavor text: model targeting, areas, saves, damage progression, and outcomes so a spell behaves the same way every time it is cast.',
  },
  {
    value: 'classes',
    title: 'Classes and subclasses',
    description:
      'Define progression tables, spellcasting, proficiencies, and subclass options — the full arc from level one to campaign finale.',
  },
  {
    value: 'species',
    title: 'Species and cultures',
    description:
      'Author species with cultural traits, rules, and naming conventions that flow straight into the character builder and name generator.',
  },
  {
    value: 'feats',
    title: 'Feats',
    description:
      'Create feats with requirements and grants that the character builder validates automatically — no more rules lawyering at the table.',
  },
  {
    value: 'equipment',
    title: 'Equipment and magic items',
    description:
      'Weapons, armor, adventuring gear, magic items, mounts, and vehicles — each with the stats and economy data your world runs on.',
  },
  {
    value: 'world',
    title: 'Locations and organizations',
    description:
      'Build settlements, districts, and landmarks, then weave in the factions and guilds that give your world its politics and plot hooks.',
  },
] as const

export interface HowItWorksStep {
  title: string
  description: string
}

export const HOW_IT_WORKS_STEPS: readonly HowItWorksStep[] = [
  {
    title: 'Found your campaign',
    description:
      'Spin up a campaign and tune its rules, starting options, and vocabulary to match the game you want to run.',
  },
  {
    title: 'Build your world',
    description:
      'Author homebrew content, map out locations and organizations, and stock your world with named NPCs.',
  },
  {
    title: 'Gather your party',
    description:
      'Invite your players, let them build characters from your approved content, and run every session from the DM dashboard.',
  },
] as const

/** Content types teased in the hero strip — the breadth pitch at a glance. */
export const HERO_CONTENT_TYPES: readonly string[] = [
  'Spells',
  'Classes',
  'Species',
  'Feats',
  'Equipment',
  'Locations',
  'Organizations',
  'NPCs',
] as const
