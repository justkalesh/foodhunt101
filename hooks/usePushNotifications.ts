import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../services/firebase';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export const usePushNotifications = () => {
    const { user } = useAuth();
    const [token, setToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<any>(null);

    useEffect(() => {
        if (!user) return;

        const requestPermission = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    // Get Token
                    const currentToken = await getToken(messaging, {
                        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
                    });

                    if (currentToken) {
                        setToken(currentToken);
                        // Save token to Supabase
                        // Check if it's different to avoid writes? Or just upsert.
                        // We will just update the user record.
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

        requestPermission();

        // Handle foreground messages
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
            setNotification(payload);
            // Optionally show a toast here using your UI library
            // For now we just log and set state
            new Notification(payload.notification?.title || 'New Message', {
                body: payload.notification?.body,
                icon: '/logo.png'
            });
        });

        return () => unsubscribe();
    }, [user]);

    return { token, notification };
};
