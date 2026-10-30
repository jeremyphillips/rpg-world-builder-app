import { describe, expect, it } from 'vitest'

import {
  contentTypeSubject,
  vocabularySetSubject,
} from '../../../primitives/media/system-image-subject'
import {
  buildSystemContentImagePath,
  deriveSystemContentImage,
  resolveContentImageSet,
  resolveSystemContentImage,
} from './system-content-image-registry'

describe('system content image registry', () => {
  it('resolves fighter system primary to the public path with presentation metadata', () => {
    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        subject: contentTypeSubject('classes'),
        assetRole: 'primary',
        slug: 'fighter',
        catalogLayer: 'system',
      }),
    ).toEqual({
      path: 'assets/system/srd-cc-5.2.1/classes/primary/fighter.jpeg',
      sourceDimensions: { width: 1200, height: 896 },
      presentation: { treatment: 'white-paper-knockout' },
    })
  })

  it('resolves spell school emblems with mono-glyph-invert presentation', () => {
    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        subject: vocabularySetSubject('spell-schools'),
        assetRole: 'emblem',
        slug: 'evocation',
        catalogLayer: 'system',
      }),
    ).toEqual({
      path: 'assets/system/srd-cc-5.2.1/spell-schools/emblem/evocation.png',
      sourceDimensions: { width: 1254, height: 1254 },
      presentation: { treatment: 'mono-glyph-invert' },
    })
  })

  it('resolves seed monster primary PNGs to the public path', () => {
    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        subject: contentTypeSubject('monsters'),
        assetRole: 'primary',
        slug: 'kobold-warrior',
        catalogLayer: 'system',
      }),
    ).toEqual({
      path: 'assets/system/srd-cc-5.2.1/monsters/primary/kobold-warrior.png',
      sourceDimensions: { width: 1364, height: 1023 },
      presentation: { treatment: 'white-paper-knockout' },
    })

    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        subject: contentTypeSubject('monsters'),
        assetRole: 'primary',
        slug: 'skeleton',
        catalogLayer: 'system',
      })?.path,
    ).toBe('assets/system/srd-cc-5.2.1/monsters/primary/skeleton.png')
  })

  it('resolves elf and human system species primary to the public path', () => {
    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        subject: contentTypeSubject('species'),
        assetRole: 'primary',
        slug: 'elf',
        catalogLayer: 'system',
      })?.path,
    ).toBe('assets/system/srd-cc-5.2.1/species/primary/elf.jpeg')

    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        subject: contentTypeSubject('species'),
        assetRole: 'primary',
        slug: 'human',
        catalogLayer: 'system',
      })?.path,
    ).toBe('assets/system/srd-cc-5.2.1/species/primary/human.jpeg')
  })

  it('rejects unknown slug, asset role, and content type', () => {
    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        subject: contentTypeSubject('classes'),
        assetRole: 'primary',
        slug: 'unknown',
        catalogLayer: 'system',
      }),
    ).toBeUndefined()
    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        subject: contentTypeSubject('classes'),
        assetRole: 'portrait',
        slug: 'fighter',
        catalogLayer: 'system',
      }),
    ).toBeUndefined()
    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        subject: contentTypeSubject('species'),
        assetRole: 'primary',
        slug: 'fighter',
        catalogLayer: 'system',
      }),
    ).toBeUndefined()
  })

  it('does not resolve homebrew records with a system slug', () => {
    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        subject: contentTypeSubject('classes'),
        assetRole: 'primary',
        slug: 'fighter',
        catalogLayer: 'homebrew',
      }),
    ).toBeUndefined()

    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        subject: contentTypeSubject('species'),
        assetRole: 'primary',
        slug: 'elf',
        catalogLayer: 'homebrew',
      }),
    ).toBeUndefined()
  })

  it('derives catalog entries by subject and slug', () => {
    expect(
      deriveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        subject: contentTypeSubject('species'),
        assetRole: 'primary',
        slug: 'elf',
      }),
    ).toEqual({
      imageSetId: 'srd-cc-5.2.1',
      subject: contentTypeSubject('species'),
      assetRole: 'primary',
      slug: 'elf',
    })
  })

  it('applies image set precedence through resolveContentImageSet', () => {
    expect(resolveContentImageSet({ rulesetId: 'srd-cc-5.2.1' })).toBe('srd-cc-5.2.1')
    expect(resolveContentImageSet({ campaignImageSetId: 'srd-cc-5.2.1' })).toBe('srd-cc-5.2.1')
    expect(resolveContentImageSet({})).toBe('srd-cc-5.2.1')
  })

  it('builds the documented path convention', () => {
    expect(
      buildSystemContentImagePath({
        imageSetId: 'srd-cc-5.2.1',
        subject: contentTypeSubject('classes'),
        assetRole: 'primary',
        slug: 'wizard',
        extension: 'jpeg',
      }),
    ).toBe('assets/system/srd-cc-5.2.1/classes/primary/wizard.jpeg')
  })
})
