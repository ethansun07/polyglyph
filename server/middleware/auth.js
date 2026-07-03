import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

const FIREBASE_PROJECT_ID = 'amharic-fidel';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing auth token' });
  }
  try {
    const { payload } = await jwtVerify(header.split('Bearer ')[1], JWKS, {
      issuer:   `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    req.user = { uid: payload.sub, email: payload.email, name: payload.name };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid auth token' });
  }
}

export const ADMIN_EMAIL = 'ethansun2018@gmail.com';
