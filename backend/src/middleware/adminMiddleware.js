/**
 * Admin authorization middleware
 * Ensures the authenticated user has 'admin' role in their profile
 */
export const requireAdmin = (req, res, next) => {
  if (!req.profile || req.profile.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
};
