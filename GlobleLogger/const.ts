const paths = {
  serverLog: "./logFiles/server.log",
  dbLog: "./logFiles/db.log",
  clientLog: "./logFiles/client.log",
};

const logSizes = {
  xs: 1024, // 1MB
  sm: 2048, // 2MB
  // md: 4096, // 4MB
  md: 1024 * 1024 * 5, // 5MB
  lg: 8192, // 8MB
  xl: 16384, // 16MB
};

const logLevels = {
  trace: "trace", // level-1
  debug: "debug", // level-2
  info: "info", // level-3
  warn: "warn", // level-4
  error: "error", // level-5
  fatal: "fatal", // level-6
} as const;

export { paths, logSizes, logLevels };
