// Standard middleware for parsing JSON requests
const bodyParser = require("body-parser");
// Standard library for enabling CORS
const cors = require("cors");
const errors = require("../resources/errors.json");
const errorsService = require("./api-error.service");
const config = require("../resources/config.json");
// Add Swagger
const swaggerUI = require("swagger-ui-express");
const swaggerDocs = require("../resources/swagger-docs.json");
// Logging service
const logger = require("./logger.service");

module.exports.addPresetMiddlewaresToExpressApp = (app) => {
  // Add logging
  app.use((req, res, next) => {
    logger.infoLogger(`EndpointCalled: ${req.method} ${req.url}`);
    next();
  });
  // Add Body Parser
  app.use(bodyParser.json());
  // Enable CORS
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET"],
    })
  );
  app.use("/swagger-ui", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
};

module.exports.validateGithubRepositoriesRequest = (req, res, next) => {
  if (req.headers["accept"] !== "application/json") {
    return errorsService.returnError(res, errors.ACCEPT_HEADER_ERROR);
  }
  if (!req.query.page || req.query.page < 0) req.query.page = 1;
  if (!req.query.reposPerPage || req.query.reposPerPage < 0)
    req.query.reposPerPage = config.REPOSITORIES_PER_PAGE_DEFAULT;
  if (!req.query.branchesPerRepo || req.query.branchesPerRepo < 0)
    req.query.branchesPerRepo = config.BRANCHES_PER_REPOSITORY_DEFAULT;

  return next();
};
