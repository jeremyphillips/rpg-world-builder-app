/** Production uses 12 rounds; tests use fewer for speed (auth behavior is still exercised). */
export const BCRYPT_ROUNDS = process.env.NODE_ENV === 'test' ? 4 : 12
