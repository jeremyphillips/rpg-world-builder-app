import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  characterBuilderDependentChoiceMessages,
  DEFAULT_SYSTEM_RULESET_ID,
  formatFieldMessage,
} from '@rpg/contracts'
import { listLanguageSeedOptions } from '@rpg/catalog/vocabulary'

import {
  mapHeritageOptionsToDependentCardOptions,
  resolveDependentChoiceSectionCopy,
} from '../lib/builder-dependent-choice.lib'
import { DEPENDENT_KIND_HERITAGE } from '../lib/builder-parent-choice-status.lib'
import { getDrowHeritageSpellCatalog } from '@/features/content/lib/fixtures/grant-display-fixtures'
import { pickSpecies } from '@/features/content/lib/fixtures/pick'
import { BuilderDependentChoiceSection } from './builder-dependent-choice-section.client'

const elf = pickSpecies('elf')
const heritageOptions = mapHeritageOptionsToDependentCardOptions(
  elf,
  listLanguageSeedOptions(DEFAULT_SYSTEM_RULESET_ID),
  getDrowHeritageSpellCatalog(),
)

describe('BuilderDependentChoiceSection', () => {
  it('renders heading, status, helper, and heritage options', () => {
    render(
      <BuilderDependentChoiceSection
        title="Elven Lineage"
        sectionCopy={resolveDependentChoiceSectionCopy({ required: true })}
        dependentKindLabel={DEPENDENT_KIND_HERITAGE}
        options={heritageOptions}
        value=""
        onValueChange={() => undefined}
        idPrefix="test-species-heritage"
      />,
    )

    expect(screen.getByRole('region', { name: 'Elven Lineage' })).toBeInTheDocument()
    expect(
      screen.getByText(
        formatFieldMessage(characterBuilderDependentChoiceMessages.requiredStatus()),
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(formatFieldMessage(characterBuilderDependentChoiceMessages.helperText())),
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Drow/i })).toBeInTheDocument()
  })

  it('omits helper text when the dependent choice is resolved', () => {
    render(
      <BuilderDependentChoiceSection
        title="Elven Lineage"
        sectionCopy={resolveDependentChoiceSectionCopy({
          required: false,
          selectedOptionLabel: 'Drow',
        })}
        dependentKindLabel={DEPENDENT_KIND_HERITAGE}
        options={heritageOptions}
        value="drow"
        onValueChange={() => undefined}
        idPrefix="test-species-heritage"
      />,
    )

    expect(
      screen.getByText(
        formatFieldMessage(
          characterBuilderDependentChoiceMessages.optionSelected({ selectedOptionLabel: 'Drow' }),
        ),
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(formatFieldMessage(characterBuilderDependentChoiceMessages.helperText())),
    ).not.toBeInTheDocument()
  })

  it('calls onValueChange when a heritage option is selected', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <BuilderDependentChoiceSection
        title="Elven Lineage"
        sectionCopy={resolveDependentChoiceSectionCopy({ required: true })}
        dependentKindLabel={DEPENDENT_KIND_HERITAGE}
        options={heritageOptions}
        value=""
        onValueChange={onValueChange}
        idPrefix="test-species-heritage"
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Drow/i }))
    expect(onValueChange).toHaveBeenCalledWith('drow')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <BuilderDependentChoiceSection
        title="Elven Lineage"
        sectionCopy={resolveDependentChoiceSectionCopy({ required: true })}
        dependentKindLabel={DEPENDENT_KIND_HERITAGE}
        options={heritageOptions}
        value=""
        onValueChange={() => undefined}
        idPrefix="test-species-heritage"
      />,
    )

    await expectNoAxeViolations(container)
  })
})
