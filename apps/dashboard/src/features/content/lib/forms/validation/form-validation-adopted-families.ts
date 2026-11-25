/**
 * Initial Phase 6 adoption families (evaluator resolver + canonical API paint at boundaries).
 * Deferred workflows remain on {@link FORM_VALIDATION_ADOPTION_ALLOWLIST} until Phase 7 guards.
 */
export const FORM_VALIDATION_ADOPTED_FAMILIES = [
  {
    id: 'content-hub',
    surfaces: [
      'ContentFormDef create/edit shells (useContentFormSubmit)',
      'location create (useContentFormSubmit)',
      'duplicate content dialog (useAdoptedFormSubmit)',
    ],
  },
  {
    id: 'campaign',
    surfaces: [
      'campaign create wizard (WizardStepForm)',
      'campaign settings (useAdoptedFormSubmit)',
    ],
  },
  {
    id: 'public-auth',
    surfaces: ['login and signup Form (makeResolver via schema)'],
  },
  {
    id: 'content-master-detail',
    surfaces: [
      'master-detail row validation (useContentFormPresentationIssues)',
      'inline title (useFieldIssue)',
      'monster statistics panel',
    ],
  },
] as const
