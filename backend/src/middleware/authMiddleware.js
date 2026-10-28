import { supabaseAdmin, createScopedClient } from '../config/supabase.js';

/**
 * Required authentication middleware
 * Verifies Supabase JWT token and attaches user + profile to request
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing or malformed Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token.',
      });
    }

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
      });
    }

    // Fetch user profile from database to determine role and profile attributes
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Fallback if profile row is still provisioning or created via direct signup
    const userProfile = profile || {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      role: user.user_metadata?.role === 'admin' ? 'admin' : 'student',
      college: user.user_metadata?.college || '',
      department: user.user_metadata?.department || '',
      year: user.user_metadata?.year || '',
    };

    req.user = user;
    req.token = token;
    req.profile = userProfile;
    req.supabase = createScopedClient(token);

    next();
  } catch (err) {
    console.error('[Auth Middleware Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Authentication verification failed.',
    });
  }
};

/**
 * Optional authentication middleware
 * If a token is provided, attaches user/profile, otherwise continues as guest
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          req.user = user;
          req.token = token;
          req.profile = profile || {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'User',
            role: user.user_metadata?.role || 'student',
          };
          req.supabase = createScopedClient(token);
        }
      }
    }
    next();
  } catch (err) {
    // Non-blocking for optional auth
    next();
  }
};
