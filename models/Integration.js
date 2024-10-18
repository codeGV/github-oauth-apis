const mongoose = require("mongoose");

const integrationSchema = new mongoose.Schema({
  githubId: String,
  username: String,
  type: String,
  url: String,
  site_admin: String,
  avatar_url: String,
  accessToken: String,
  connectedAt: Date,
});

const Integration = mongoose.model("github-integration", integrationSchema);
module.exports = Integration;
