import { avatarVariants } from './avatar.variants'

export const AVATAR_CLASS_SPECS = [
  {
    key: 'sm',
    className: avatarVariants({ size: 'sm' }),
    keyValues: '28px circle, text-xs initials',
    useCase: 'Compact identity',
  },
  {
    key: 'md',
    className: avatarVariants({ size: 'md' }),
    keyValues: '36px circle, text-sm initials',
    useCase: 'Default account and row avatar',
  },
  {
    key: 'lg',
    className: avatarVariants({ size: 'lg' }),
    keyValues: '44px circle, text-base initials',
    useCase: 'Prominent identity',
  },
] as const
