const Integration = require("../models/Integration");

const authenticateUser = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
      return res.status(401).json({ message: "Access token missing" });
    }

    const integration = await Integration.findOne({
      accessToken: accessToken.replace("Bearer ", ""),
    });

    if (!integration) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    req.user = integration;
    next();
  } catch (error) {
    console.error("Error in authentication middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = authenticateUser;
