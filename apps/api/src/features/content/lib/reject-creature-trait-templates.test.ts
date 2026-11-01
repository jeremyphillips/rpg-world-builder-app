import { describe, expect, it } from 'vitest'

import { HttpError } from '../../../lib/http-error'
import { rejectInvalidCreatureTraitTemplates } from './reject-creature-trait-templates'

describe('rejectInvalidCreatureTraitTemplates', () => {
  it('rejects an unknown template id', () => {
    expect(() =>
      rejectInvalidCreatureTraitTemplates(
        [{ kind: 'template', id: 'row', templateId: 'not-a-trait' }],
        ['traits'],
      ),
    ).toThrow(HttpError)

    try {
      rejectInvalidCreatureTraitTemplates(
        [{ kind: 'template', id: 'row', templateId: 'not-a-trait' }],
        ['traits'],
      )
    } catch (error) {
      expect(error).toMatchObject({
        status: 400,
        code: 'validation_error',
        details: {
          issues: [
            expect.objectContaining({
              path: ['traits', 0, 'templateId'],
            }),
          ],
        },
      })
    }
  })

  it('allows custom rows and known templates', () => {
    expect(() =>
      rejectInvalidCreatureTraitTemplates(
        [
          { kind: 'custom', id: 'prose', name: 'Keen Senses' },
          { kind: 'template', id: 'pack', templateId: 'pack-tactics' },
        ],
        ['traits'],
      ),
    ).not.toThrow()
  })
})
