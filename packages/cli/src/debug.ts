import createDebug from "debug";

const root = createDebug("keyflare");

export function makeDebug(scope: string) {
  return (...args: unknown[]) => {
    root(`[${scope}]`, ...args);
  };
}

export function redact(value: string | undefined): string {
  if (!value) return "<empty>";
  if (value.length <= 8) return "********";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
