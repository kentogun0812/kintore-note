import {
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  requestPermission,
  subscribeToTopic,
  unsubscribeFromTopic,
  AuthorizationStatus,
  RemoteMessage
} from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_CACHE_KEY = 'fcm_token_registered';
const FCM_TOPIC_ALL_USERS = 'all_users';
const FCM_TABLE_NAME = 'user_fcm_tokens';
const FCM_GUEST_USER_ID = 'guest';

/**
 * Request notification permissions from the user.
 */
export async function requestUserPermission(): Promise<boolean> {
  // try {
  //   const messagingInstance = getMessaging();
  //   const authStatus = await requestPermission(messagingInstance);
  //   const enabled =
  //     authStatus === AuthorizationStatus.AUTHORIZED ||
  //     authStatus === AuthorizationStatus.PROVISIONAL;
  //   return enabled;
  // } catch (error) {
  //   console.warn('[FCM] Failed to request notification permission:', error);
  //   return false;
  // }
  return false;
}

/**
 * Register the current device's FCM token in the Supabase user_fcm_tokens table
 */
export async function registerFCMToken(userId: string): Promise<void> {
  // try {
  //   if (userId === FCM_GUEST_USER_ID) {
  //     const hasPermission = await requestUserPermission();
  //     if (hasPermission) {
  //       const messagingInstance = getMessaging();
  //       await subscribeToTopic(messagingInstance, FCM_TOPIC_ALL_USERS);
  //     }
  //     return;
  //   }
  //   const hasPermission = await requestUserPermission();
  //   if (!hasPermission) {
  //     return;
  //   }
  //   const messagingInstance = getMessaging();
  //   const token = await getToken(messagingInstance);
  //   if (!token) {
  //     return;
  //   }
  //   const cachedToken = await AsyncStorage.getItem(FCM_TOKEN_CACHE_KEY);
  //   if (cachedToken === token) {
  //     await subscribeToTopic(messagingInstance, FCM_TOPIC_ALL_USERS);
  //     return;
  //   }
  //   const { error } = await supabase
  //     .from(FCM_TABLE_NAME)
  //     .upsert({
  //       token,
  //       user_id: userId,
  //       device_type: Platform.OS,
  //       updated_at: new Date().toISOString(),
  //     });
  //   if (error) {
  //     return;
  //   }
  //   await AsyncStorage.setItem(FCM_TOKEN_CACHE_KEY, token);
  //   await subscribeToTopic(messagingInstance, FCM_TOPIC_ALL_USERS);
  // } catch (error) {
  //   console.error('[FCM] Error in registerFCMToken:', error);
  // }
}

/**
 * Unregister user FCM token mappings on Supabase.
 */
export async function unregisterFCMToken(): Promise<void> {
  // try {
  //   const messagingInstance = getMessaging();
  //   const token = await getToken(messagingInstance);
  //   if (!token) return;

  //   const { error } = await supabase
  //     .from(FCM_TABLE_NAME)
  //     .delete()
  //     .eq('token', token);

  //   if (error) {
  //     return;
  //   } 
  //   await AsyncStorage.removeItem(FCM_TOKEN_CACHE_KEY);
  // } catch (error) {
  //   console.error('[FCM] Error in unregisterFCMToken:', error);
  // }
}

/**
 * Subscribe device to a Firebase Cloud Messaging topic.
 */
export async function subscribeToTopicWrapper(topicName: string): Promise<void> {
  // try {
  //   const messagingInstance = getMessaging();
  //   await subscribeToTopic(messagingInstance, topicName);
  // } catch (error) {
  //   console.error(`[FCM] Topic subscription failed for ${topicName}:`, error);
  // }
}

/**
 * Unsubscribe device from a Firebase Cloud Messaging topic.
 */
export async function unsubscribeFromTopicWrapper(topicName: string): Promise<void> {
  // try {
  //   const messagingInstance = getMessaging();
  //   await unsubscribeFromTopic(messagingInstance, topicName);
  // } catch (error) {
  //   console.error(`[FCM] Topic unsubscription failed for ${topicName}:`, error);
  // }
}

/**
 * Set up application-level listeners for FCM messages.
 */
export function setupFCMListeners(): () => void {
  // const messagingInstance = getMessaging();
  // const unsubscribeForeground = onMessage(messagingInstance, async (remoteMessage: RemoteMessage) => {
  //   console.log('[FCM] Foreground notification message received:', remoteMessage.notification);
  // });

  // const unsubscribeNotificationOpen = onNotificationOpenedApp(messagingInstance, (remoteMessage: RemoteMessage) => {
  //   console.log('[FCM] App opened from background due to notification click:', remoteMessage);
  // });

  // getInitialNotification(messagingInstance)
  //   .then((remoteMessage: RemoteMessage | null) => {
  //     if (remoteMessage) {
  //       console.log('[FCM] App opened from quit state due to notification click:', remoteMessage);
  //     }
  //   })
  //   .catch(error => {
  //     console.warn('[FCM] Error checking initial notification:', error);
  //   });

  // return () => {
  //   unsubscribeForeground();
  //   unsubscribeNotificationOpen();
  // };
  return () => { };
}
