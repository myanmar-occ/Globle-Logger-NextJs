export interface configType {
  path: {
    serverLog: string;
    dbLog: string;
    clientLog: string;
  };
  maxLogSize: {
    server: "xs" | "sm" | "md" | "lg" | "xl";
    db: "xs" | "sm" | "md" | "lg" | "xl";
    client: "xs" | "sm" | "md" | "lg" | "xl";
  };
  maxLogLevel: {
    server: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
    db: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
    client: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  };
  maxBackupLogFile: {
    server: number;
    db: number;
    client: number;
  };
}
