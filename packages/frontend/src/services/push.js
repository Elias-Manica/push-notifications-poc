/**
 * Cross-platform Push Service (Web + Capacitor Mobile)
 *
 * - Web: uses Firebase Messaging and Service Worker
 * - Mobile (Android/iOS): uses Capacitor Push Notifications plugin (FCM/APNs)
 */

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import firebaseService from './firebase';

const isNative = Capacitor.isNativePlatform();

class PushService {
  constructor() {
    this.token = null;
    this._listeners = [];
  }

  /**
   * Initialize push handling per platform.
   * No-op for web aside from ensuring SW is registered by Vite (public/firebase-messaging-sw.js).
   */
  async initialize() {
    if (!isNative) {
      // Web: nothing special here, firebaseService handles messaging
      return;
    }

    // Mobile: set up listeners once
    this._attachMobileListeners();
  }

  /**
   * Request permission and obtain a push token.
   * Returns the token string.
   */
  async requestPermissionAndGetToken() {
    if (!isNative) {
      // Web path via Firebase
      const token = await firebaseService.getFCMToken();
      this.token = token;
      return token;
    }

    // Mobile path via Capacitor plugin
    const permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive !== 'granted') {
      const req = await PushNotifications.requestPermissions();
      if (req.receive !== 'granted') {
        throw new Error('Permissão de notificações negada');
      }
    }

    // Attach listeners BEFORE register, and await addListener as Capacitor 7 recommends
    const tokenPromise = new Promise(async (resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Timeout ao obter token de push')),
        20000
      );
      const off = await PushNotifications.addListener(
        'registration',
        (tokenObj) => {
          clearTimeout(timeout);
          try {
            off.remove();
          } catch (_) {}
          resolve(tokenObj.value);
        }
      );
      const offErr = await PushNotifications.addListener(
        'registrationError',
        (err) => {
          clearTimeout(timeout);
          try {
            off.remove();
          } catch (_) {}
          try {
            offErr.remove();
          } catch (_) {}
          reject(err?.error || err);
        }
      );
    });

    // Registers with FCM/APNs and emits 'registration'
    await PushNotifications.register();

    const token = await tokenPromise;

    this.token = token;
    return token;
  }

  /**
   * Subscribe to foreground push messages in a platform-agnostic way.
   * Returns an unsubscribe function.
   */
  onMessage(callback) {
    if (!isNative) {
      // Web: delegate to Firebase messaging (foreground)
      firebaseService.onMessage((payload) =>
        callback(this._normalizeWebPayload(payload))
      );
      return () => {
        // Firebase onMessage doesn't expose unsubscribe here; consumer can ignore
      };
    }

    // Mobile: use Capacitor listeners
    const offReceive = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        callback(this._normalizeMobilePayload(notification));
      }
    );
    const offAction = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action) => {
        // Could route navigation based on action.notification.data
        // Expose as a message event to keep API simple
        callback(this._normalizeMobilePayload(action.notification));
      }
    );

    const unsubscribe = () => {
      try {
        offReceive.remove();
      } catch (_) {}
      try {
        offAction.remove();
      } catch (_) {}
    };
    this._listeners.push(unsubscribe);
    return unsubscribe;
  }

  /** Get last known token (may be null). */
  getToken() {
    return this.token;
  }

  /** True if running inside Capacitor native runtime. */
  isNative() {
    return isNative;
  }

  _attachMobileListeners() {
    // Ensure only once; listeners are idempotent at runtime
    // Registration handled in requestPermissionAndGetToken
  }

  _normalizeWebPayload(payload) {
    return {
      title: payload?.notification?.title || 'Notificação',
      body: payload?.notification?.body || 'Nova mensagem',
      data: payload?.data || {},
      raw: payload,
    };
  }

  _normalizeMobilePayload(notification) {
    return {
      title:
        notification?.title ||
        notification?.notification?.title ||
        'Notificação',
      body:
        notification?.body ||
        notification?.notification?.body ||
        'Nova mensagem',
      data: notification?.data || notification?.notification?.data || {},
      raw: notification,
    };
  }
}

const pushService = new PushService();
export default pushService;
