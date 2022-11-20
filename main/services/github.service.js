const githubApi = require("./github-api.service");
const errors = require("../resources/errors.json");
const errorsService = require("./api-error.service");

module.exports.getUserRepositories = async (req, res) => {
  try {
    let repositories = await githubApi.getUserRepositoriesWithBranchesData(
      req.params.username,
      req.query.page,
      req.query.reposPerPage,
      req.query.branchesPerRepo
    );
    return res.send({
      pagination: {
        page: req.query.page,
        repositoriesCount: repositories.length,
        maxBranchesShownPerRepository: req.query.branchesPerRepo,
      },
      username: req.params.username,
      repositories,
    });
  } catch (error) {
    let returnedErrorObject = {};
    switch (`${error.status}`) {
      case "403":
        returnedErrorObject = errors.EXCEEDED_RATE_LIMIT;
        break;
      case "404":
        returnedErrorObject = errors.USER_NOT_FOUND;
        break;
      default:
        console.log(error);
        returnedErrorObject = errors.INTERNAL_SERVER_ERROR;
    }
    return errorsService.returnError(res, returnedErrorObject);
  }
};
