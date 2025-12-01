// // // // Right now logStartEndServer just calls the function and doesn't await async functions, so the "End" log is written before your DB finishes, and errors won't be logged.

// // // import { clientLog } from "./clientLog";
// // // import { serverLog } from "./logger";

// // // const logStartEndClient = (funcName: string, func: any) => {
// // //   return (...args: any) => {
// // //     clientLog.info(`Start: Function Name - ${funcName || "AnonymousFunction"}`);

// // //     // Execute the wrapped function
// // //     const result = func(...args);

// // //     clientLog.info(`End: Function Name - ${funcName || "AnonymousFunction"}`);

// // //     return result;
// // //   };
// // // };

// // // const logStartEndServer = (funcName: string, func: any) => {
// // //   return (...args: any) => {
// // //     serverLog.info(`Start: Function Name - ${funcName || "AnonymousFunction"}`);

// // //     // Execute the wrapped function
// // //     const result = func(...args);

// // //     serverLog.info(`End: Function Name - ${funcName || "AnonymousFunction"}`);

// // //     return result;
// // //   };
// // // };

// // // export { logStartEndClient, logStartEndServer };


// // // app/_utils/GlobleLogger/logStartEnd.ts (Version - 2)
// // // import { clientLog } from "./clientLog";
// // // import { serverLog, dbLog } from "./logger";

// // // type AnyFn = (...args: any[]) => any;

// // // // ---------- CLIENT SIDE ----------
// // // export const clientLogStartEnd = <T extends AnyFn>(
// // //   funcName: string,
// // //   func: T
// // // ): T => {
// // //   const name = funcName || func.name || "AnonymousFunction";

// // //   const wrapped = (async (...args: any[]) => {
// // //     clientLog.info(`Start: ${name}`);

// // //     try {
// // //       const result = await func(...args);
// // //       clientLog.info(`End: ${name}`);
// // //       return result;
// // //     } catch (err) {
// // //       // clientLog.error only takes ONE argument -> stringify error
// // //       clientLog.error(`Error in ${name}: ${String(err)}`);
// // //       throw err;
// // //     }
// // //   }) as T;

// // //   return wrapped;
// // // };

// // // // ---------- SERVER SIDE ----------
// // // export const serverLogStartEnd = <T extends AnyFn>(
// // //   funcName: string,
// // //   func: T
// // // ): T => {
// // //   const name = funcName || func.name || "AnonymousFunction";

// // //   const wrapped = (async (...args: any[]) => {
// // //     serverLog.info(`Start: ${name}`);

// // //     try {
// // //       const result = await func(...args);
// // //       serverLog.info(`End: ${name}`);
// // //       return result;
// // //     } catch (err: any) {
// // //       serverLog.error(
// // //         `Error in ${name}: ${err?.message ?? String(err)}`
// // //       );
// // //       throw err;
// // //     }
// // //   }) as T;

// // //   return wrapped;
// // // };

// // // // ---------- DB SIDE (optional, for repositories that are DB-heavy) ----------
// // // export const dbLogStartEnd = <T extends AnyFn>(
// // //   funcName: string,
// // //   func: T
// // // ): T => {
// // //   const name = funcName || func.name || "AnonymousFunction";

// // //   const wrapped = (async (...args: any[]) => {
// // //     dbLog.info(`Start: ${name}`);

// // //     try {
// // //       const result = await func(...args);
// // //       dbLog.info(`End: ${name}`);
// // //       return result;
// // //     } catch (err: any) {
// // //       dbLog.error(`Error in ${name}: ${err?.message ?? String(err)}`);
// // //       throw err;
// // //     }
// // //   }) as T;

// // //   return wrapped;
// // // };

// // // app/_utils/GlobleLogger/logStartEnd.ts (Version - 3)
// // import { clientLog } from "./clientLog";
// // import { serverLog, dbLog } from "./logger";

// // type AnyFn = (...args: any[]) => any;

// // // ---------- CLIENT SIDE ----------
// // export const clientLogStartEnd = <T extends AnyFn>(
// //   funcName: string,
// //   func: T
// // ): T => {
// //   const name = funcName || func.name || "AnonymousFunction";

// //   const wrapped = (async (...args: any[]) => {
// //     const start = Date.now();

// //     // IN
// //     clientLog.info(
// //       `IN  ${name} args=${args.length ? JSON.stringify(args) : "[]"}`
// //     );

// //     try {
// //       const result = await func(...args);

// //       const duration = Date.now() - start;
// //       // OUT
// //       clientLog.info(`OUT ${name} durationMs=${duration}`);

// //       return result;
// //     } catch (err) {
// //       const duration = Date.now() - start;
// //       // ERROR
// //       clientLog.error(
// //         `ERR ${name} durationMs=${duration} error=${String(err)}`
// //       );
// //       throw err;
// //     }
// //   }) as T;

// //   return wrapped;
// // };

// // // ---------- SERVER SIDE ----------
// // export const serverLogStartEnd = <T extends AnyFn>(
// //   funcName: string,
// //   func: T
// // ): T => {
// //   const name = funcName || func.name || "AnonymousFunction";

