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
    req.user = {
      uid: payload.sub, email: payload.email, name: payload.name,
      isAnonymous: payload.firebase?.sign_in_provider === 'anonymous',
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid auth token' });
  }
}

// Verifies the token if one is present, but never rejects — lets a route
// serve both guests and signed-in users while still attributing feedback
// to a real account when possible.
export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  try {
    const { payload } = await jwtVerify(header.split('Bearer ')[1], JWKS, {
      issuer:   `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    req.user = { uid: payload.sub, email: payload.email, name: payload.name };
  } catch {
    req.user = null;
  }
  next();
}

export const ADMIN_EMAIL = 'ethansun2018@gmail.com';
