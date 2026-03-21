import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

let firebaseInitialized = false;
let initError = null;

function initFirebase(env) {
    if (firebaseInitialized) return;
    try {
        const key = env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!key) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing');

        const serviceAccount = JSON.parse(key || '{}');
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        firebaseInitialized = true;
    } catch (error) {
        console.error('Firebase Admin Init Error:', error);
        initError = error.message;
    }
}

export async function onRequestPost(context) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    };

    initFirebase(context.env);

    if (initError) {
        return new Response(JSON.stringify({ error: 'Firebase Init Failed: ' + initError }), { status: 500, headers: corsHeaders });
    }
    if (!admin.apps.length) {
        return new Response(JSON.stringify({ error: 'Firebase Admin not initialized (Unknown reason)' }), { status: 500, headers: corsHeaders });
    }

    try {
        const { userId, title, body } = await context.request.json();

        if (!userId || !title || !body) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: corsHeaders });
        }

        const supabaseUrl = context.env.VITE_SUPABASE_URL;
        const supabaseKey = context.env.SUPABASE_SERVICE_ROLE_KEY || context.env.VITE_SUPABASE_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // --- BROADCAST LOGIC ---
        if (userId === 'ALL') {
            const { data: users, error } = await supabase
                .from('users')
                .select('fcm_token')
                .not('fcm_token', 'is', null);

            if (error) throw error;

            const tokens = users.map(u => u.fcm_token).filter(t => t && t.length > 10);

            if (tokens.length === 0) {
                return new Response(JSON.stringify({ message: 'No registered devices found.' }), { status: 200, headers: corsHeaders });
            }

            const messages = tokens.map(token => ({
                notification: { title, body },
                token
            }));

            if (messages.length > 0) {
                const batchResponse = await admin.messaging().sendEach(messages);
                return new Response(JSON.stringify({
                    success: true,
                    successCount: batchResponse.successCount,
                    failureCount: batchResponse.failureCount
                }), { status: 200, headers: corsHeaders });
            } else {
                return new Response(JSON.stringify({ message: 'No valid tokens found.' }), { status: 200, headers: corsHeaders });
            }
        }
        // -----------------------

        const { data: user, error } = await supabase
            .from('users')
            .select('fcm_token')
            .eq('id', userId)
            .single();

        if (error || !user || !user.fcm_token) {
            console.log('User has no token or error', error);
            return new Response(JSON.stringify({ message: 'User skipped (no token)' }), { status: 200, headers: corsHeaders });
        }

        const message = {
            notification: { title, body },
            token: user.fcm_token
        };

        const result = await admin.messaging().send(message);
        return new Response(JSON.stringify({ success: true, messageId: result }), { status: 200, headers: corsHeaders });

    } catch (error) {
        console.error('Push Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
