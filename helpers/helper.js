const Organization = require("../models/Organization");
const Repository = require("../models/Repository");

// Helper to save organizations
const saveOrganizations = async (organizations, githubId) => {
  return Promise.all(
    organizations.map(async (org) => {
      return await Organization.findOneAndUpdate(
        { orgId: org.id },
        {
          githubId,
          name: org.login,
          url: org.url,
        },
        { upsert: true, new: true }
      );
    })
  );
};

// Helper to save repositories for each organization
const saveRepositories = async (repos, orgId,githubId) => {
  return Promise.all(
    repos.map(async (repo) => {
      return await Repository.findOneAndUpdate(
        { repoId: repo.id },
        {
          orgId,
          name: repo.name,
          url: repo.html_url,
          include: false,
          githubId: githubId,
          owner: repo.owner.login,
        },
        { upsert: true, new: true }
      );
    })
  );
};

module.exports = { saveOrganizations, saveRepositories };
