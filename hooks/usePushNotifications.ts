import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../services/firebase';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

// iPhone Safari doesn't have the Notification API at all
const isNotificationSupported = typeof window !== 'undefined' && 'Notification' in window;

export const usePushNotifications = () => {
    const { user } = useAuth();
    const [token, setToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<any>(null);

    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
        isNotificationSupported ? Notification.permission : 'denied'
    );

    const requestPermission = async () => {
        try {
            // Check if notifications are supported at all (iPhone Safari = NO)
            if (!isNotificationSupported) {
                console.log('Notification API not supported (likely iOS Safari)');
                return;
            }

            // Check if push notifications are supported
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                console.log('Push notifications not supported in this browser');
                return;
            }

            const permission = await Notification.requestPermission();
            setPermissionStatus(permission);
            if (permission === 'granted') {
                // Get existing service worker registration (from VitePWA)
                const registration = await navigator.serviceWorker.ready;

                // Check if pushManager is available (requires HTTPS)
                if (!registration.pushManager) {
                    console.log('Push notifications require HTTPS. Skipping token registration.');
                    return;
                }

                // Get Token using the existing service worker
                const currentToken = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration: registration
                });

                if (currentToken) {
                    setToken(currentToken);
                    // Save token to Supabase
                    if (user) {
                        const { error } = await supabase
                            .from('users')
                            .update({ fcm_token: currentToken })
                            .eq('id', user.id);

                        if (error) console.error('Error saving FCM token:', error);
                    }
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            }
        } catch (error) {
            console.error('An error occurred while retrieving token. ', error);
        }
    };

    useEffect(() => {
        if (!user) return;

        // Skip everything if Notification API is not available (iOS Safari)
        if (!isNotificationSupported) return;

        // Try to recover token if already granted. If default, wait for user.
        if (Notification.permission === 'granted') {
            requestPermission();
        }

        // Handle foreground messages
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
            setNotification(payload);
            if (isNotificationSupported) {
                new Notification(payload.notification?.title || 'New Message', {
                    body: payload.notification?.body,
                    icon: '/logo.png'
                });
            }
        });

        return () => unsubscribe();
    }, [user]);

    return { token, notification, permissionStatus, requestPermission };
};
