// hooks/useTranslations.ts
import { useLanguage } from '@/contexts/LanguageContext';

export const useAuthTranslations = () => {
  const { t } = useLanguage();
  return (key: string) => t(key, 'auth');
};

export const useCommonTranslations = () => {
  const { t } = useLanguage();
  return (key: string) => t(key, 'common');
};

export const useDashboardTranslations = () => {
  const { t } = useLanguage();
  return (key: string) => t(key, 'dashboard');
};


// hooks/useTranslations.ts
export const useProfileTranslations = () => {
  const { t } = useLanguage();
  return (key: string) => t(key, 'profile');
};

// hooks/useTranslations.ts
export const useAppointmentsTranslations = () => {
  const { t } = useLanguage();
  return (key: string) => t(key, 'appointments');
};


export const useHistoryTranslations = () => {
  const { t } = useLanguage();
  return (key: string) => t(key, 'history');
};