const express = require("express");

const {
  getAllOrganizations,
  getAllOrgRepos,
  getAllOrganizationsRepo,
  getRepoDetails,
} = require("../controllers/githubController");
const router = express.Router();


router.get("/organizations", getAllOrganizations);
router.get("/organizations/:org/repos", getAllOrgRepos);
router.get("/organizations/repos", getAllOrganizationsRepo);
router.get("/repos/:owner/:repo/details", getRepoDetails);

module.exports = router;
