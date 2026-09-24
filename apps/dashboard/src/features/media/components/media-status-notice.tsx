import type { MediaStatusNotice } from '../lib/media-notice.lib'

export function MediaStatusNotice({ notice }: { notice: MediaStatusNotice }) {
  return notice.text
}
