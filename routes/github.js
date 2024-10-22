const express = require("express");

const {
  getAllReposWithPagination,
  toggleRepoInclude,
} = require("../controllers/githubController");
const authenticateUser = require("../helpers/authMiddleware");
const router = express.Router();

router.get("/organizations/repos", authenticateUser, getAllReposWithPagination);
router.post("/repos/toggleInclude", authenticateUser, toggleRepoInclude);

module.exports = router;
