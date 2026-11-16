import { describe, expect, it } from 'vitest'

import {
  resolveGroupHeadingHintDependsOn,
  resolveGroupSectionDescription,
} from './form-group-section.lib'

describe('resolveGroupSectionDescription', () => {
  it('resolves dynamic hints from form values', () => {
    expect(
      resolveGroupSectionDescription(
        {
          label: 'Attack bonus',
          hint: {
            resolve: {
              dependsOn: ['bonusSource.kind'],
              hintWhen: (values) =>
                values['bonusSource.kind'] === 'ability' ? 'Ability hint' : 'Spell hint',
            },
          },
        },
        { 'bonusSource.kind': 'spellcasting' },
      ),
    ).toBe('Spell hint')
  })

  it('collects dependsOn paths from dynamic group hints', () => {
    expect(
      resolveGroupHeadingHintDependsOn({
        label: 'Attack bonus',
        hint: { resolve: { dependsOn: ['bonusSource.kind'], hintWhen: () => undefined } },
      }),
    ).toEqual(['bonusSource.kind'])
  })
})
