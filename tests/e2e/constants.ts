/** Shared by playwright.config.ts and the specs. Test database only. */
export const E2E_PORT = 3100
export const E2E_ORIGIN = `http://localhost:${E2E_PORT}`
/** Seeded admin for the caching suite (SEED_ADMIN_* in the web server env). */
export const E2E_ADMIN = { email: 'e2e-admin@example.test', password: 'e2e-admin-password-1' }
