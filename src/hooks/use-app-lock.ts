import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSettingsStore } from '@/store/settings.store';
import { useAuthStore } from '@/store/auth.store';

/**
 * Module-level flag to prevent the AppState listener from re-locking the app
 * while a biometric prompt is open. This MUST be module-level (not a ref)
 * because the AppState listener and the authenticate function live in different
 * components/closures.
 */
let _isAuthenticating = false;

/**
 * After a successful unlock, we need a grace period where re-locking is suppressed.
 * This prevents the OS-level inactive→active transition (caused by dismissing the
 * biometric prompt) from immediately re-locking the app.
 */
let _justUnlocked = false;

export function useAppLock() {
  const { appLockEnabled, setAppLockEnabled } = useSettingsStore();
  const session = useAuthStore((s) => s.session);
  const isGuest = useAuthStore((s) => s.isGuest);
  
  // App Lock only activates for logged-in users
  const shouldLock = appLockEnabled && !!session && !isGuest;
  
  const [isLocked, setIsLocked] = useState(false);
  const appStateRef = useRef(AppState.currentState);

  // On mount: if app lock is active, start locked
  useEffect(() => {
    if (shouldLock) {
      setIsLocked(true);
    }
  }, []);

  // When user logs out or session expires, immediately unlock AND disable setting
  // This prevents a stale appLockEnabled=true from blocking after re-login
  useEffect(() => {
    if (!shouldLock) {
      setIsLocked(false);
    }
    
    // If user signed out but appLockEnabled is still true, disable the setting
    // so they don't get locked on next login before they even set it up
    if (appLockEnabled && (!session || isGuest)) {
      setAppLockEnabled(false);
    }
  }, [shouldLock, session, isGuest]);

  // Lock when app returns from background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = nextAppState;

      // Only care about transitions TO active
      if (nextAppState !== 'active') return;

      // Was the app previously not active?
      const wasInactive = prev === 'inactive' || prev === 'background';
      if (!wasInactive) return;

      // Skip if a biometric prompt is currently open or just completed
      if (_isAuthenticating || _justUnlocked) return;

      // Skip if app lock is disabled or user is not logged in
      if (!appLockEnabled || !session || isGuest) return;

      setIsLocked(true);
    });

    return () => subscription.remove();
  }, [appLockEnabled, session, isGuest]);

  const unlock = useCallback(() => {
    // Set the grace period flag BEFORE unlocking to prevent race conditions
    _justUnlocked = true;
    setIsLocked(false);
    
    // Clear the grace period after the OS transition has fully settled
    setTimeout(() => {
      _justUnlocked = false;
    }, 1000);
  }, []);

  /**
   * Toggle app lock with biometric validation.
   * Requires biometric auth to both enable and disable.
   */
  const toggleAppLock = useCallback(async (enable: boolean): Promise<boolean> => {
    if (_isAuthenticating) return false;
    _isAuthenticating = true;

    try {
      if (enable) {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardware) return false;

        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!isEnrolled) return false;

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Verify your identity to enable App Lock',
          disableDeviceFallback: false,
        });

        if (result.success) {
          setAppLockEnabled(true);
          return true;
        }
        return false;
      } else {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Verify your identity to disable App Lock',
          disableDeviceFallback: false,
        });

        if (result.success) {
          setAppLockEnabled(false);
          setIsLocked(false);
          return true;
        }
        return false;
      }
    } finally {
      // Keep the flag up long enough for the OS AppState transition to complete
      setTimeout(() => {
        _isAuthenticating = false;
      }, 1000);
    }
  }, [setAppLockEnabled]);

  return {
    isLocked,
    appLockEnabled,
    unlock,
    toggleAppLock,
  };
}

/**
 * Mark that a biometric prompt is about to open.
 * Called by AppLockScreen before `authenticateAsync()`.
 */
export function setAuthenticating(value: boolean) {
  _isAuthenticating = value;
}
