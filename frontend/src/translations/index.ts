import { commonTranslations } from './common';
import { authTranslations } from './auth';
import { dashboardTranslations } from './dashboard';
import { languageSelectionTranslations } from './languageSelection';
import { profileTranslations } from './profile';
import { appointmentsTranslations } from './appointments';
import { historyTranslations } from './history';
// Import other translation files as needed

export type Language = 'en' | 'si' | 'ta';

// Combine all translations
export const translations = {
  en: {
    common: commonTranslations.en,
    auth: authTranslations.en,
    dashboard: dashboardTranslations.en,
    languageSelection: languageSelectionTranslations.en,
    profile: profileTranslations.en,
    appointments: appointmentsTranslations.en,
    history: historyTranslations.en,
    // Add other namespaces
  },
  si: {
    common: commonTranslations.si,
    auth: authTranslations.si,
    dashboard: dashboardTranslations.si,
    languageSelection: languageSelectionTranslations.si,
    profile: profileTranslations.si,
    appointments: appointmentsTranslations.si,
    history: historyTranslations.si,
  },
  ta: {
    common: commonTranslations.ta,
    auth: authTranslations.ta,
    dashboard: dashboardTranslations.ta,
    languageSelection: languageSelectionTranslations.ta,
    profile: profileTranslations.ta,
    appointments: appointmentsTranslations.ta,
    history: historyTranslations.ta,
    // Add other namespaces
  },
};

// Export individual translation objects for direct import if needed
export { commonTranslations, authTranslations, dashboardTranslations };
