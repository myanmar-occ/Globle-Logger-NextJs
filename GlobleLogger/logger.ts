import * as log4js from "log4js";
import path from "path";
import { paths, logSizes, logLevels } from "./const";

// ---- Level helpers (env or fallback) ----
const SERVER_LEVEL =
  process.env.LOG_LEVEL_SERVER?.toLowerCase() || logLevels.trace; // e.g. "info" | "warn" | "error" | "trace" etc.

const DB_LEVEL = process.env.LOG_LEVEL_DB?.toLowerCase() || logLevels.trace;

const CLIENT_LEVEL =
  process.env.LOG_LEVEL_CLIENT?.toLowerCase() || logLevels.trace;

// ---- Configure log4js ----
log4js.configure({
  appenders: {
    serverLog: {
      type: "file",
      filename: paths.serverLog,
      maxLogSize: logSizes.md,
    },
    dbLog: { type: "file", filename: paths.dbLog, maxLogSize: logSizes.md },
    clientLog: {
      type: "file",
      filename: paths.clientLog,
      maxLogSize: logSizes.md,
    },
    // For dev, print all to console too:
    out: { type: "stdout" },
  },
  categories: {
    // Explicit categories so getLogger("serverLog") uses this config
    serverLog: { appenders: ["serverLog"], level: SERVER_LEVEL },
    dbLog: { appenders: ["dbLog"], level: DB_LEVEL },
    clientLog: { appenders: ["clientLog"], level: CLIENT_LEVEL },

    // Fallback if someone calls getLogger() with no name
    default: { appenders: ["serverLog"], level: SERVER_LEVEL },
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
