/** Canonical nested-create handoff payload — persistence succeeded; modal closes immediately. */
export type CreatedContentResult =
  | { contentType: 'organizations'; id: string }
  | { contentType: 'locations'; id: string }

export type OnContentCreated = (result: CreatedContentResult) => void
