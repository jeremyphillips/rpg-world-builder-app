import { useId, useMemo } from 'react'
import { Button, CheckboxField } from '@rpg/ui'
import { Form, type FormItem, type FormValueSync } from '@rpg/ui/form'
import {
  CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX,
  MEDIA_ROLE_ENTRIES,
  contentImageSchema,
  type ContentMedia,
  type ContentMediaPolicy,
  type MediaAsset,
  type MediaRole,
} from '@rpg/contracts'
import { mediaManagerStyles as styles } from './media-manager.variants'

const altSchema = contentImageSchema.pick({ alt: true })
const altFields: FormItem[] = [
  {
    name: 'alt',
    type: 'text',
    label: 'Alt text',
    hint: 'Describe the original image for accessibility.',
  },
]
export type MediaImageDetailsProps = {
  image: ContentMedia['images'][number]
  asset: MediaAsset
  media: ContentMedia
  policy: ContentMediaPolicy
  onAlt: (alt: string) => void
  onRole: (role: MediaRole, assigned: boolean) => void
  onRemove: () => void
}
export function MediaImageDetails({
  image,
  asset,
  media,
  policy,
  onAlt,
  onRole,
  onRemove,
}: MediaImageDetailsProps) {
  const id = useId()
  const syncs = useMemo<FormValueSync[]>(
    () => [
      {
        dependsOn: ['alt'],
        apply: (values) => {
          onAlt(String(values.alt ?? ''))
          return undefined
        },
      },
    ],
    [onAlt],
  )
  const portraitEligible =
    Math.min(asset.orientedWidth, asset.orientedHeight) >= CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX
  return (
    <aside className={styles.details()}>
      <h3 className={styles.subheading()}>Image details</h3>
      <Form
        key={image.id}
        schema={altSchema}
        fields={altFields}
        defaultValues={{ alt: image.alt ?? '' }}
        onSubmit={(values) => onAlt(values.alt ?? '')}
        valueSyncs={syncs}
        footer={null}
      />
      <fieldset className={styles.roles()}>
        <legend className={styles.subheading()}>Assign roles</legend>
        {(['portrait', 'primary'] as const)
          .filter((role) => policy.allowedRoles.includes(role))
          .map((role) => (
            <CheckboxField
              key={role}
              id={`${id}-${role}`}
              label={MEDIA_ROLE_ENTRIES[role].label}
              hint={
                role === 'portrait' && !portraitEligible
                  ? `Requires at least ${CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX} × ${CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX} pixels; this image is ${asset.orientedWidth} × ${asset.orientedHeight}.`
                  : MEDIA_ROLE_ENTRIES[role].description
              }
              checked={media.roles[role]?.imageId === image.id}
              disabled={role === 'portrait' && !portraitEligible}
              onCheckedChange={(checked) => onRole(role, checked === true)}
            />
          ))}
      </fieldset>
      <dl className={styles.metadata()}>
        <dt>File name</dt>
        <dd>{asset.filename}</dd>
        <dt>Dimensions</dt>
        <dd>
          {asset.orientedWidth} × {asset.orientedHeight}
        </dd>
        <dt>File size</dt>
        <dd>
          {new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(
            asset.byteSize / 1024,
          )}{' '}
          KB
        </dd>
      </dl>
      {asset.animated && <p className={styles.muted()}>Animated source; still preview.</p>}
      <Button type="button" variant="outline" onClick={onRemove}>
        Remove image
      </Button>
    </aside>
  )
}
