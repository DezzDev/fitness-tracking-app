import type { CookieOptions } from 'express';
import { env, isProduction } from '@/config/env';

const DEFAULT_REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const parseDurationToMs = (duration: string): number => {
  const value = duration.trim().toLowerCase();
  const match = value.match(/^(\d+)(ms|s|m|h|d)$/);

  if (!match) {
    return DEFAULT_REFRESH_COOKIE_MAX_AGE_MS;
  }

  const amount = Number(match[1]);
  const unit = match[2];

  const unitToMs: Record<'ms' | 's' | 'm' | 'h' | 'd', number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * unitToMs[unit as keyof typeof unitToMs];
};

const refreshCookieMaxAgeMs = parseDurationToMs(env.JWT_REFRESH_EXPIRY);



export const getRefreshTokenCookieOptions = (): CookieOptions => {

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: refreshCookieMaxAgeMs,
    path: '/',
  };
};

export const getRefreshTokenClearCookieOptions = (): CookieOptions => {

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
};
