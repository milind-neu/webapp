const logger = require('./logger.js');

const setAndLogError = (statusCode, errorMessage, response) => {
    logger.error(`${statusCode}: ${errorMessage}`);
    response.status(statusCode);
    response.json(errorMessage);
    return response
}

module.exports = {
    setAndLogError
}