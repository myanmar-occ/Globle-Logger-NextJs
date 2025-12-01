import { serverLog, dbLog } from "./logger";
type AnyFn = (...args: any[]) => any;

export const serverLogStartEnd = <T extends AnyFn>(
  funcName: string,
  func: T
): T => {
  const name = funcName || func.name || "AnonymousFunction";
  const wrapped = (async (...args: any[]) => {
    let argText = "";
    try {
      argText = JSON.stringify(args);
    } catch {
      argText = "[unserializable args]";
    }
    const start = Date.now();
    serverLog.info(`Start: ${name} args=${argText}`);
    try {
      const result = await func(...args);
      const duration = Date.now() - start;
      serverLog.info(`End: ${name} durationMs=${duration}`);
      return result;
    } catch (err: any) {
      const duration = Date.now() - start;
      serverLog.error(
        `Error in ${name} durationMs=${duration} error=${err?.message ?? String(err)}`
      );
      throw err;
    }
  }) as T;
  return wrapped;
};

// ---------- DB SIDE ----------
export const dbLogStartEnd = <T extends AnyFn>(
  funcName: string,
  func: T
): T => {
  const name = funcName || func.name || "AnonymousFunction";

  const wrapped = (async (...args: any[]) => {
    let argText = "";
    try {
      argText = JSON.stringify(args);
    } catch {
      argText = "[unserializable args]";
    }

    const start = Date.now();
    dbLog.info(`Start: ${name} args=${argText}`);

    try {
      const result = await func(...args);
      const duration = Date.now() - start;
      dbLog.info(`End: ${name} durationMs=${duration}`);
      return result;
    } catch (err: any) {
      const duration = Date.now() - start;
      dbLog.error(
        `Error in ${name} durationMs=${duration} error=${
          err?.message ?? String(err)
        }`
      );
      throw err;
    }
  }) as T;

  return wrapped;
};