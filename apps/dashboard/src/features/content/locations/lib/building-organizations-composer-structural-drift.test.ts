import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const composerPath = fileURLToPath(
  new URL('../components/building-organizations-composer.client.tsx', import.meta.url),
)
const variantsPath = fileURLToPath(
  new URL('../components/building-organizations-create-tab.variants.ts', import.meta.url),
)
const modalPath = fileURLToPath(
  new URL('../components/location-create-modal.client.tsx', import.meta.url),
)

describe('building organizations composer structural drift', () => {
  it('uses create-modal setup summary grammar instead of legacy selected-card chrome', () => {
    const source = readFileSync(composerPath, 'utf8')

    expect(source).toContain('SelectionSummaryRow')
    expect(source).not.toContain('SelectionSummaryCard')
    expect(source).toContain('RadioCardField')
    expect(source).not.toContain('ChooserSummaryCard')
    expect(source).not.toContain('CollapsibleRadioCardField')
    expect(source).not.toContain('LocationConnectionKindStep')
  })

  it('routes discovery and branch stages through the shared stage subheading pattern', () => {
    const source = readFileSync(composerPath, 'utf8')
    const variants = readFileSync(variantsPath, 'utf8')

    expect(source).toMatch(/function BuildingOrganizationStageSubheading[\s\S]*variant="group"/)
    expect(source).toMatch(
      /BuildingOrganizationStageSubheading[\s\S]*BUILDING_ORGANIZATIONS_DISCOVERY_HEADING/,
    )
    expect(source).toMatch(
      /BuildingOrganizationStageSubheading[\s\S]*BUILDING_ORGANIZATIONS_BRANCH_HEADING/,
    )
    expect(variants).toContain('gap-0.5')
    expect(variants).toContain('gap-2.5')
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
