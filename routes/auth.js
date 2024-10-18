const express = require("express");

const {
  removeIntegration,
  githubAuth,
  githubCallback,
  getIntegrationByGitHubId,
} = require("../controllers/authController");
const router = express.Router();

router.get("/github", githubAuth);
router.get("/github/callback", githubCallback);

router.post("/integration/remove", removeIntegration);
router.get("/integration/:githubId", getIntegrationByGitHubId);

module.exports = router;
