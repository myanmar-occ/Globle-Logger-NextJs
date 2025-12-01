// import { logLevels } from "./const";

// const finalResult = (message: string, level: string) => {
//   const logData = {
//     level: level,
//     message: message,
//   };

//   // Send log data to backend using Fetch API
//   fetch("/api/clientLog/", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(logData),
//   })
//     .then((response) => {
//       if (!response.ok) {
//         console.error("Failed to send log data to backend.");
//       }
//     })
//     .catch((error) => {
//       console.error("An error occurred while sending log data:", error);
//     });
// };
// function trace(message: string) {
//   finalResult(message, logLevels.trace);
// }
// function debug(message: string) {
//   finalResult(message, logLevels.debug);
// }
// function info(message: string) {
//   finalResult(message, logLevels.info);
// }
// function warn(message: string) {
//   finalResult(message, logLevels.warn);
// }
// function error(message: string) {
//   finalResult(message, logLevels.error);
// }
// function fatal(message: string) {
//   finalResult(message, logLevels.fatal);
// }

// export const clientLog = {
//   info,
//   error,
//   fatal,
//   warn,
//   debug,
//   trace,
//   // level
// };

// // const info = () => {
// //   return
// // }

// // const ClientLogger ={
// //   info,
// // }
import { logLevels } from "./const";

const finalResult = async (message: string, level: string) => {
  // Safety: don't run on server side
  if (typeof window === "undefined") return;

  const logData = {
    level,
    message,
  };

  try {
    const response = await fetch("/api/clientLog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logData),
    });

    if (!response.ok) {
      // Use warn so Next dev overlay doesn't scream
      console.warn(
        `[clientLog] Failed to send log data to backend. status=${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.warn(
      "[clientLog] An error occurred while sending log data:",
      error
    );
  }
};

function trace(message: string) {
  finalResult(message, logLevels.trace);
}
function debug(message: string) {
  finalResult(message, logLevels.debug);
}
function info(message: string) {
  finalResult(message, logLevels.info);
}
function warn(message: string) {
  finalResult(message, logLevels.warn);
}
function error(message: string) {
  finalResult(message, logLevels.error);
}
function fatal(message: string) {
  finalResult(message, logLevels.fatal);
}

export const clientLog = {
  info,
  error,
  fatal,
  warn,
  debug,
  trace,
};
