import { describe, expect, it } from 'vitest'

import { emptyContentMediaSchema, type ContentMedia } from '../../../primitives/media/content-media'
import {
  createSystemRoleAssignment,
  createUploadRoleAssignment,
} from '../../../primitives/media/content-media-source'
import { getAvailableContentImages } from './get-available-content-images'
import {
  contentTypeSubject,
  vocabularySetSubject,
} from '../../../primitives/media/system-image-subject'
import { normalizePersistedContentMedia } from './normalize-persisted-content-media'
import {
  resolveAvailableContentMediaSources,
  type AvailableContentMediaSystemSource,
} from './resolve-available-content-media-sources'
import {
  resolveContentDisplayImage,
  resolveContentDisplayImageAsOptional,
} from './resolve-content-display-image'
import { selectDisplaySourceForRole } from './select-display-source-for-role'
import { resolveEffectiveRepresentativeImageId } from './resolve-effective-image-roles'

describe('resolveAvailableContentMediaSources', () => {
  it('returns complete homebrew context with uploads only and no slug requirement', () => {
    const result = resolveAvailableContentMediaSources({
      media: {
        revision: 0,
        images: [{ id: 'img-1', assetId: 'asset-1' }],
        roles: {},
      },
      domain: 'character',
      contentSource: 'homebrew',
    })

    expect(result.contextStatus).toBe('complete')
    expect(result.missing).toEqual([])
    expect(result.sources).toHaveLength(1)
    expect(result.sources[0]).toMatchObject({
      sourceKind: 'upload',
      sourcePersistence: 'persisted',
      assignments: [],
    })
  })

  it('marks system lookup incomplete when image set identity is missing', () => {
    const result = resolveAvailableContentMediaSources({
      media: emptyContentMediaSchema,
      domain: 'class',
      contentSource: 'system',
      subject: contentTypeSubject('classes'),
      slug: 'fighter',
    })

    expect(result.contextStatus).toBe('incomplete')
    expect(result.missing).toContain('imageSet')
    expect(result.sources).toEqual([])
  })

  it('lists virtual system sources with derived assignments when roles are empty', () => {
    const result = resolveAvailableContentMediaSources({
      media: emptyContentMediaSchema,
      domain: 'class',
      contentSource: 'system',
      subject: contentTypeSubject('classes'),
      slug: 'fighter',
      rulesetId: 'srd-cc-5.2.1',
    })

    const system = result.sources.find((source) => source.sourceKind === 'system') as
      | AvailableContentMediaSystemSource
      | undefined
    expect(system).toMatchObject({
      sourcePersistence: 'virtual',
      path: 'assets/system/srd-cc-5.2.1/classes/primary/fighter.jpeg',
      assignments: [{ role: 'primary', state: 'derived' }],
    })
  })

  it('keeps system source virtual while marking persisted crop assignment state', () => {
    const crop = { x: 0.1, y: 0.1, width: 0.8, height: 0.6 }
    const result = resolveAvailableContentMediaSources({
      media: {
        revision: 0,
        images: [],
        roles: {
          primary: {
            ...createSystemRoleAssignment({
              imageSetId: 'srd-cc-5.2.1',
              subject: contentTypeSubject('classes'),
              assetRole: 'primary',
              slug: 'fighter',
            }),
            presentation: { mode: 'crop', crop },
          },
        },
      },
      domain: 'class',
      contentSource: 'system',
      subject: contentTypeSubject('classes'),
      slug: 'fighter',
      rulesetId: 'srd-cc-5.2.1',
    })

    const system = result.sources.find((source) => source.sourceKind === 'system')
    expect(system).toMatchObject({
      sourcePersistence: 'virtual',
      assignments: [{ role: 'primary', state: 'persisted' }],
    })
  })
})

