// middleware/jwtMiddleware.js
const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
  console.log("inside jwt middleware");

  try {
    const token = req.headers['authorization'].split(" ")[1];

    if (token) {
      const jwtResponse = jwt.verify(token, process.env.jwt_secret);
      req.user = { _id: jwtResponse.userId }; // FIXED LINE

      next();
    } else {
      res.status(401).json("Please provide token");
    }

  } catch (err) {
    res.status(403).json("Please login");
  }
};

module.exports = jwtMiddleware;
