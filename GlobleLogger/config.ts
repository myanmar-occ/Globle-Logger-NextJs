import { configType } from "./types";
export const config: configType = {
  path: {
    serverLog: "./logFiles/serverLog/server.log",
    dbLog: "./logFiles/dbLog/db.log",
    clientLog: "./logFiles/clientLog/client.log",
  },
  // can be used "xs" | "sm" | "md" | "lg" | "xl"
  maxLogSize: {
    server: "md",
    db: "md",
    client: "md",
  },
  // can be used "trace" | "debug" | "info" | "warn" | "error" | "fatal"
  maxLogLevel: {
    server: "trace",
    db: "trace",
    client: "trace",
  },
  maxBackupLogFile: {
    server: 10,
    db: 10,
    client: 10,
  },
};
