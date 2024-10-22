const mongoose = require("mongoose");

const repositorySchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  repoId: String,
  name: String,
  url: String,
  owner: String,
  githubId: String,
  include: { type: Boolean, default: false },
  commits: { type: Number, default: 0 },
  issues: { type: Number, default: 0 },
  pullRequests: { type: Number, default: 0 },
});

const Repository = mongoose.model("Repository", repositorySchema);
module.exports = Repository;
