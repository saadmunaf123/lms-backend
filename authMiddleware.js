const jwt = require("jsonwebtoken");
const Provider = require("./models/Provider");
const Admin = require("./models/Admin");

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await Provider.findById(decoded.id);

    console.log("TOKEN VERIFIED:", decoded);
    

    if (user) {
      req.user = user;
      req.userRole = "provider";
      return next();
    }

    user = await Admin.findById(decoded.id);

    if (user) {
      req.user = user;
      req.userRole = "admin";
      return next();
    }

    return res.status(401).json({
      error: "User not found",
    });

  } catch (err) {
    console.log("JWT VERIFY ERROR:", err.message);

    return res.status(401).json({
      error: err.message,
    });
  }
};