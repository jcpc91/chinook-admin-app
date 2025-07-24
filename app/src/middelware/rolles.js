const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "ADMINISTRADOR") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: requires admin role" });
  }
};

module.exports = { isAdmin };
