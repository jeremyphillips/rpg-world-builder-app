import type { ResolveFacingRequest } from './resolve-facing'

export type FacingHostConfig = Extract<ResolveFacingRequest, { source: 'draft' }>
