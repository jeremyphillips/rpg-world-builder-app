import { ROUTES } from '@/app/routes'
import { CONTENT_FORM_TAB_SEARCH_PARAM } from '../../lib/forms/shells/layout/content-form-tab-search.lib'

export const CLASS_EDIT_SUBCLASSES_TAB = 'subclasses'

export function classEditSubclassesHref(campaignId: string, classId: string): string {
  const edit = ROUTES.content.classes.edit(campaignId, classId)
  return `${edit}?${CONTENT_FORM_TAB_SEARCH_PARAM}=${CLASS_EDIT_SUBCLASSES_TAB}`
}
