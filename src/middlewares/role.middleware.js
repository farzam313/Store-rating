export const authorizeRoles = (...rles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!role.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "You do not have permission to perform this action" });
    }
    next();
  };
};
