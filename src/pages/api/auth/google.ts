import type { APIRoute } from 'astro';
import sql from '../../../utils/db';
import { OAuth2Client } from 'google-auth-library';

// Use GOOGLE_CLIENT_ID (server-only) with PUBLIC_ as fallback
const GOOGLE_CLIENT_ID =
  import.meta.env.GOOGLE_CLIENT_ID ||
  import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const POST: APIRoute = async (context) => {
  const { request, cookies } = context;
  try {
    // Guard: fail fast if Client ID is not configured on the server
    if (!GOOGLE_CLIENT_ID) {
      console.error('Google Login error: GOOGLE_CLIENT_ID (or PUBLIC_GOOGLE_CLIENT_ID) is not set in .env');
      return new Response(
        JSON.stringify({ message: 'Server misconfiguration: Google Client ID missing.' }),
        { status: 500 }
      );
    }

    const { token } = await request.json();

    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No token provided' }),
        { status: 400 }
      );
    }

    // Verify Google ID Token using google-auth-library
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return new Response(
        JSON.stringify({ message: 'Invalid Google token payload' }),
        { status: 400 }
      );
    }

    const email = payload.email;
    const name = payload.name ?? email;
    const googleId = payload.sub;
    const picture = payload.picture ?? null;

    // Check if a user with this email already exists
    const existing = await sql`
      SELECT id, email, full_name as "fullName", office
      FROM user_accounts
      WHERE email = ${email}
    `;

    let user: { id: number; email: string; fullName: string; office: string };

    if (existing.length > 0) {
      // User exists – update their google_id and picture if not already set
      await sql`
        UPDATE user_accounts
        SET
          google_id = COALESCE(NULLIF(google_id, ''), ${googleId}),
          picture   = COALESCE(picture, ${picture})
        WHERE email = ${email}
      `;
      user = existing[0] as typeof user;
    } else {
      // New user – insert with NULL password (Google-auth only account)
      const result = await sql`
        INSERT INTO user_accounts (email, full_name, office, google_id, picture, password)
        VALUES (${email}, ${name}, ${'(via Google)'}, ${googleId}, ${picture}, NULL)
        RETURNING id, email, full_name as "fullName", office
      `;
      user = result[0] as typeof user;
    }

    // Set session cookie (same format as email/password login)
    cookies.set('session', `user:${user.id}`, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return new Response(
      JSON.stringify({ message: 'Google login successful', user }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Google auth error:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to verify Google Token' }),
      { status: 500 }
    );
  }
};
