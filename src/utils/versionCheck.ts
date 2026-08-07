import { Alert, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';
import { VERSION_CHECK_URL } from '@/constants/app';

const LAST_CHECK_KEY = 'last_version_check_timestamp';
const CHECK_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days (1 week)

interface PlatformConfig {
  latestVersion: string;
  storeUrl: string;
}

interface VersionConfig {
  ios: PlatformConfig;
  android: PlatformConfig;
}

let isAlertShowing = false;

/**
 * Compares two semantic version strings (e.g., '1.0.1' vs '1.1.0')
 */
function isVersionOlder(current: string, target: string): boolean {
  const currentParts = current.split('.').map(Number);
  const targetParts = target.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, targetParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const targetPart = targetParts[i] || 0;
    if (currentPart < targetPart) return true;
    if (currentPart > targetPart) return false;
  }
  return false;
}

/**
 * Fetches the version configuration from the centralized host and performs version checks.
 */
export async function checkAppVersion(force = false) {
  try {
    if (!force) {
      const lastCheck = await AsyncStorage.getItem(LAST_CHECK_KEY);
      const now = Date.now();
      if (lastCheck && now - parseInt(lastCheck, 10) < CHECK_INTERVAL) {
        return;
      }
    }
    const response = await fetch(VERSION_CHECK_URL);
    if (!response.ok) {
      throw new Error();
    }
    const config: VersionConfig = await response.json();
    await AsyncStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
    const platformConfig = Platform.OS === 'ios' ? config.ios : config.android;
    if (!platformConfig) return;
    const currentVersion = Constants.nativeAppVersion || '1.0.0';
    if (isVersionOlder(currentVersion, platformConfig.latestVersion)) {
      showSoftUpdateAlert(platformConfig.storeUrl);
    }
  } catch (error) {
    console.warn('Failed to check app version', error);
  }
}

function showSoftUpdateAlert(storeUrl: string) {
  if (isAlertShowing) return;
  isAlertShowing = true;

  Alert.alert(
    i18n.t('versionCheck.softTitle'),
    i18n.t('versionCheck.softMessage'),
    [
      {
        text: i18n.t('versionCheck.later'),
        style: 'cancel',
        onPress: () => {
          isAlertShowing = false;
        },
      },
      {
        text: i18n.t('versionCheck.updateNow'),
        onPress: () => {
          isAlertShowing = false;
          Linking.openURL(storeUrl).catch(err => console.error('Failed to open store:', err));
        },
      },
    ],
    { cancelable: true }
  );
}
