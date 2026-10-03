import {
  QuickNpcPreviewNpcButton,
  type QuickNpcPreviewNpcButtonProps,
} from './quick-npc-preview-npc-button'
import { useQuickNpcPreparedBuildValue } from '../../hooks/use-quick-npc-prepared-build'

/** Authoring-footer preview — projects the live prepared build shared with inline advisories. */
export function QuickNpcAuthoringPreviewButton(
  props: Omit<QuickNpcPreviewNpcButtonProps, 'prepared'>,
) {
  const prepared = useQuickNpcPreparedBuildValue()
  return <QuickNpcPreviewNpcButton {...props} prepared={prepared} />
}
