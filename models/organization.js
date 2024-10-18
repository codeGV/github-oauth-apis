const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema({
  githubId: String,
  name: String,
  slug: String,
  include: Boolean,
  id: String,
  connectedAt: Date,
});

const Organization = mongoose.model("github-Organization", OrganizationSchema);
module.exports = Organization;
