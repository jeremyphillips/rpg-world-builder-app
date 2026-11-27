/** Adopted form families (evaluator resolver + canonical API paint at boundaries). */
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
      'invite member dialog (useAdoptedFormSubmit)',
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
  {
    id: 'quick-npc',
    surfaces: ['quick npc authoring (useAdoptedFormSubmit)'],
  },
] as const
