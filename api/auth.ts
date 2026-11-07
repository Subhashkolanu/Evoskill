import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { Request, Response, NextFunction } from 'express';

// Resolve project ID from environment or applet config
const projectId = process.env.FIREBASE_PROJECT_ID || 
                  process.env.GOOGLE_CLOUD_PROJECT || 
                  process.env.GCLOUD_PROJECT || 
                  'gen-lang-client-0111443137';

// Initialize Firebase Admin SDK safely (singleton)
if (getApps().length === 0) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({
        credential: cert(serviceAccount),
        projectId
      });
      console.log(`[Firebase Admin] Initialized with Service Account for project: ${projectId}`);
    } else {
      initializeApp({ projectId });
      console.log(`[Firebase Admin] Initialized with Project ID: ${projectId}`);
    }
  } catch (initErr) {
    console.error("[Firebase Admin] Initialization error:", initErr);
    // Fallback initialize to avoid crash
    if (getApps().length === 0) {
      initializeApp({ projectId });
    }
  }
}

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Reusable Express middleware to verify Firebase ID tokens.
 * Rejects unauthenticated requests with 401 Unauthorized.
 * Attaches verified user payload to req.user.
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Missing or invalid Authorization header. A valid Bearer token is required.'
    });
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();
  if (!idToken) {
    return res.status(401).json({
      error: 'Unauthorized: Empty authentication token provided.'
    });
  }

  // Development & automated test support: allow demo tokens strictly in non-production
  if (process.env.NODE_ENV !== 'production' && idToken.startsWith('demo-token-')) {
    const demoUid = idToken.replace('demo-token-', '') || 'demo-user-123';
    req.user = {
      uid: demoUid,
      email: `${demoUid}@demo.evoskill.ai`,
      name: 'Verified Demo User'
    };
    return next();
  }

  // Strict production safeguard: immediately reject any demo-token format
  if (idToken.startsWith('demo-token-')) {
    return res.status(401).json({
      error: 'Unauthorized: Demo tokens are strictly forbidden in production.'
    });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Attach strictly validated user
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      emailVerified: decodedToken.email_verified
    };

    next();
  } catch (error: any) {
    // Sanitized error responses without leaking internal stack traces or secrets
    if (error?.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Unauthorized: Authentication token has expired. Please refresh your session.'
      });
    }

    if (error?.code === 'auth/argument-error' || error?.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        error: 'Unauthorized: Invalid authentication token signature.'
      });
    }

    return res.status(401).json({
      error: 'Unauthorized: Token verification failed.'
    });
  }
}
