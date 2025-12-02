import * as log4js from "log4js";
import { logSizes, logLevels } from "./const";
import { config } from "./config";

// ---- Configure log4js ----
log4js.configure({
  appenders: {
    serverLog: {
      type: "file",
      filename: config.path.serverLog,
      maxLogSize: logSizes[config.maxLogSize.server],
      backups: config.maxBackupLogFile.server,
      keepFileExt: true,
    },
    dbLog: {
      type: "file",
      filename: config.path.dbLog,
      maxLogSize: logSizes[config.maxLogSize.db],
      backups: config.maxBackupLogFile.db,
      keepFileExt: true,
    },
    clientLog: {
      type: "file",
      filename: config.path.clientLog,
      maxLogSize: logSizes[config.maxLogSize.client],
      backups: config.maxBackupLogFile.client,
      keepFileExt: true,
    },
    // For dev, print all to console too:
    out: { type: "stdout" },
  },
  categories: {
    // Explicit categories so getLogger("serverLog") uses this config
    serverLog: {
      appenders: ["serverLog"],
      level: logLevels[config.maxLogLevel.server],
    },
    dbLog: { appenders: ["dbLog"], level: logLevels[config.maxLogLevel.db] },
    clientLog: {
      appenders: ["clientLog"],
      level: logLevels[config.maxLogLevel.client],
    },

    // Fallback if someone calls getLogger() with no name
    default: {
      appenders: ["serverLog"],
      level: logLevels[config.maxLogLevel.server],
    },
  },
});

// ---- Export loggers ----
const serverLog = log4js.getLogger("serverLog");
const dbLog = log4js.getLogger("dbLog");
const clentToServerLogSender = log4js.getLogger("clientLog");

// ---- Optional: runtime setters (per-file overrides) ----
function setServerLogLevel(level: string) {
  serverLog.level = level as log4js.Level["levelStr"];
}
function setDbLogLevel(level: string) {
  dbLog.level = level as log4js.Level["levelStr"];
}
function setClientLogLevel(level: string) {
  clentToServerLogSender.level = level as log4js.Level["levelStr"];
}

const logger = serverLog;

export {
  clentToServerLogSender,
  serverLog,
  dbLog,
  logger,
  setServerLogLevel,
  setDbLogLevel,
  setClientLogLevel,
};
