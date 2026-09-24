import { FilenamePreview } from '@rpg/ui'

import type { MediaStatusNotice } from '../lib/media-notice.lib'

export function MediaStatusNotice({ notice }: { notice: MediaStatusNotice }) {
  if (notice.kind === 'image-added') {
    return (
      <>
        <FilenamePreview
          filename={notice.filename}
          density="compact"
          display="inline"
          className="max-w-[12rem] align-bottom font-medium text-foreground"
        />
        {' added. Assign a role to use it as representative artwork.'}
      </>
    )
  }

  return notice.text
}
