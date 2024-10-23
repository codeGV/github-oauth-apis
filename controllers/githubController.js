const axios = require("axios");
const { saveOrganizations, saveRepositories } = require("../helpers/helper");
const Repository = require("../models/Repository");

exports.getAllOrganizationsRepo = async (accessToken, githubId) => {
  try {
    const orgsResponse = await axios.get("https://api.github.com/user/orgs", {
      headers: { Authorization: accessToken },
    });
    const organizations = orgsResponse.data;
    const savedOrganizations = await saveOrganizations(organizations, githubId);
    const repoPromises = savedOrganizations.map(async (org) => {
      const reposResponse = await axios.get(
        `https://api.github.com/orgs/${org.name}/repos`,
        {
          headers: { Authorization: accessToken },
        }
      );
      const repos = reposResponse.data;
      return await saveRepositories(repos, org._id, githubId);
    });
    return await Promise.all(repoPromises);
  } catch (error) {
    console.error("Error fetching organizations or repos:", error);
  }
};
exports.getAllReposWithPagination = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const accessToken = req.headers.authorization;
    const repositories = await Repository.find({
      githubId: req.user.githubId,
    })
      .skip(skip)
      .limit(limit)
      .populate("orgId", "name url")
      .exec();

    const totalCount = await Repository.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);
    const repoDetailsPromises = repositories.map(async (repo) => {
      if (repo.include) {
        const details = await getRepoDetails(repo, accessToken);
        return { ...repo.toObject(), ...details };
      }
      return repo;
    });
    const detailedRepositories = await Promise.all(repoDetailsPromises);

    res.json({
      repositories: detailedRepositories,
      totalPages,
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching repositories with pagination:", error);
    res.status(500).json({ message: "Error fetching repositories", error });
  }
};

const getRepoDetails = async (repo, accessToken) => {
  try {
    const [commitsResponse, issuesResponse, pullsResponse] =
      await Promise.allSettled([
        axios.get(
          `https://api.github.com/repos/${repo.owner}/${repo.name}/commits`,
          {
            headers: { Authorization: accessToken },
          }
        ),
        axios.get(
          `https://api.github.com/repos/${repo.owner}/${repo.name}/issues`,
          {
            headers: { Authorization: accessToken },
          }
        ),
        axios.get(
          `https://api.github.com/repos/${repo.owner}/${repo.name}/pulls`,
          {
            headers: { Authorization: accessToken },
          }
        ),
      ]);

    return {
      commits:
        commitsResponse.status === "fulfilled"
          ? commitsResponse.value.data.length
          : 0,
      issues:
        issuesResponse.status === "fulfilled"
          ? issuesResponse.value.data.length
          : 0,
      pullRequests:
        pullsResponse.status === "fulfilled"
          ? pullsResponse.value.data.length
          : 0,
    };
  } catch (error) {
    console.error("Error fetching repo details:", error);
    return { commits: 0, issues: 0, pullRequests: 0 };
  }
};

exports.toggleRepoInclude = async (req, res) => {
  const { repoId, include } = req.body;
  const accessToken = req.headers.authorization;

  try {
    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }
    repo.include = include;
    await repo.save();
    if (include) {
      const details = await getRepoDetails(repo, accessToken);
      repo.commits = details.commits;
      repo.issues = details.issues;
      repo.pullRequests = details.pullRequests;
    }

    res.json(repo);
  } catch (error) {
    console.error("Error updating repository include status:", error);
    res
      .status(500)
      .json({ message: "Error updating repository include status", error });
  }
};
