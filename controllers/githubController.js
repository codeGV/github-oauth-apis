const axios = require("axios");
const Organization = require("../models/organization")
const Repo = require('../models/orgRepo');
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

// exports.getAllOrganizationsRepo = async (req, res) => {
//   try {
//     const accessToken = req.headers.authorization;
//     if (!accessToken) {
//       return res.status(401).json({ message: "Access token missing" });
//     }
//     const orgsResponse = await axios.get("https://api.github.com/user/orgs", {
//       headers: { Authorization: `${accessToken}` },
//     });
//     const organizations = orgsResponse.data;



//     const repoPromises = organizations.map((org) => {
//       return axios.get(`https://api.github.com/orgs/${org.login}/repos`, {
//         headers: { Authorization: `${accessToken}` },
//       });
//     });
//     const reposResponses = await Promise.allSettled(repoPromises);
//     const allRepos = reposResponses
//       .filter((e) => e.status == "fulfilled")
//       .flatMap((response) => response.value.data);
//     res.json(allRepos);
//   } catch (error) {
//     console.error("Error fetching organizations or repos:", error);
//     res.status(500).json({ message: "Error fetching organizations or repos",error });
//   }
// };

// Fetch commits, issues, and pull requests for a repo
exports.getAllOrganizationsRepo = async (req, res) => {
  try {
    const accessToken = req.headers.authorization;
    if (!accessToken) {
      return res.status(401).json({ message: "Access token missing" });
    }

    // Fetch organizations from GitHub
    const orgsResponse = await axios.get("https://api.github.com/user/orgs", {
      headers: { Authorization: `${accessToken}` },
    });

    const organizations = orgsResponse.data;

    // Save organizations to MongoDB
    const saveOrganizationsPromises = organizations.map(async (org) => {
      const savedOrg = await Organization.findOneAndUpdate(
        { githubId: org.id },
        {
          githubId: org.id,
          name: org.login,
          slug: org.url,
          include: false,
          connectedAt: new Date(),
        },
        { upsert: true, new: true } // Upsert ensures new org is created if not found
      );
      return savedOrg;
    });

    const savedOrganizations = await Promise.all(saveOrganizationsPromises);

    // Fetch repos for each organization
    const repoPromises = organizations.map((org) => {
      return axios.get(`https://api.github.com/orgs/${org.login}/repos`, {
        headers: { Authorization: `${accessToken}` },
      });
    });

    const reposResponses = await Promise.allSettled(repoPromises);
    const allRepos = reposResponses
      .filter((e) => e.status === "fulfilled")
      .flatMap((response) => response.value.data);

    // Save repos to MongoDB
    const saveReposPromises = allRepos.map(async (repo) => {
      const org = savedOrganizations.find((org) => org.githubId === repo.owner.id);

      return Repo.findOneAndUpdate(
        { githubId: repo.id },
        {
          githubId: repo.id,
          name: repo.name,
          slug: repo.url,
          include: false,
          connectedAt: new Date(),
          nodeId: repo.node_id,
          fullName: repo.full_name,
          private: repo.private,
          owner: org._id,
          htmlUrl: repo.html_url,
          description: repo.description,
          fork: repo.fork,
          url: repo.url,
          forksUrl: repo.forks_url,
          keysUrl: repo.keys_url,
          collaboratorsUrl: repo.collaborators_url,
          teamsUrl: repo.teams_url,
          hooksUrl: repo.hooks_url,
          issueEventsUrl: repo.issue_events_url,
          eventsUrl: repo.events_url,
          assigneesUrl: repo.assignees_url,
          branchesUrl: repo.branches_url,
          tagsUrl: repo.tags_url,
          blobsUrl: repo.blobs_url,
          gitTagsUrl: repo.git_tags_url,
          gitRefsUrl: repo.git_refs_url,
          treesUrl: repo.trees_url,
          statusesUrl: repo.statuses_url,
          languagesUrl: repo.languages_url,
          stargazersUrl: repo.stargazers_url,
          contributorsUrl: repo.contributors_url,
          subscribersUrl: repo.subscribers_url,
          subscriptionUrl: repo.subscription_url,
          commitsUrl: repo.commits_url,
          gitCommitsUrl: repo.git_commits_url,
          commentsUrl: repo.comments_url,
          issueCommentUrl: repo.issue_comment_url,
          contentsUrl: repo.contents_url,
          compareUrl: repo.compare_url,
          mergesUrl: repo.merges_url,
          archiveUrl: repo.archive_url,
          downloadsUrl: repo.downloads_url,
          issuesUrl: repo.issues_url,
          pullsUrl: repo.pulls_url,
          milestonesUrl: repo.milestones_url,
          notificationsUrl: repo.notifications_url,
          labelsUrl: repo.labels_url,
          releasesUrl: repo.releases_url,
          deploymentsUrl: repo.deployments_url,
          updatedAt: repo.updated_at,
          pushedAt: repo.pushed_at,
          gitUrl: repo.git_url,
          sshUrl: repo.ssh_url,
          cloneUrl: repo.clone_url,
          svnUrl: repo.svn_url,
          homepage: repo.homepage,
          size: repo.size,
          stargazersCount: repo.stargazers_count,
          watchersCount: repo.watchers_count,
          language: repo.language,
          hasIssues: repo.has_issues,
          hasProjects: repo.has_projects,
          hasDownloads: repo.has_downloads,
          hasWiki: repo.has_wiki,
          hasPages: repo.has_pages,
          hasDiscussions: repo.has_discussions,
          forksCount: repo.forks_count,
          mirrorUrl: repo.mirror_url,
          archived: repo.archived,
          disabled: repo.disabled,
          openIssuesCount: repo.open_issues_count,
          license: repo.license?.name,
          allowForking: repo.allow_forking,
          isTemplate: repo.is_template,
          webCommitSignoffRequired: repo.web_commit_signoff_required,
          topics: repo.topics,
          visibility: repo.visibility,
          forks: repo.forks,
          openIssues: repo.open_issues,
          watchers: repo.watchers,
          defaultBranch: repo.default_branch,
        },
        { upsert: true, new: true }
      );
    });

    await Promise.all(saveReposPromises);

    res.json({ message: "Organizations and repos saved successfully" });
  } catch (error) {
    console.error("Error fetching organizations or repos:", error);
    res.status(500).json({ message: "Error fetching organizations or repos", error });
  }
};




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
