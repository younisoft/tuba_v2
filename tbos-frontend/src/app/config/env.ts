/**
 * The one place import.meta.env is read — components/lib code should import
 * from here, never reach into import.meta.env directly (SECURITY.md "safe
 * environment variables"). No secrets belong in any Vite env var: everything
 * exposed via import.meta.env ships in the client bundle.
 */
export const env = {
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
