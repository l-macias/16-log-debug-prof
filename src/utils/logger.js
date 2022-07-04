const winston = require("winston");

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: "logs/warn.log",
            level: "warn",
        }),
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
        }),
        new winston.transports.Console({ level: "info" }),
    ],
});

module.exports = logger;
