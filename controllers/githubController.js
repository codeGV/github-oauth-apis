const axios = require("axios");

// Fetch GitHub organizations
exports.getAllOrganizations = async (req, res) => {
  try {
    const accessToken = req.headers.authorization;
    const response = await axios.get("https://api.github.com/user/orgs", {
      headers: { Authorization: `${accessToken}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching organizations", error });
  }
};

// Fetch repositories for an organization
exports.getAllOrgRepos = async (req, res) => {
  const org = req.params.org;
  try {
    const accessToken = req.headers.authorization;
    const response = await axios.get(
      `https://api.github.com/orgs/${org}/repos`,
      {
        headers: { Authorization: `${accessToken}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching repos for organization ${org}`, error });
  }
};

exports.getAllOrganizationsRepo = async (req, res) => {
  try {
    const accessToken = req.headers.authorization;
    if (!accessToken) {
      return res.status(401).json({ message: "Access token missing" });
    }
    const orgsResponse = await axios.get("https://api.github.com/user/orgs", {
      headers: { Authorization: `${accessToken}` },
    });
    const organizations = orgsResponse.data;
    const repoPromises = organizations.map((org) => {
      return axios.get(`https://api.github.com/orgs/${org.login}/repos`, {
        headers: { Authorization: `${accessToken}` },
      });
    });
    const reposResponses = await Promise.allSettled(repoPromises);
    const allRepos = reposResponses
      .filter((e) => e.status == "fulfilled")
      .flatMap((response) => response.value.data);
    res.json(allRepos);
  } catch (error) {
    console.error("Error fetching organizations or repos:", error);
    res.status(500).json({ message: "Error fetching organizations or repos",error });
  }
};

// Fetch commits, issues, and pull requests for a repo
exports.getRepoDetails = async (req, res) => {
  const { owner, repo } = req.params;
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    return res.status(401).json({ message: "Access token missing" });
  }
  try {
    const reposResponses = await Promise.allSettled([
      axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
        headers: { Authorization: `${accessToken}` },
      }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        headers: { Authorization: `${accessToken}` },
      }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        headers: { Authorization: `${accessToken}` },
      }),
    ]);

    const allData = reposResponses
      .filter((e) => e.status == "fulfilled")
      .map((response) => response.value.data);

    res.json({
      commits: allData[0].length,
      issues: allData[1].length,
      pullRequests: allData[2].length,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching repo details", error });
  }
};
