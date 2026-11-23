export type TraitFacingHost =
  | { host: 'species' }
  | { host: 'monster'; subject: string; lairEnabled: boolean }
