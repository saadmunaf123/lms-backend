const jwt = require("jsonwebtoken");
const Provider = require("./models/Provider");

exports.protect = async (req, res, next) => {
  console.log("🔐 providerProtect called");

  const authHeader = req.headers.authorization;
  console.log("Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No token found");
    return res.status(401).json({ error: "Not authorized" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);

    const provider = await Provider.findById(decoded.id);
    console.log("Provider:", provider);

    if (!provider) {
      console.log("❌ Provider not found");
      return res.status(401).json({ error: "Provider not found" });
    }

    req.user = provider;
    console.log("✔ providerProtect success");
    next();
  } catch (err) {
    console.log("❌ JWT error:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};
