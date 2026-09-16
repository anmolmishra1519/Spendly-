import { settingsRepo } from '@/database/repositories';
import type { AppSettings, ThemeMode } from '@/types';

const THEME_KEY = 'theme';
const CURRENCY_KEY = 'currency';
const USER_NAME_KEY = 'userName';

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    const theme = ((await settingsRepo.get(THEME_KEY)) as ThemeMode | undefined) ?? 'light';
    const currency = ((await settingsRepo.get(CURRENCY_KEY)) as 'INR' | undefined) ?? 'INR';
    const userName = (await settingsRepo.get(USER_NAME_KEY)) ?? '';
    return { theme, currency, userName };
  },

  async setTheme(theme: ThemeMode): Promise<void> {
    await settingsRepo.set(THEME_KEY, theme);
  },

  async setUserName(name: string): Promise<void> {
    await settingsRepo.set(USER_NAME_KEY, name.trim());
  },
};
