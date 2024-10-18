const Integration = require("../models/Integration");
const axios = require("axios");

const storeAuthDetails = async (profile, accessToken) => {
  const existingIntegration = await Integration.findOne({
    githubId: profile.id,
  });
  if (!existingIntegration) {
    const newIntegration = new Integration({
      githubId: profile.id,
      username: profile.login,
      avatar_url: profile.avatar_url,
      type: profile.type,
      url: profile.url,
      site_admin: profile.site_admin,
      accessToken,
      connectedAt: new Date(),
    });
    await newIntegration.save();
  }
};

exports.removeIntegration = async (req, res) => {
  await Integration.deleteOne({ githubId: req.body.githubId });
  res.json({ message: "Integration removed" });
};

exports.getIntegrationByGitHubId = async (req, res) => {
  try {
    const { githubId } = req.params;
    const integration = await Integration.findOne({ githubId });

    if (!integration) {
      return res
        .status(404)
        .json({ message: "No integration found for this GitHub ID" });
    }
    res.json(integration);
  } catch (error) {
    console.error("Error fetching integration:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching integration" });
  }
};

exports.githubAuth = (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize`;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    "http://localhost:3000/auth/github/callback"
  );
  const scope = "read:org user email repo";
  res.redirect(
    `${githubAuthUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`
  );
};

exports.githubCallback = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("No code provided");
  }

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (accessToken) {
      const userResponse = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const userProfile = userResponse.data;
      await storeAuthDetails(userProfile, accessToken);
      res.redirect(`http://localhost:4200/integration?id=${userProfile.id}`);
    } else {
      res.status(400).send("Failed to exchange code for access token");
    }
  } catch (error) {
    console.error("Error during GitHub OAuth callback:", error);
    res.status(500).send("An error occurred during authentication");
  }
};
