import { createRightTimeClient } from '@rightcom/righttime-sdk';
import type { RightTimeSdkClient } from '@rightcom/righttime-sdk';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export interface RightCareSettings {
  publicKey: string;
  company: string;
  apiUrl: string;
  hostOrigin: string;
}

interface RightCareContextValue {
  settings: RightCareSettings;
  updateSetting: <K extends keyof RightCareSettings>(key: K, value: RightCareSettings[K]) => void;
  client: RightTimeSdkClient | null;
  sdkCdnUrl: string;
  hostedWidgetUrl: string;
}

const defaultSettings: RightCareSettings = {
  publicKey: process.env.EXPO_PUBLIC_RIGHTTIME_PUBLIC_KEY ?? '',
  company: process.env.EXPO_PUBLIC_RIGHTTIME_COMPANY ?? '',
  apiUrl: process.env.EXPO_PUBLIC_RIGHTTIME_API_URL ?? 'https://api.righttime.com/v1',
  hostOrigin: process.env.EXPO_PUBLIC_RIGHTTIME_HOST_ORIGIN ?? '',
};

const sdkCdnUrl =
  process.env.EXPO_PUBLIC_RIGHTTIME_SDK_CDN_URL ??
  'https://cdn.rightcom.com/righttime/v1/righttime.global.js';
const hostedWidgetUrl = process.env.EXPO_PUBLIC_RIGHTTIME_WIDGET_URL ?? '';

const RightCareContext = createContext<RightCareContextValue | null>(null);

export function RightCareProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings);
  const client = useMemo<RightTimeSdkClient | null>(() => {
    if (!settings.publicKey.trim() || !settings.company.trim()) return null;
    return createRightTimeClient({
      publicKey: settings.publicKey.trim(),
      company: settings.company.trim(),
      baseUrl: settings.apiUrl.trim(),
      hostOrigin: settings.hostOrigin.trim() || undefined,
    });
  }, [settings]);

  const value: RightCareContextValue = {
    settings,
    updateSetting: (key, value) => setSettings((current) => ({ ...current, [key]: value })),
    client,
    sdkCdnUrl,
    hostedWidgetUrl,
  };

  return <RightCareContext.Provider value={value}>{children}</RightCareContext.Provider>;
}

export function useRightCare() {
  const context = useContext(RightCareContext);
  if (!context) throw new Error('useRightCare must be used inside RightCareProvider');
  return context;
}
