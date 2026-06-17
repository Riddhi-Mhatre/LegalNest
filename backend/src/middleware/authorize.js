export const authorize =
  (...roles) =>
  (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_002',
          message: 'Access denied',
        },
      });
    }

    next();
  };
