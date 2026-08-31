/**
 * Waghamba Sports Hub - Unified Notification Service
 * Bridges Capacitor Local Notifications (Android) and Web Browser Notifications.
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { NotificationItem } from './types';

export class NotificationService {
  private static isCapacitorAvailable(): boolean {
    return typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.() === true;
  }

  /**
   * Request Notification Permissions across Mobile & Web
   */
  public static async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      if (this.isCapacitorAvailable()) {
        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
      }

      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    } catch (e) {
      console.warn('WGB Notifications: Permission request warning:', e);
    }
    return false;
  }

  /**
   * Schedule or dispatch a notification
   */
  public static async sendNotification(title: string, body: string, id = Date.now()): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      if (this.isCapacitorAvailable()) {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: id % 100000,
              schedule: { at: new Date(Date.now() + 500) },
              sound: 'beep.wav',
              attachments: [],
              actionTypeId: '',
              extra: null
            }
          ]
        });
        return;
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png'
        });
      }
    } catch (error) {
      console.warn('WGB Notifications: Dispatch notice:', error);
    }
  }

  /**
   * Create an in-app notification item
   */
  public static createInAppNotification(
    title: string, 
    message: string, 
    type: NotificationItem['type'] = 'info',
    linkTab?: string
  ): NotificationItem {
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      linkTab
    };
  }
}
