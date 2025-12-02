import { configType } from "./types";
export const config: configType = {
  path: {
    serverLog: "./logFiles/server.log",
    dbLog: "./logFiles/db.log",
    clientLog: "./logFiles/client.log",
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
};