// //   const wrapped = (async (...args: any[]) => {
// //     const start = Date.now();
// //     serverLog.info(
// //       `IN  ${name} args=${args.length ? JSON.stringify(args) : "[]"}`
// //     );

// //     try {
// //       const result = await func(...args);
// //       const duration = Date.now() - start;
// //       serverLog.info(`OUT ${name} durationMs=${duration}`);
// //       return result;
// //     } catch (err: any) {
// //       const duration = Date.now() - start;
// //       serverLog.error(
// //         `ERR ${name} durationMs=${duration} error=${err?.message ?? String(
// //           err
// //         )}`
// //       );
// //       throw err;
// //     }
// //   }) as T;

// //   return wrapped;
// // };

// // // ---------- DB SIDE ----------
// // export const dbLogStartEnd = <T extends AnyFn>(
// //   funcName: string,
// //   func: T
// // ): T => {
// //   const name = funcName || func.name || "AnonymousFunction";

// //   const wrapped = (async (...args: any[]) => {
// //     const start = Date.now();
// //     dbLog.info(
// //       `IN  ${name} args=${args.length ? JSON.stringify(args) : "[]"}`
// //     );

// //     try {
// //       const result = await func(...args);
// //       const duration = Date.now() - start;
// //       dbLog.info(`OUT ${name} durationMs=${duration}`);
// //       return result;
// //     } catch (err: any) {
// //       const duration = Date.now() - start;
// //       dbLog.error(
// //         `ERR ${name} durationMs=${duration} error=${err?.message ?? String(
// //           err
// //         )}`
// //       );
// //       throw err;
// //     }
// //   }) as T;

// //   return wrapped;
// // };


// // app/_utils/GlobleLogger/logStartEnd.ts (Version-)
// import { clientLog } from "./clientLog";
// import { serverLog, dbLog } from "./logger";

// type AnyFn = (...args: any[]) => any;

// // ---------- CLIENT SIDE ----------
// export const clientLogStartEnd = <T extends AnyFn>(
//   funcName: string,
//   func: T
// ): T => {
//   const name = funcName || func.name || "AnonymousFunction";

//   const wrapped = (async (...args: any[]) => {
//     // safely stringify args
//     let argText = "";
//     try {
//       argText = JSON.stringify(args);
//     } catch {
//       argText = "[unserializable args]";
//     }

//     const start =
//       typeof performance !== "undefined" ? performance.now() : Date.now();

//     clientLog.info(`Start: ${name} args=${argText}`);

//     try {
//       const result = await func(...args);

//       const end =
//         typeof performance !== "undefined" ? performance.now() : Date.now();
//       const duration = end - start;

//       clientLog.info(`End: ${name} durationMs=${duration.toFixed(1)}`);
//       return result;
//     } catch (err) {
//       const end =
//         typeof performance !== "undefined" ? performance.now() : Date.now();
//       const duration = end - start;

//       clientLog.error(
//         `Error in ${name} durationMs=${duration.toFixed(
//           1
//         )} error=${String(err)}`
//       );
//       throw err;
//     }
//   }) as T;

//   return wrapped;
// };

// // ---------- SERVER SIDE ----------
// export const serverLogStartEnd = <T extends AnyFn>(
//   funcName: string,
//   func: T
// ): T => {
//   const name = funcName || func.name || "AnonymousFunction";

//   const wrapped = (async (...args: any[]) => {
//     let argText = "";
//     try {
//       argText = JSON.stringify(args);
//     } catch {
//       argText = "[unserializable args]";
//     }

//     const start = Date.now();
//     serverLog.info(`Start: ${name} args=${argText}`);

//     try {
//       const result = await func(...args);
//       const duration = Date.now() - start;
//       serverLog.info(`End: ${name} durationMs=${duration}`);
//       return result;
//     } catch (err: any) {
//       const duration = Date.now() - start;
//       serverLog.error(
//         `Error in ${name} durationMs=${duration} error=${
//           err?.message ?? String(err)
//         }`
//       );
//       throw err;
//     }
//   }) as T;

//   return wrapped;
// };

// // ---------- DB SIDE ----------
// export const dbLogStartEnd = <T extends AnyFn>(
//   funcName: string,
//   func: T
// ): T => {
//   const name = funcName || func.name || "AnonymousFunction";

//   const wrapped = (async (...args: any[]) => {
//     let argText = "";
//     try {
//       argText = JSON.stringify(args);
//     } catch {
//       argText = "[unserializable args]";
//     }

//     const start = Date.now();
//     dbLog.info(`Start: ${name} args=${argText}`);

//     try {
//       const result = await func(...args);
//       const duration = Date.now() - start;
//       dbLog.info(`End: ${name} durationMs=${duration}`);
//       return result;
//     } catch (err: any) {
//       const duration = Date.now() - start;
//       dbLog.error(
//         `Error in ${name} durationMs=${duration} error=${
//           err?.message ?? String(err)
//         }`
//       );
//       throw err;
//     }
//   }) as T;

//   return wrapped;
// };
