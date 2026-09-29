import type { ContentSource } from '../envelope'
import type { ContentMedia } from '../../../primitives/media/content-media'
import {
  buildSystemContentImageVirtualId,
  createSystemRoleAssignment,
  roleAssignmentMatchesSelection,
  roleAssignmentUploadImageId,
  type ContentMediaSystemSource,
} from '../../../primitives/media/content-media-source'
import type { SourceDimensions } from '../../../primitives/media/geometry'
import {
  getContentMediaPolicy,
  type ContentMediaDomain,
} from '../../../primitives/media/media-policy'
import type { MediaRole } from '../../../primitives/media/roles'
import {
  deriveSystemContentImage,
  resolveContentImageSet,
  resolveSystemContentImage,
} from './system-content-image-registry'
import type { SystemImageSubject } from '../../../primitives/media/system-image-subject'

type SystemSourcePresentationTreatment = 'white-paper-knockout' | 'mono-glyph-invert'

export const CONTENT_MEDIA_SOURCE_CONTEXT_FIELDS = [
  'contentSource',
  'subject',
  'slug',
  'imageSet',
] as const

export type ContentMediaSourceContextField = (typeof CONTENT_MEDIA_SOURCE_CONTEXT_FIELDS)[number]

export const CONTENT_MEDIA_SOURCE_ASSIGNMENT_STATES = ['derived', 'persisted'] as const

export type ContentMediaSourceAssignmentState =
  (typeof CONTENT_MEDIA_SOURCE_ASSIGNMENT_STATES)[number]

export type ContentMediaSourceRoleAssignment = {
  role: MediaRole
  state: ContentMediaSourceAssignmentState
}

type AvailableContentMediaSourceBase = {
  id: string
  availableRoles: readonly MediaRole[]
  assignments: ContentMediaSourceRoleAssignment[]
}

export type AvailableContentMediaUploadSource = AvailableContentMediaSourceBase & {
  sourceKind: 'upload'
  sourcePersistence: 'persisted'
  attachment: ContentMedia['images'][number]
}

export type AvailableContentMediaSystemSource = AvailableContentMediaSourceBase & {
  sourceKind: 'system'
  sourcePersistence: 'virtual'
  source: ContentMediaSystemSource
  path: string
  sourceDimensions: SourceDimensions
  presentationTreatment?: SystemSourcePresentationTreatment
}

export type AvailableContentMediaSource =
  | AvailableContentMediaUploadSource
  | AvailableContentMediaSystemSource

export type ResolveAvailableContentMediaSourcesInput = {
  media: ContentMedia
  domain: ContentMediaDomain
  contentSource?: ContentSource
  subject?: SystemImageSubject
  slug?: string
  rulesetId?: string
  campaignImageSetId?: string
}

export type ResolveAvailableContentMediaSourcesResult = {
  sources: AvailableContentMediaSource[]
  contextStatus: 'complete' | 'incomplete'
  missing: ContentMediaSourceContextField[]
}

function presentationTreatmentFromSystemImage(
  presentation: { treatment: string } | undefined,
): SystemSourcePresentationTreatment | undefined {
  if (presentation?.treatment === 'white-paper-knockout') {
    return 'white-paper-knockout'
  }
  if (presentation?.treatment === 'mono-glyph-invert') {
    return 'mono-glyph-invert'
  }
  return undefined
}

function buildUploadSources(
  media: ContentMedia,
  allowedRoles: readonly MediaRole[],
): AvailableContentMediaUploadSource[] {
  return media.images.map((attachment) => {
    const assignments: ContentMediaSourceRoleAssignment[] = []
    for (const role of allowedRoles) {
      const assignment = media.roles[role]
      if (assignment && roleAssignmentMatchesSelection(assignment, attachment.id)) {
        assignments.push({ role, state: 'persisted' })
      }
    }
    return {
      sourceKind: 'upload',
      sourcePersistence: 'persisted',
      id: attachment.id,
      attachment,
      availableRoles: allowedRoles,
      assignments,
    }
  })
}

function evaluateSourceContext(
  input: ResolveAvailableContentMediaSourcesInput,
): Pick<ResolveAvailableContentMediaSourcesResult, 'contextStatus' | 'missing'> {
  const missing: ContentMediaSourceContextField[] = []

  if (input.contentSource === undefined) {
    return { contextStatus: 'incomplete', missing: ['contentSource'] }
  }

  if (input.contentSource !== 'system') {
    return { contextStatus: 'complete', missing: [] }
  }

  if (!input.subject) {
    missing.push('subject')
  }
  if (!input.slug?.trim()) {
    missing.push('slug')
  }
  if (!input.campaignImageSetId && !input.rulesetId) {
    missing.push('imageSet')
  }

  if (missing.length > 0) {
    return { contextStatus: 'incomplete', missing }
  }

  return { contextStatus: 'complete', missing: [] }
}

