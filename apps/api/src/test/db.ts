import mongoose from 'mongoose'

/** Remove all documents between tests so each case starts clean. */
export async function clearTestDb(): Promise<void> {
  const { collections } = mongoose.connection
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})))
}
