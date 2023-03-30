const logger = require('./logger.js');

const setAndLogError = (statusCode, errorMessage, response) => {
    logger.error(`${statusCode}: ${errorMessage}`);
    response.status(statusCode).json({
        message: errorMessage
    });
    return response
}

module.exports = {
    setAndLogError
}