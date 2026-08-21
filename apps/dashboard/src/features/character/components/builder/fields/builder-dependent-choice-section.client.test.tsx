import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  characterBuilderDependentChoiceMessages,
  DEFAULT_SYSTEM_RULESET_ID,
  formatFieldMessage,
} from '@rpg/contracts'
import { listLanguageSeedOptions } from '@rpg/catalog/vocabulary'

import {
  mapHeritageOptionsToDependentCardOptions,
  resolveDependentChoiceSectionCopy,
} from '../../../lib/builder/builder-dependent-choice.lib'
import { DEPENDENT_KIND_HERITAGE } from '../../../lib/builder/builder-parent-choice-status.lib'
import { getDrowHeritageSpellCatalog } from '@/features/content'
import { pickSpecies } from '@/features/content'
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

  it('omits helper text when the dependent choice is resolved and collapses to the selected row', () => {
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
    expect(screen.getByRole('radio', { name: /Drow/i })).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /High Elf/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change heritage' })).toBeInTheDocument()
  })

  it('expands all heritage options when Change heritage is clicked', async () => {
    const user = userEvent.setup()

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

    await user.click(screen.getByRole('button', { name: 'Change heritage' }))

    expect(screen.getByRole('radio', { name: /High Elf/i })).toBeInTheDocument()
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

  it('renders embedded panel heading at the 15px text-md scale', () => {
    render(
      <BuilderDependentChoiceSection
        embedded
        title="Elven Lineage"
        sectionCopy={resolveDependentChoiceSectionCopy({ required: true })}
        dependentKindLabel={DEPENDENT_KIND_HERITAGE}
        options={heritageOptions}
        value=""
        onValueChange={() => undefined}
        idPrefix="test-species-heritage"
      />,
    )

    expect(screen.getByRole('heading', { name: 'Elven Lineage' })).toHaveClass('text-md')
    expect(screen.getByText('Required')).toHaveClass('text-md')
  })

  it('renders resolved panel status at the 15px text-md scale', () => {
    render(
      <BuilderDependentChoiceSection
        embedded
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

    expect(screen.getByText('Selected: Drow')).toHaveClass('text-md')
  })

  itAxe('has no axe accessibility violations', async () => {
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
