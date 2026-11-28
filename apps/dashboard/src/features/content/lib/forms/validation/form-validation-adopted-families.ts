/** Adopted form families (evaluator resolver + canonical API paint at boundaries). */
export const FORM_VALIDATION_ADOPTED_FAMILIES = [
  {
    id: 'content-hub',
    surfaces: [
      'ContentFormDef create/edit shells (useContentFormSubmit)',
      'species edit (useContentFormSubmit)',
      'feat create (useContentFormSubmit)',
      'skill proficiency edit (useContentFormSubmit)',
      'location create (useContentFormSubmit)',
      'organization create modal (useContentFormSubmit)',
      'duplicate content dialog (useRunnerFormSubmit)',
    ],
  },
  {
    id: 'campaign',
    surfaces: [
      'campaign create wizard (WizardStepForm + validateCampaignCreateValues / runFormAction)',
      'campaign settings (useRunnerFormSubmit)',
      'invite member dialog (useRunnerFormSubmit)',
    ],
  },
  {
    id: 'public-auth',
    surfaces: ['login and signup Form (useAuthFormSubmit + runFormAction)'],
  },
  {
    id: 'subclass-editor',
    surfaces: [
      'subclass detail editor (useRunnerFormSubmit + isolated FormUiProvider)',
      'class Subclasses tab (no parent badge/focus for subclass-session issues)',
    ],
  },
  {
    id: 'content-master-detail',
    surfaces: [
      'master-detail row validation (useContentFormPresentationIssues)',
      'inline title (useFieldIssue)',
      'monster statistics panel',
    ],
  },
  {
    id: 'quick-npc',
    surfaces: ['quick npc authoring (deferred; FORM_VALIDATION_ADOPTION_ALLOWLIST)'],
  },
] as const
