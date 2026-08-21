import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const composerPath = fileURLToPath(
  new URL(
    '../../components/building-organizations/building-organizations-composer.client.tsx',
    import.meta.url,
  ),
)
const variantsPath = fileURLToPath(
  new URL(
    '../../components/building-organizations/building-organizations-create-tab.variants.ts',
    import.meta.url,
  ),
)
const modalPath = fileURLToPath(
  new URL('../../components/create/location-create-modal.client.tsx', import.meta.url),
)

describe('building organizations composer structural drift', () => {
  it('uses create-modal setup summary grammar instead of legacy selected-card chrome', () => {
    const source = readFileSync(composerPath, 'utf8')

    expect(source).toContain('CreateCompositionSummary')
    expect(source).not.toContain('SelectionSummaryCard')
    expect(source).toContain('RadioCardField')
    expect(source).not.toContain('ChooserSummaryCard')
    expect(source).not.toContain('CollapsibleRadioCardField')
    expect(source).not.toContain('LocationConnectionKindStep')
  })

  it('uses shared create-flow composition presentation instead of local layout anatomy', () => {
    const source = readFileSync(composerPath, 'utf8')
    const variants = readFileSync(variantsPath, 'utf8')

    expect(source).toContain('CreateCompositionComposer')
    expect(source).toContain('CreateCompositionSummary')
    expect(source).toContain('CreateCompositionStage')
    expect(source).not.toContain('BuildingOrganizationStageSubheading')
    expect(source).not.toContain('BuildingOrganizationComposerSummaryRows')
    expect(source).not.toContain('SelectionSummaryRow')
    expect(source).not.toContain('SelectionSummaryChangeAction')
    expect(source).toContain('mapBuildingOrganizationCompositionSummaryRows')
    expect(variants).not.toContain('buildingOrganizationsStageSubheadingClasses')
    expect(variants).not.toContain('buildingOrganizationsComposerClasses')
    expect(variants).not.toContain('gap-2.5')
    expect(source).not.toMatch(/\bspace-y-\d/)
    expect(source).toContain('createCompositionStageSubheadingClasses')
    // Policy: apps/dashboard/docs/create-flow.md §Nested composition presentation
  })
})

describe('location create modal composition ownership drift', () => {
  it('consumes only semantic child-workflow projection without org composer internals', () => {
    const source = readFileSync(modalPath, 'utf8')

    expect(source).toContain('CreateCompositionChildWorkflowView')
    expect(source).toContain('childWorkflow')
    expect(source).not.toMatch(/\bBuildingOrganizationComposerStage\b/)
    expect(source).not.toMatch(/\bselectedOrganization\b/)
    expect(source).not.toMatch(/\bnewOrganizationDraftId\b/)
    expect(source).not.toMatch(/\bBUILDING_ORGANIZATION_/i)
  })
})
