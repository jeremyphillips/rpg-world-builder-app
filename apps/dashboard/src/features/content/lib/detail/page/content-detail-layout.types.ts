export type ContentDetailHeroMediaPresentation = {
  frame?: 'primary' | 'emblem'
  placement?: 'start' | 'end'
  size?: 'default' | 'emblem-lg'
}

export const DEFAULT_CONTENT_DETAIL_HERO_MEDIA_PRESENTATION: ContentDetailHeroMediaPresentation = {
  frame: 'primary',
  placement: 'end',
  size: 'default',
}
