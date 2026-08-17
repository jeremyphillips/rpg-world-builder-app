import type { OrganizationPractice } from './organization-practice'

/** UI-only browse families for the Practice combobox. Not persisted and not eligibility rules. */
export const ORGANIZATION_PRACTICE_PRESENTATION_FAMILIES = [
  'Craft & industry',
  'Trade & logistics',
  'Scholarly & technical',
  'Medicine & care',
  'Military & security',
  'Criminal & covert',
  'Religious & esoteric',
  'Culture & performance',
] as const

export type OrganizationPracticePresentationFamily =
  (typeof ORGANIZATION_PRACTICE_PRESENTATION_FAMILIES)[number]

/** One canonical display family per Practice id. Search and aliases stay global. */
export const ORGANIZATION_PRACTICE_PRESENTATION_FAMILY_BY_ID = {
  blacksmithing: 'Craft & industry',
  brewing: 'Craft & industry',
  alchemy: 'Craft & industry',
  carpentry: 'Craft & industry',
  shipbuilding: 'Craft & industry',
  glassmaking: 'Craft & industry',
  farming: 'Craft & industry',
  masonry: 'Craft & industry',
  weaving: 'Craft & industry',
  tailoring: 'Craft & industry',
  leatherworking: 'Craft & industry',
  cobbling: 'Craft & industry',
  mining: 'Craft & industry',
  logging: 'Craft & industry',
  milling: 'Craft & industry',
  distilling: 'Craft & industry',
  fishing: 'Craft & industry',
  printing: 'Craft & industry',
  banking: 'Trade & logistics',
  navigation: 'Trade & logistics',
  hunting: 'Trade & logistics',
  couriering: 'Trade & logistics',
  warehousing: 'Trade & logistics',
  salvage: 'Trade & logistics',
  brokerage: 'Trade & logistics',
  apprenticeship: 'Scholarly & technical',
  cartography: 'Scholarly & technical',
  scribing: 'Scholarly & technical',
  surveying: 'Scholarly & technical',
  translation: 'Scholarly & technical',
  archiving: 'Scholarly & technical',
  engineering: 'Scholarly & technical',
  investigation: 'Scholarly & technical',
  medicine: 'Medicine & care',
  apothecary: 'Medicine & care',
  midwifery: 'Medicine & care',
  scouting: 'Military & security',
  bounty_hunting: 'Military & security',
  bodyguarding: 'Military & security',
  siegecraft: 'Military & security',
  tracking: 'Military & security',
  smuggling: 'Criminal & covert',
  extortion: 'Criminal & covert',
  theft: 'Criminal & covert',
  assassination: 'Criminal & covert',
  counterfeiting: 'Criminal & covert',
  fencing: 'Criminal & covert',
  piracy: 'Criminal & covert',
  espionage: 'Criminal & covert',
  kidnapping: 'Criminal & covert',
  poisoning: 'Criminal & covert',
  gambling: 'Criminal & covert',
  divination: 'Religious & esoteric',
  exorcism: 'Religious & esoteric',
  pilgrimage: 'Religious & esoteric',
  funerary_rites: 'Religious & esoteric',
  performance: 'Culture & performance',
  publishing: 'Culture & performance',
} as const satisfies Record<OrganizationPractice, OrganizationPracticePresentationFamily>

export function getOrganizationPracticePresentationFamily(
  id: OrganizationPractice,
): OrganizationPracticePresentationFamily {
  return ORGANIZATION_PRACTICE_PRESENTATION_FAMILY_BY_ID[id]
}
