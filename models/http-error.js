class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); //Add a message property
    this.code = errorCode; //this add an 'error' code
  }
}

module.exports = HttpError;
