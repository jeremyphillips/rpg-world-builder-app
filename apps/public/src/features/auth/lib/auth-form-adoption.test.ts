import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const authFeatureRoot = join(import.meta.dirname, '..')
const loginFormPath = join(authFeatureRoot, 'components/login-form.tsx')
const signupFormPath = join(authFeatureRoot, 'components/signup-form.tsx')

describe('auth form validation adoption', () => {
  it('uses schema-driven Form surfaces on login and signup', () => {
    for (const path of [loginFormPath, signupFormPath]) {
      const source = readFileSync(path, 'utf8')
      expect(source).toContain('<Form')
      expect(source).toContain('schema={')
      expect(source).toContain('fields={')
      expect(source).not.toContain('paintValidationIssuesOnForm')
      expect(source).not.toContain('prepareFormIssues')
      expect(source).toContain('useAuthFormSubmit')
      expect(source).not.toContain('setFormError')
    }
  })
})
