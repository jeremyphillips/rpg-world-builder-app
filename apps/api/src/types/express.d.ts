import type { SessionUser } from '@rpg/contracts'

declare global {
  namespace Express {
    interface Request {
      /** Populated by `requireAuth` once a valid session cookie is verified. */
      user?: SessionUser
    }
  }
}

export {}
