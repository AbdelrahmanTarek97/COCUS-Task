module.exports.infoLogger = (log) => {
  if (process.env.NODE_ENV != "test") {
    console.log(log);
  }
};

module.exports.errorLogger = (log) => {
  if (process.env.NODE_ENV != "test") {
    console.error(log);
  }
};
