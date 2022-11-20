const superAgent = require("superagent");
// Add caching to prevent unnecessary calls
var defaults = { cacheWhenEmpty: false, expiration: 60 };
require("superagent-cache")(superAgent, undefined, defaults);
const { APP_NAME } = require("../resources/config.json");
const { infoLogger, errorLogger } = require("./logger.service");

// Exposed function
getUserRepositoriesWithBranchesData = async (
  username,
  page,
  reposPerPage,
  branchesPerRepo
) => {
  infoLogger(
    `Invoked=getUserRepositoriesWithBranchesData, username=${username}, reposPerPage=${reposPerPage}, branchesPerRepo=${branchesPerRepo}, status=STARTED`
  );
  let { repositories } = await getAndProcessOnePageOfRepositories(
    username,
    page,
    reposPerPage
  );
  let result = await addBranchesData(username, repositories, branchesPerRepo);
  infoLogger(
    `Invoked=getUserRepositoriesWithBranchesData, username=${username}, reposPerPage=${reposPerPage}, branchesPerRepo=${branchesPerRepo}, status=DONE`
  );
  return result;
};

getAndProcessOnePageOfRepositories = async (username, page, reposPerPage) => {
  infoLogger(
    `Invoked=getAndProcessOnePageOfRepositories, username=${username}, page=${page}, reposPerPage=${reposPerPage}, status=STARTED`
  );
  const repositories = [];
  const { body } = await callGetUserReposPage(username, page, reposPerPage);
  try {
    body.map((repository) => {
      if (!repository.fork)
        repositories.push({
          name: repository.name,
        });
    });
  } catch (error) {
    infoLogger.error(
      `Process=getAndProcessOnePageOfRepositories, username=${username}, page=${page}, reposPerPage=${reposPerPage}, status=ERROR, message=${error.message}`
    );
    throw error;
  }
  infoLogger(
    `Invoked=getAndProcessOnePageOfRepositories, username=${username}, page=${page}, reposPerPage=${reposPerPage}, status=DONE`
  );
  return { page, count: repositories.length, repositories };
};

// Helper functions start here
addBranchesData = async (username, repositories, branchesPerRepo) => {
  infoLogger(
    `Invoked=addBranchesData, username=${username}, branchesPerRepo=${branchesPerRepo}, repositories=${repositories.map(
      (repository) => repository.name
    )}, status=STARTED`
  );
  let repositoriesWithBranchesData = Promise.all(
    repositories.map(async (repository) => {
      let branches = await getRepositoryBranchesData(
        username,
        repository.name,
        branchesPerRepo
      );
      return { ...repository, branches };
    })
  );
  infoLogger(
    `Invoked=addBranchesData, username=${username}, branchesPerRepo=${branchesPerRepo}, repositories=${repositories.map(
      (repository) => repository.name
    )}, status=DONE`
  );
  return repositoriesWithBranchesData;
};

getRepositoryBranchesData = async (username, repository, branchesPerRepo) => {
  infoLogger(
    `Invoked=getRepositoryBranchesData, username=${username}, repository=${repository}, branchesPerRepo=${branchesPerRepo}, status=STARTED`
  );
  const result = await getAndProcessOnePageOfBranches(
    username,
    repository,
    1,
    branchesPerRepo
  );
  infoLogger(
    `Invoked=getRepositoryBranchesData, username=${username}, repository=${repository}, branchesPerRepo=${branchesPerRepo}, status=DONE`
  );
  return result.branches;
};

getAndProcessOnePageOfBranches = async (
  username,
  repository,
  page,
  branchesPerRepo
) => {
  infoLogger(
    `Invoked=getAndProcessOnePageOfBranches, username=${username}, repository=${repository}, page=${page}, branchesPerRepo=${branchesPerRepo}, status=STARTED`
  );
  const branches = [];
  const { body } = await callGetRepoBranchesPage(
    username,
    repository,
    page,
    branchesPerRepo
  );
  try {
    body.map((branch) => {
      branches.push({
        name: branch.name,
        lastCommitSha: branch.commit.sha,
      });
    });
  } catch (error) {
    infoLogger.error(
      `Process=getAndProcessOnePageOfBranches, username=${username}, repository=${repository}, page=${page}, branchesPerRepo=${branchesPerRepo}, status=ERROR, message=${error.message}`
    );
    throw error;
  }
  infoLogger(
    `Invoked=getAndProcessOnePageOfBranches, username=${username}, repository=${repository}, page=${page}, branchesPerRepo=${branchesPerRepo}, status=DONE`
  );
  return { count: branches.length, branches };
};

callGetUserReposPage = async (username, page, reposPerPage) => {
  infoLogger(
    `Invoked=callGetUserReposPage, username=${username}, page=${page}, reposPerPage=${reposPerPage}, status=STARTED`
  );
  let url = `https://api.github.com/users/${username}/repos?page=${page}&per_page=${reposPerPage}`;
  let response = await makeGithubApiCall(url);
  infoLogger(
    `Invoked=callGetUserReposPage, username=${username}, page=${page}, reposPerPage=${reposPerPage} status=DONE`
  );
  return response;
};

callGetRepoBranchesPage = async (
  username,
  repository,
  page,
  branchesPerRepo
) => {
  infoLogger(
    `Invoked=callGetRepoBranchesPage, username=${username}, repository=${repository}, page=${page}, branchesPerRepo=${branchesPerRepo}, status=STARTED`
  );
  let url = `https://api.github.com/repos/${username}/${repository}/branches?page=${page}&per_page=${branchesPerRepo}`;
  infoLogger(url);
  let response = await makeGithubApiCall(url);
  infoLogger(
    `Invoked=callGetRepoBranchesPage, username=${username}, repository=${repository}, page=${page}, branchesPerRepo=${branchesPerRepo}, status=DONE`
  );
  return response;
};

makeGithubApiCall = async (url) => {
  try {
    infoLogger(`Invoked=makeGithubCall, url=${url}, status=STARTED`);
    let response = await superAgent
      .get(url)
      .set("Accept", "application/vnd.github+json")
      .set("User-Agent", APP_NAME);
    infoLogger(`Invoked=makeGithubCall, url=${url}, status=DONE`);
    return response;
  } catch (error) {
    errorLogger(
      `Process=makeGithubCall, url=${url}, status=ERROR, message=${
        error.message == "Forbidden"
          ? "Ratelimit has been exceeded."
          : error.message
      }`
    );
    throw error;
  }
};

module.exports = {
  getUserRepositoriesWithBranchesData,
  addBranchesData,
  getRepositoryBranchesData,
  getAndProcessOnePageOfRepositories,
  getAndProcessOnePageOfBranches,
  callGetUserReposPage,
  callGetRepoBranchesPage,
  makeGithubApiCall,
};