describe('display and workspace source parity', () => {
  const systemClassContext = {
    domain: 'class' as const,
    subject: contentTypeSubject('classes'),
    slug: 'fighter',
    contentSource: 'system' as const,
    rulesetId: 'srd-cc-5.2.1',
  }

  it('keeps display-selected system sources in canonical availability', () => {
    const media: ContentMedia = {
      revision: 0,
      images: [{ id: 'upload-1', assetId: 'asset-1' }],
      roles: {},
    }
    const availability = resolveAvailableContentMediaSources({ media, ...systemClassContext })
    const display = resolveContentDisplayImage({
      media,
      surface: 'compact',
      ...systemClassContext,
    })
    expect(display.outcome).toBe('image')
    if (display.outcome !== 'image') return

    const selected = selectDisplaySourceForRole({
      sources: availability.sources,
      media,
      role: display.display.role,
    })
    expect(selected.source?.id).toBeDefined()
    expect(availability.sources.some((source) => source.id === selected.source?.id)).toBe(true)

    const workspace = getAvailableContentImages({ media, ...systemClassContext })
    for (const image of workspace.filter((entry) => entry.kind === 'system')) {
      expect(availability.sources.some((source) => source.id === image.id)).toBe(true)
    }
  })

  it('does not treat gallery-only uploads as display or representative primary', () => {
    const media = {
      revision: 0,
      images: [{ id: 'upload-1', assetId: 'asset-1' }],
      roles: {},
    }
    const availability = resolveAvailableContentMediaSources({ media, ...systemClassContext })
    const display = resolveContentDisplayImageAsOptional({
      media,
      surface: 'compact',
      ...systemClassContext,
    })
    expect(display?.sourceKind).toBe('system')

    expect(
      resolveEffectiveRepresentativeImageId(media, ['primary'], availability.sources),
    ).not.toBe('upload-1')
  })

  it('reports assignedSourceMissing and still falls back to virtual system art', () => {
    const media = {
      revision: 0,
      images: [],
      roles: {
        primary: createUploadRoleAssignment('missing-upload'),
      },
    }
    const availability = resolveAvailableContentMediaSources({
      media,
      ...systemClassContext,
    })
    const selection = selectDisplaySourceForRole({
      sources: availability.sources,
      media,
      role: 'primary',
    })
    expect(selection.assignedSourceMissing).toBe(true)
    expect(selection.source?.sourceKind).toBe('system')

    const display = resolveContentDisplayImage({
      media,
      surface: 'compact',
      ...systemClassContext,
    })
    expect(display.outcome).toBe('image')
    if (display.outcome !== 'image') return
    expect(display.display.assignedSourceMissing).toBe(true)
  })

  it('persists cropped system art and renders through the presentation path', () => {
    const crop = { x: 0.1, y: 0.1, width: 0.8, height: 0.6 }
    const media: ContentMedia = {
      revision: 0,
      images: [],
      roles: {
        primary: {
          ...createSystemRoleAssignment({
            imageSetId: 'srd-cc-5.2.1',
            subject: contentTypeSubject('classes'),
            assetRole: 'primary',
            slug: 'fighter',
          }),
          presentation: { mode: 'crop', crop },
        },
      },
    }
    const normalized = normalizePersistedContentMedia({
      media,
      subject: systemClassContext.subject,
      slug: systemClassContext.slug,
      contentSource: systemClassContext.contentSource,
      rulesetId: systemClassContext.rulesetId,
      allowedRoles: ['primary'],
    })
    expect(normalized.roles.primary?.presentation).toEqual({ mode: 'crop', crop })

    const display = resolveContentDisplayImage({
      media: normalized,
      surface: 'compact',
      ...systemClassContext,
    })
    expect(display.outcome).toBe('image')
    if (display.outcome !== 'image') return
    expect(display.display.crop).toEqual(crop)
    expect(display.display.sourceKind).toBe('system')
  })
})

describe('registry-driven invariant', () => {
  const cases = [
    {
      label: 'class primary',
      domain: 'class' as const,
      subject: contentTypeSubject('classes'),
      slug: 'fighter',
    },
    {
      label: 'species primary',
      domain: 'species' as const,
      subject: contentTypeSubject('species'),
      slug: 'elf',
    },
    {
      label: 'spell-school emblem',
      domain: 'game-term' as const,
      subject: vocabularySetSubject('spell-schools'),
      slug: 'evocation',
    },
  ]

  for (const entry of cases) {
    it(`keeps ${entry.label} display and workspace sources aligned`, () => {
      const media = emptyContentMediaSchema
      const context = {
        ...entry,
        contentSource: 'system' as const,
        rulesetId: 'srd-cc-5.2.1',
      }
      const availability = resolveAvailableContentMediaSources({ media, ...context })
      const workspaceSystemIds = getAvailableContentImages({ media, ...context })
        .filter((image) => image.kind === 'system')
        .map((image) => image.id)

      for (const id of workspaceSystemIds) {
        expect(availability.sources.some((source) => source.id === id)).toBe(true)
      }

      const display = resolveContentDisplayImage({
        media,
        surface: entry.domain === 'game-term' ? 'detail' : 'compact',
        ...context,
      })
      if (display.outcome !== 'image') return
      const selected = selectDisplaySourceForRole({
        sources: availability.sources,
        media,
        role: display.display.role,
      })
      expect(selected.source).toBeDefined()
      expect(availability.sources.some((source) => source.id === selected.source?.id)).toBe(true)
    })
  }
})
