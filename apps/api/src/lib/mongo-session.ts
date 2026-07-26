import type { ClientSession } from 'mongoose'

/** Optional MongoDB client session for multi-document transaction participation. */
export type WithMongoSession = {
  session?: ClientSession
}
