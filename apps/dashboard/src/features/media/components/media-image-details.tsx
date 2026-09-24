import { useId, useMemo } from 'react'
import { Button, CheckboxField, FilenamePreview } from '@rpg/ui'
import { Form, type FormItem, type FormValueSync } from '@rpg/ui/form'
import {
  MEDIA_ROLE_ENTRIES,
  asCropPresentation,
  contentImageSchema,
  resolveMediaRoleEligibility,
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
  const source = { width: asset.orientedWidth, height: asset.orientedHeight }

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
        {policy.allowedRoles.map((role) => {
          const assignment = media.roles[role]
          const cropPresentation = asCropPresentation(
            assignment?.imageId === image.id ? assignment.presentation : undefined,
          )
          const eligibility = resolveMediaRoleEligibility(role, source, cropPresentation)
          const hint = !eligibility.eligible
            ? eligibility.message
            : (eligibility.hint ?? MEDIA_ROLE_ENTRIES[role].description)

          return (
            <CheckboxField
              key={role}
              id={`${id}-${role}`}
              label={MEDIA_ROLE_ENTRIES[role].label}
              hint={hint}
              checked={media.roles[role]?.imageId === image.id}
              disabled={!eligibility.eligible}
              onCheckedChange={(checked) => onRole(role, checked === true)}
            />
          )
        })}
      </fieldset>
      <dl className={styles.metadata()}>
        <dt className={styles.metadataLabel()}>File name</dt>
        <dd className={styles.metadataValue()}>
          <FilenamePreview filename={asset.filename} density="metadata" />
        </dd>
        <dt className={styles.metadataLabel()}>Dimensions</dt>
        <dd className={styles.metadataValue()}>
          {asset.orientedWidth} × {asset.orientedHeight}
        </dd>
        <dt className={styles.metadataLabel()}>File size</dt>
        <dd className={styles.metadataValue()}>
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
