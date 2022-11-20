module.exports.returnError = (res, errorObject) => {
  return res.status(errorObject.status).send({
    status: errorObject.status,
    message: errorObject.message,
  });
};
