import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FORM_VALIDATION_ADOPTED_FAMILIES } from './form-validation-adopted-families'

const repoRoot = join(process.cwd(), '../..')

const behavioralSubmitPattern =
  /blocks persist|mutateAsync\)\.not\.toHaveBeenCalled|prepareWrite must not run when commit validation blocks save/

describe('form validation family adoption guard', () => {
  it('records production-entry regression anchors for each adopted family', () => {
    const anchors: Record<string, string> = {
      'content-hub':
        'apps/dashboard/src/features/content/lib/forms/shells/submit/content-form-submit-drift.test.ts',
      campaign:
        'apps/dashboard/src/features/campaign/lib/campaign-form-validation-adoption.test.ts',
      'public-auth': 'apps/public/src/features/auth/lib/auth-form-adoption.test.ts',
      'subclass-editor':
        'apps/dashboard/src/features/content/classes/lib/subclass-save-runner.test.ts',
      'content-master-detail':
        'apps/dashboard/src/features/content/lib/forms/validation/content-form-tab-ownership.test.ts',
      'quick-npc':
        'apps/dashboard/src/features/content/lib/forms/validation/form-validation-adoption-allowlist.ts',
    }

    for (const family of FORM_VALIDATION_ADOPTED_FAMILIES) {
      const anchor = anchors[family.id]
      expect(anchor, `missing anchor for ${family.id}`).toBeTruthy()
      const source = readFileSync(join(repoRoot, anchor!), 'utf8')
      expect(source.length).toBeGreaterThan(0)
    }
  })

  it('content-hub batch A nouns each have mounted submit regression anchors', () => {
    const contentHubAnchors = [
      'apps/dashboard/src/features/content/species/lib/species-edit-validation-pipeline.integration.test.tsx',
      'apps/dashboard/src/features/content/feats/lib/feat-create-validation-pipeline.integration.test.tsx',
      'apps/dashboard/src/features/content/skill-proficiencies/lib/skill-proficiency-edit-validation-pipeline.integration.test.tsx',
      'apps/dashboard/src/features/content/locations/components/create/location-create-invalid-submit.integration.test.tsx',
      'apps/dashboard/src/features/content/organizations/components/create/organization-create-modal-validation.integration.test.tsx',
    ]

    for (const anchor of contentHubAnchors) {
      const source = readFileSync(join(repoRoot, anchor), 'utf8')
      expect(source).toMatch(/describe\(/)
      expect(source).toMatch(/it\(/)
      expect(source, anchor).toMatch(behavioralSubmitPattern)
      expect(source, anchor).toMatch(/useContentFormSubmit|ProducerBoundary/)
    }
  })

  it('campaign batch B surfaces each have mounted submit regression anchors', () => {
    const campaignAnchors = [
      'apps/dashboard/src/features/campaign/lib/campaign-create-wizard-step.integration.test.tsx',
      'apps/dashboard/src/features/campaign/lib/campaign-settings-invalid-submit.integration.test.tsx',
      'apps/dashboard/src/features/campaign/lib/campaign-invite-runner.integration.test.tsx',
    ]

    for (const anchor of campaignAnchors) {
      const source = readFileSync(join(repoRoot, anchor), 'utf8')
      expect(source).toMatch(/describe\(/)
      expect(source).toMatch(/it\(/)
      expect(source, anchor).toMatch(behavioralSubmitPattern)
      expect(source, anchor).toMatch(/ProducerBoundary|runFormAction|validateCampaignCreateValues/)
    }
  })

  it('public auth batch B has mounted runFormAction invalid-submit regression', () => {
    const anchor = 'apps/public/src/features/auth/lib/auth-form-validation-mounted.test.tsx'
    const source = readFileSync(join(repoRoot, anchor), 'utf8')
    expect(source).toMatch(/describe\(/)
    expect(source).toMatch(/it\(/)
    expect(source).toMatch(behavioralSubmitPattern)
    expect(source).toMatch(/useAuthFormSubmit/)
  })

  it('subclass editor batch B has mounted save and tab isolation regression anchors', () => {
    const mountedAnchors = [
      'apps/dashboard/src/features/content/classes/lib/subclass-edit-invalid-submit.integration.test.tsx',
      'apps/dashboard/src/features/content/classes/lib/subclass-session-tab-isolation.integration.test.tsx',
    ]

    for (const anchor of mountedAnchors) {
      const source = readFileSync(join(repoRoot, anchor), 'utf8')
      expect(source).toMatch(/describe\(/)
      expect(source).toMatch(/it\(/)
      expect(source, anchor).toMatch(behavioralSubmitPattern)
      expect(source, anchor).toMatch(
        /useRunnerFormSubmit|ProducerBoundary|does not badge|blocks persist/,
      )
    }
  })

  it('quick-npc stays deferred on FORM_VALIDATION_ADOPTION_ALLOWLIST only', () => {
    const source = readFileSync(
      join(repoRoot, 'apps/dashboard/src/lib/form-validation-adoption.lib.ts'),
      'utf8',
    )
    expect(source).toContain('useAdoptedFormSubmit')
    const quickNpcSource = readFileSync(
      join(
        repoRoot,
        'apps/dashboard/src/features/character/npc/components/quick-npc/quick-npc-authoring-form.tsx',
      ),
      'utf8',
    )
    expect(quickNpcSource).toContain('useAdoptedFormSubmit')
    expect(quickNpcSource).not.toContain('useRunnerFormSubmit')
  })
})
