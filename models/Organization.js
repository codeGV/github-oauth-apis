const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  githubId: String,
  orgId: String,
  name: String, 
  url: String,
});

const Organization = mongoose.model("Organization", organizationSchema);
module.exports = Organization;
