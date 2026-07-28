import type { APIRoute } from 'astro';
import sql from '../../../utils/db';

// Verify a Google ID token (JWT) using Google's public JWKS.
// We do this without a library to keep dependencies minimal.
async function verifyGoogleToken(credential: string): Promise<{
  email: string;
  name: string;
  sub: string;
  picture?: string;
} | null> {
  try {
    // Decode the JWT payload (middle segment) without verifying signature first
    // so we can get the key ID (kid) to fetch the right public key.
    const parts = credential.split('.');
    if (parts.length !== 3) return null;

    // Fetch Google's public keys
    const certsRes = await fetch('https://www.googleapis.com/oauth2/v3/certs');
    if (!certsRes.ok) return null;
    const certs = await certsRes.json() as { keys: JsonWebKey[] };

    // Decode the header to get the key id
    const headerJson = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const kid: string = headerJson.kid;

    // Find the matching key
    const jwk = certs.keys.find((k: any) => k.kid === kid);
    if (!jwk) return null;

    // Import the public key
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Verify the signature
    const encoder = new TextEncoder();
    const signingInput = encoder.encode(`${parts[0]}.${parts[1]}`);
    const signatureBytes = Uint8Array.from(
      atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0)
    );

    const isValid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      signatureBytes,
      signingInput
    );

    if (!isValid) return null;

    // Decode the payload
    const payloadJson = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    // Validate standard claims
    const clientId = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;
    const now = Math.floor(Date.now() / 1000);

    if (payloadJson.aud !== clientId) return null;
    if (payloadJson.iss !== 'accounts.google.com' && payloadJson.iss !== 'https://accounts.google.com') return null;
    if (payloadJson.exp < now) return null;

    return {
      email: payloadJson.email,
      name: payloadJson.name ?? payloadJson.email,
      sub: payloadJson.sub,
      picture: payloadJson.picture,
    };
  } catch (err) {
    console.error('Google token verification error:', err);
    return null;
  }
}

export const POST: APIRoute = async (context) => {
  const { request, cookies } = context;
  try {
    const { credential } = await request.json();

    if (!credential) {
      return new Response(
        JSON.stringify({ message: 'Google credential is required' }),
        { status: 400 }
      );
    }

    // Verify the Google ID token
    const googleUser = await verifyGoogleToken(credential);
    if (!googleUser) {
      return new Response(
        JSON.stringify({ message: 'Invalid or expired Google token' }),
        { status: 401 }
      );
    }

    const { email, name, sub: googleId } = googleUser;

    // Check if a user with this email already exists
    const existing = await sql`
      SELECT id, email, full_name as "fullName", office
      FROM user_accounts
      WHERE email = ${email}
    `;

    let user: { id: number; email: string; fullName: string; office: string };

    if (existing.length > 0) {
      // User exists – update their google_id if not already set
      await sql`
        UPDATE user_accounts
        SET google_id = ${googleId}
        WHERE email = ${email} AND (google_id IS NULL OR google_id = '')
      `;
      user = existing[0] as typeof user;
    } else {
      // New user – insert with NULL password (Google-auth only account)
      const result = await sql`
        INSERT INTO user_accounts (email, full_name, office, google_id, password)
        VALUES (${email}, ${name}, ${'(via Google)'}, ${googleId}, NULL)
        RETURNING id, email, full_name as "fullName", office
      `;
      user = result[0] as typeof user;
    }

    // Set the same session cookie format as email/password login
    cookies.set('session', `user:${user.id}`, {
      path: '/',
      secure: import.meta.env.PROD,
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return new Response(
      JSON.stringify({ message: 'Google login successful', user }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Google auth error:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500 }
    );
  }
};