function buildSystemSources(input: {
  media: ContentMedia
  domain: ContentMediaDomain
  subject: SystemImageSubject
  slug: string
  contentSource: ContentSource
  rulesetId?: string
  campaignImageSetId?: string
}): AvailableContentMediaSystemSource[] {
  const policy = getContentMediaPolicy(input.domain)
  const imageSetId = resolveContentImageSet({
    campaignImageSetId: input.campaignImageSetId,
    rulesetId: input.rulesetId,
  })
  const systemSources: AvailableContentMediaSystemSource[] = []

  for (const assetRole of policy.allowedRoles as readonly MediaRole[]) {
    const derived = deriveSystemContentImage({
      imageSetId,
      subject: input.subject,
      assetRole,
      slug: input.slug,
    })
    if (!derived) continue

    const resolved = resolveSystemContentImage({
      imageSetId: derived.imageSetId,
      subject: derived.subject,
      assetRole: derived.assetRole,
      slug: derived.slug,
      contentSource: input.contentSource,
    })
    if (!resolved) continue

    const source = createSystemRoleAssignment({
      imageSetId: derived.imageSetId,
      subject: derived.subject,
      assetRole: derived.assetRole,
      slug: derived.slug,
    }).source

    const virtualId = buildSystemContentImageVirtualId(source)
    const assignments: ContentMediaSourceRoleAssignment[] = []
    const roleAssignment = input.media.roles[assetRole]
    const assignmentMatchesThisSource =
      roleAssignment !== undefined && roleAssignmentMatchesSelection(roleAssignment, virtualId)
    const uploadAssignmentId = roleAssignmentUploadImageId(roleAssignment)
    const assignmentResolvable =
      assignmentMatchesThisSource ||
      (uploadAssignmentId !== undefined &&
        input.media.images.some((image) => image.id === uploadAssignmentId))

    if (assignmentMatchesThisSource) {
      assignments.push({ role: assetRole, state: 'persisted' })
    } else if (!roleAssignment || !assignmentResolvable) {
      assignments.push({ role: assetRole, state: 'derived' })
    }

    systemSources.push({
      sourceKind: 'system',
      sourcePersistence: 'virtual',
      id: virtualId,
      source,
      path: resolved.path,
      sourceDimensions: resolved.sourceDimensions,
      presentationTreatment: presentationTreatmentFromSystemImage(resolved.presentation),
      availableRoles: [assetRole],
      assignments,
    })
  }

  return systemSources
}

/** Canonical source availability for uploads and registry system art. */
export function resolveAvailableContentMediaSources(
  input: ResolveAvailableContentMediaSourcesInput,
): ResolveAvailableContentMediaSourcesResult {
  const policy = getContentMediaPolicy(input.domain)
  const context = evaluateSourceContext(input)
  const uploads = buildUploadSources(input.media, policy.allowedRoles)

  if (context.contextStatus === 'incomplete' || input.contentSource !== 'system') {
    return {
      ...context,
      sources: uploads,
    }
  }

  const systemSources = buildSystemSources({
    media: input.media,
    domain: input.domain,
    subject: input.subject!,
    slug: input.slug!.trim(),
    contentSource: input.contentSource,
    rulesetId: input.rulesetId,
    campaignImageSetId: input.campaignImageSetId,
  })

  return {
    contextStatus: 'complete',
    missing: [],
    sources: [...uploads, ...systemSources],
  }
}

export function projectAvailableContentImages(
  sources: readonly AvailableContentMediaSource[],
): Array<
  | { kind: 'upload'; id: string; attachment: ContentMedia['images'][number] }
  | {
      kind: 'system'
      id: string
      source: ContentMediaSystemSource
      srcPath: string
      sourceDimensions: SourceDimensions
    }
> {
  return sources.map((source) => {
    if (source.sourceKind === 'upload') {
      return {
        kind: 'upload',
        id: source.id,
        attachment: source.attachment,
      }
    }
    return {
      kind: 'system',
      id: source.id,
      source: source.source,
      srcPath: source.path,
      sourceDimensions: source.sourceDimensions,
    }
  })
}
