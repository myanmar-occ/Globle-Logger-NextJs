import { clientLog } from "./clientLog";
type AnyFn = (...args: any[]) => any;

export const clientLogStartEnd = <T extends AnyFn>(
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
    const start =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    clientLog.info(`Start: ${name} args=${argText}`);
    try {
      const result = await func(...args);
      const end =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const duration = end - start;
      clientLog.info(`End: ${name} durationMs=${duration.toFixed(1)}`);
      return result;
    } catch (err) {
      const end =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const duration = end - start;
      clientLog.error(
        `Error in ${name} durationMs=${duration.toFixed(1)} error=${String(err)}`
      );
      throw err;
    }
  }) as T;
  return wrapped;
};
