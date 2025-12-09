import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../services/firebase';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export const usePushNotifications = () => {
    const { user } = useAuth();
    const [token, setToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<any>(null);

    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(Notification.permission);

    const requestPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            setPermissionStatus(permission);
            if (permission === 'granted') {
                // Get Token
                const currentToken = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
                });

                if (currentToken) {
                    setToken(currentToken);
                    // Save token to Supabase
                    const { error } = await supabase
                        .from('users')
                        .update({ fcm_token: currentToken })
                        .eq('id', user.id);

                    if (error) console.error('Error saving FCM token:', error);
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

        // Auto request on load? maybe not, le'ts respect user choice if they denied or default.
        // Actually, existing logic auto-called it. Let's keep auto-call pattern but also providing manual trigger.
        // But for "banner" logic, we might want to NOT auto-call effectively if we want them to click the banner? 
        // The previous code called `requestPermission()` immediately.
        // If we want a Banner saying "Turn on", we should probably check status first. 
        // If 'default', we can show banner. If 'denied', we show banner with "Go to settings".
        // If 'granted', no banner.

        // Let's keep the auto-init attempt for now, but if it remains 'default' (browser blocked auto-prompt?), 
        // or if we want to rely on user interaction.
        // Actually, browsers block `Notification.requestPermission()` if not triggered by user gesture often.
        // So the previous `useEffect` call might fail in strict environments. 
        // Let's REMOVE the auto-call inside useEffect and rely on the UI Banner for the "first time" or "opt-in" experience?
        // OR keep it for now to not break existing flow, but expose the function for the Banner to retry.

        // Compomise: Try to recover token if already granted. If default, wait for user.
        if (Notification.permission === 'granted') {
            requestPermission();
        }

        // Handle foreground messages
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
            setNotification(payload);
            new Notification(payload.notification?.title || 'New Message', {
                body: payload.notification?.body,
                icon: '/logo.png'
            });
        });

        return () => unsubscribe();
    }, [user]);

    return { token, notification, permissionStatus, requestPermission };
};
