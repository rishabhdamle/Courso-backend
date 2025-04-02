const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");
function adminAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    res.status(404).json({ Error: `Token is missing` });
    return;
  }
  try {
    const decodedData = jwt.verify(token, JWT_ADMIN_PASSWORD);
    req.adminId = decodedData.adminId;
    next();
  } catch (error) {
    res.json({ message: "Invalid token!" });
  }
}

module.exports = {
  adminAuth,
};
