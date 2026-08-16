import { SESSION_COOKIE } from "../auth/sessions.js";
import type { Config } from "../config.js";

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
  domain?: string;
}

export function setSessionCookie(
  reply: { setCookie: (name: string, value: string, opts: CookieOptions) => void },
  token: string,
  config: Config,
): void {
  const opts: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: config.SESSION_TTL_SECONDS,
  };
  if (config.COOKIE_DOMAIN) opts.domain = config.COOKIE_DOMAIN;
  reply.setCookie(SESSION_COOKIE, token, opts);
}

export function clearSessionCookie(
  reply: { clearCookie: (name: string, opts: CookieOptions) => void },
  config: Config,
): void {
  const opts: CookieOptions = { path: "/" };
  if (config.COOKIE_DOMAIN) opts.domain = config.COOKIE_DOMAIN;
  reply.clearCookie(SESSION_COOKIE, opts);
}