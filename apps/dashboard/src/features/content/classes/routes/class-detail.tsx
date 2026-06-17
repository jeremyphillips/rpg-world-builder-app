import { Link, useParams } from 'react-router-dom'
import { buttonVariants } from '@rpg/ui'
import type { ClassFeature, CharacterClass, Subclass } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useClasses } from '../hooks/use-classes'
import { useSubclasses } from '../hooks/use-subclasses'
import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { getContentImageUrl } from '../../lib/content-image-url'

function FeatureItem({ feature }: { feature: ClassFeature }) {
  return (
    <li className="space-y-1">
      <p className="font-medium">
        Level {feature.level}: {feature.name}
      </p>
      {feature.description && (
        <p className="text-sm text-muted-foreground">{feature.description}</p>
      )}
    </li>
  )
}

function FeaturesList({ className, features }: { className: string; features: ClassFeature[] }) {
  const sorted = [...features].sort((a, b) => a.level - b.level)
  return (
    <section aria-labelledby="features-heading">
      <h3 id="features-heading" className="mb-4 text-xl font-semibold tracking-tight">
        {className} Class Features
      </h3>
      <ul className="space-y-4" role="list">
        {sorted.map((feature) => (
          <FeatureItem key={feature.id} feature={feature} />
        ))}
      </ul>
    </section>
  )
}

function SubclassesList({ subclasses }: { subclasses: Subclass[] }) {
  if (subclasses.length === 0) return null
  return (
    <section aria-labelledby="subclasses-heading">
      <h3 id="subclasses-heading" className="mb-4 text-xl font-semibold tracking-tight">
        Subclasses
      </h3>
      <ul className="space-y-2" role="list">
        {subclasses.map((sub) => (
          <li key={sub.id}>
            <p className="font-medium">{sub.name}</p>
            {sub.tagline && <p className="text-sm italic text-muted-foreground">{sub.tagline}</p>}
            {sub.description && <p className="text-sm text-muted-foreground">{sub.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}

type ClassDetailContentProps = {
  characterClass: CharacterClass
  campaignId: string
  classId: string
  subclasses: Subclass[]
}

function ClassDetailContent({
  characterClass,
  campaignId,
  classId,
  subclasses,
}: ClassDetailContentProps) {
  const editHref = ROUTES.content.classes.edit(campaignId, classId)
  const backHref = ROUTES.content.classes.overview(campaignId)

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb">
        <Link to={backHref} className="text-sm text-muted-foreground hover:underline">
          ← Classes
        </Link>
      </nav>
      <ContentDetailLayout
        imageUrl={getContentImageUrl(characterClass.imageKey)}
        imageName={characterClass.name}
        actions={
          <Link to={editHref} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Edit
          </Link>
        }
      >
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{characterClass.name}</h2>
          {characterClass.description && (
            <p className="text-muted-foreground">{characterClass.description}</p>
          )}
        </div>
        {characterClass.features.length > 0 && (
          <FeaturesList className={characterClass.name} features={characterClass.features} />
        )}
      </ContentDetailLayout>
      <SubclassesList subclasses={subclasses} />
    </div>
  )
}

function findById(list: CharacterClass[], id: string): CharacterClass | undefined {
  return list.find((item) => item.id === id)
}

export function ClassDetail() {
  const { campaignId = '', classId = '' } = useParams<{ campaignId: string; classId: string }>()
  const { data: classes = [], isPending, isError } = useClasses(campaignId)
  const { data: subclasses = [] } = useSubclasses(campaignId, classId)

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Could not load class.
      </p>
    )
  }

  const characterClass = findById(classes, classId)

  if (!characterClass) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Class not found.
      </p>
    )
  }

  return (
    <ClassDetailContent
      characterClass={characterClass}
      campaignId={campaignId}
      classId={classId}
      subclasses={subclasses}
    />
  )
}
