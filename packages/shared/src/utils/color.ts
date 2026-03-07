/**
 * @module
 * Color utility.
 */

/**
 * Get whether color change on terminal is enabled or disabled.
 * If `NO_COLOR` environment variable is set, this function returns `false`.
 * Unlike getColorEnabledAsync(), this cannot check Cloudflare environment variables.
 * @see {@link https://no-color.org/}
 *
 * @returns {boolean}
 */
export function getColorEnabled(): boolean {
  const { process, Deno } = globalThis as {
    process?: { env?: Record<string, string> };
    Deno?: { noColor?: boolean };
  };

  const isNoColor =
    typeof Deno?.noColor === "boolean"
      ? Deno.noColor
      : process !== undefined
        ? "NO_COLOR" in (process?.env ?? {})
        : false;

  return !isNoColor;
}

/**
 * Get whether color change on terminal is enabled or disabled.
 * If `NO_COLOR` environment variable is set, this function returns `false`.
 * @see {@link https://no-color.org/}
 *
 * @returns {boolean}
 */
export async function getColorEnabledAsync(): Promise<boolean> {
  const { navigator } = globalThis as { navigator?: { userAgent?: string } };
  const cfWorkers = "cloudflare:workers";

  const isNoColor =
    navigator !== undefined && navigator.userAgent === "Cloudflare-Workers"
      ? await (async () => {
          try {
            const workers = await import(cfWorkers);
            return "NO_COLOR" in (workers.env ?? {});
          } catch {
            return false;
          }
        })()
      : !getColorEnabled();

  return !isNoColor;
}
