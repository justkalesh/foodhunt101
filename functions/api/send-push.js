/**
 * Cloudflare Pages Function: Push Notifications via FCM HTTP v1 API
 * 
 * Uses Web Crypto API to sign JWTs (no firebase-admin needed).
 * Compatible with Cloudflare Workers runtime.
 */

import { createClient } from '@supabase/supabase-js';

// ---------- JWT / Google Auth helpers (edge-compatible) ----------

function base64url(data) {
    if (typeof data === 'string') {
        return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    // ArrayBuffer
    const bytes = new Uint8Array(data);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem) {
    const b64 = pem
        .replace(/-----BEGIN .*-----/g, '')
        .replace(/-----END .*-----/g, '')
        .replace(/\s/g, '');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

async function createSignedJwt(serviceAccount) {
    const now = Math.floor(Date.now() / 1000);

    const header = {
        alg: 'RS256',
        typ: 'JWT',
        kid: serviceAccount.private_key_id,
    };

    const payload = {
        iss: serviceAccount.client_email,
        sub: serviceAccount.client_email,
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
    };

    const encodedHeader = base64url(JSON.stringify(header));
    const encodedPayload = base64url(JSON.stringify(payload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    // Import the private key using Web Crypto API
    const keyData = pemToArrayBuffer(serviceAccount.private_key);
    const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        keyData,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        new TextEncoder().encode(signingInput)
    );

    return `${signingInput}.${base64url(signature)}`;
}

async function getAccessToken(serviceAccount) {
    const jwt = await createSignedJwt(serviceAccount);

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const data = await response.json();
    if (!data.access_token) {
        throw new Error('Failed to get access token: ' + JSON.stringify(data));
    }
    return data.access_token;
}

async function sendFcmMessage(projectId, accessToken, token, title, body) {
    const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: {
                    notification: { title, body },
                    token,
                },
            }),
        }
    );

    const result = await response.json();
    if (!response.ok) {
        throw new Error(`FCM Error: ${JSON.stringify(result)}`);
    }
    return result;
}

// ---------- Cloudflare Pages Function ----------

export async function onRequestPost(context) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    };

    try {
        const key = context.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!key) {
            return new Response(JSON.stringify({ error: 'FIREBASE_SERVICE_ACCOUNT_KEY is missing' }), { status: 500, headers: corsHeaders });
        }

        const serviceAccount = JSON.parse(key);
        const accessToken = await getAccessToken(serviceAccount);
        const projectId = serviceAccount.project_id;

        const { userId, title, body } = await context.request.json();

        if (!userId || !title || !body) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: corsHeaders });
        }

        // Initialize Supabase
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

            let successCount = 0;
            let failureCount = 0;

            for (const token of tokens) {
                try {
                    await sendFcmMessage(projectId, accessToken, token, title, body);
                    successCount++;
                } catch {
                    failureCount++;
                }
            }

            return new Response(JSON.stringify({ success: true, successCount, failureCount }), { status: 200, headers: corsHeaders });
        }
        // -----------------------

        // Single user push
        const { data: user, error } = await supabase
            .from('users')
            .select('fcm_token')
            .eq('id', userId)
            .single();

        if (error || !user || !user.fcm_token) {
            return new Response(JSON.stringify({ message: 'User skipped (no token)' }), { status: 200, headers: corsHeaders });
        }

        const result = await sendFcmMessage(projectId, accessToken, user.fcm_token, title, body);
        return new Response(JSON.stringify({ success: true, messageId: result.name }), { status: 200, headers: corsHeaders });

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
