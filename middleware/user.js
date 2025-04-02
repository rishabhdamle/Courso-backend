const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");
function userAuth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    res.status(404).json({ Error: `Token is missing` });
    return;
  }
  try {
    const decodedData = jwt.verify(token, JWT_USER_PASSWORD);
    req.userId = decodedData.userId;
    console.log(decodedData);

    next();
  } catch (error) {
    res.json({ message: "Invalid token!" });
  }
}

module.exports = {
  userAuth,
};
