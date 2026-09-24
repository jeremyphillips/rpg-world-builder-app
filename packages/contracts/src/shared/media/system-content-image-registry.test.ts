import { describe, expect, it } from 'vitest'

import {
  buildSystemContentImagePath,
  resolveContentImageSet,
  resolveSystemContentImage,
} from './system-content-image-registry'

describe('system content image registry', () => {
  it('resolves fighter system primary to the public path', () => {
    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        contentType: 'classes',
        assetRole: 'primary',
        slug: 'fighter',
        contentSource: 'system',
      }),
    ).toBe('assets/system/srd-cc-5.2.1/classes/primary/fighter.jpeg')
  })

  it('rejects unknown slug, asset role, and content type', () => {
    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        contentType: 'classes',
        assetRole: 'primary',
        slug: 'unknown',
        contentSource: 'system',
      }),
    ).toBeUndefined()
    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        contentType: 'classes',
        assetRole: 'portrait',
        slug: 'fighter',
        contentSource: 'system',
      }),
    ).toBeUndefined()
    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        contentType: 'species',
        assetRole: 'primary',
        slug: 'fighter',
        contentSource: 'system',
      }),
    ).toBeUndefined()
  })

  it('does not resolve homebrew records with a system slug', () => {
    expect(
      resolveSystemContentImage({
        imageSetId: 'srd-cc-5.2.1',
        contentType: 'classes',
        assetRole: 'primary',
        slug: 'fighter',
        contentSource: 'homebrew',
      }),
    ).toBeUndefined()
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
        contentType: 'classes',
        assetRole: 'primary',
        slug: 'wizard',
      }),
    ).toBe('assets/system/srd-cc-5.2.1/classes/primary/wizard.jpeg')
  })
})
