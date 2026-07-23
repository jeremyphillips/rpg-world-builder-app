const CHANGES_SAVED_MESSAGE = 'Changes saved.'
const PUBLISHED_MESSAGE = 'Published.'
const PUBLISH_LABEL = 'Publish'
const PUBLISHING_LABEL = 'Publishing…'

export function resolveContentFormFooterPresentation({
  mode,
  submitLabel,
  pendingLabel,
  isSuccess,
  publishSuccess,
}: {
  mode: 'create' | 'edit'
  submitLabel: string
  pendingLabel: string
  isSuccess: boolean
  publishSuccess: boolean
}) {
  if (mode === 'create') {
    return {
      submitLabel: PUBLISH_LABEL,
      pendingLabel: PUBLISHING_LABEL,
      isSuccess: publishSuccess,
      successMessage: publishSuccess ? PUBLISHED_MESSAGE : undefined,
    }
  }

  return {
    submitLabel,
    pendingLabel,
    isSuccess,
    successMessage: isSuccess ? CHANGES_SAVED_MESSAGE : undefined,
  }
}
