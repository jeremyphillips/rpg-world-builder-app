import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const campaignCreatePath = fileURLToPath(new URL('../routes/campaign-create.tsx', import.meta.url))
const campaignSettingsPath = fileURLToPath(
  new URL('../routes/campaign-settings.tsx', import.meta.url),
)
const inviteMemberDialogPath = fileURLToPath(
  new URL('../components/overview/invite-member-dialog.tsx', import.meta.url),
)

describe('campaign form validation adoption', () => {
  it('uses evaluator-backed wizard steps on create', () => {
    const source = readFileSync(campaignCreatePath, 'utf8')

    expect(source).toContain('WizardStepForm')
    expect(source).not.toContain('useSubmitHandler')
    expect(source).not.toContain('paintValidationIssuesOnForm')
  })

  it('uses runner submit on settings', () => {
    const source = readFileSync(campaignSettingsPath, 'utf8')

    expect(source).toContain('useRunnerFormSubmit')
    expect(source).not.toContain('useAdoptedFormSubmit')
    expect(source).not.toContain('useSubmitHandler')
    expect(source).toContain('TabbedForm')
    expect(source).toContain('producerBoundary={ProducerBoundary}')
  })

  it('uses runner submit on invite member dialog', () => {
    const source = readFileSync(inviteMemberDialogPath, 'utf8')

    expect(source).toContain('useRunnerFormSubmit')
    expect(source).not.toContain('useAdoptedFormSubmit')
    expect(source).not.toContain('useSubmitHandler')
    expect(source).toContain('producerBoundary={ProducerBoundary}')
  })
})
