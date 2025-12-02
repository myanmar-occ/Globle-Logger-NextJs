This logger is built with [log4js](https://www.npmjs.com/package/log4js) for [Next.js](https://nextjs.org) applications with [Prisma](https://prisma.io) as the ORM and can be used for client, server, and database logging.

## Getting Started

#### 1. Install [log4js](https://www.npmjs.com/package/log4js)

```sh
npm i log4js
```

## Logger Setup

#### 1. Move the file into the `GlobalLogger` folder inside the `app/_utils` directory. If you don’t have an `_utils` folder yet, create `app/_utils` first.

<div>
  <img height="200" src="https://github.com/myanmar-occ/Globle-Logger-NextJs/blob/main/Images/move-folder.png"  />
</div>

#### 2. Add or update the following code in your `prismaSingleton`.

```javascript
import { PrismaClient } from "@prisma/client";
import { dbLog } from "./GlobleLogger/logger";

const createPrismaClient = () => {
  const prisma = new PrismaClient({
    log: [
      {
        emit: "stdout",
        level: "error",
      },
      {
        emit: "stdout",
        level: "warn",
      },
      {
        emit: "event",
        level: "query",
      },
    ],
  });

  prisma.$on("query", (e) => {
    try {
      const paramsArray = JSON.parse(e.params);
      let query = e.query;
      paramsArray.forEach((param: any, index: number) => {
        query = query.replace(`$${index + 1}`, JSON.stringify(param));
      });

      /* optional */
      // console.log({ query, duration: e.duration });
      // dbLog.info(query);

    } catch (err) {
      console.error("Failed to process query log", err);
      console.log(e);
    }
  });

  return prisma;
};

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
export default prisma;
```

#### 3. Move the file into the `clientLog` folder inside the `app/api` directory.

<div>
  <img height="200" src="https://github.com/myanmar-occ/Globle-Logger-NextJs/blob/main/Images/clientLog-move-folder.png" />
</div>

## Logger Usage
### For Client
- Logs one message for each level (`trace`, `debug`, `info`, `warn`, `error`, `fatal`) when the page mounts, to verify that clientLog works in the browser.
```javascript
"use client";
import { useEffect } from "react";
import { clientLog } from "@/app/_utils/GlobleLogger/clientLog";

export default function Page() {
   useEffect(() => {
    clientLog.trace("This is info trace");
    clientLog.debug("This is debug log");
    clientLog.info("This is info log");
    clientLog.warn("This is warn log");
    clientLog.error("This is error log");
    clientLog.fatal("This is fatal log");
  }, []);

  return (
    <main>
      <h1>Page</h1>
    </main>
  );
}
```
- Wraps the handler with `clientLogStartEnd` so the function’s start, end, and any custom logs inside are automatically recorded.
```javascript
"use client";
import { clientLog } from "@/app/_utils/GlobleLogger/clientLog";
import { clientLogStartEnd } from "@/app/_utils/GlobleLogger/clientLogStartEnd";

export default function Page() {
  // Define a label for this function (used in the logs)
  const funcName = {
    onSubmit: "onSubmit",
  };

  // Wrap your handler with clientLogStartEnd to log start + end of execution
  const onSubmit = clientLogStartEnd(
    funcName.onSubmit, // Function name shown in the logs
    () => {
      clientLog.info("Submit handler ran successfully"); // Your actual logic
    }
  );

  return (
    <main>
      <button onClick={onSubmit}>Submit</button>
    </main>
  );
}
```
### For Server
- Logs a successful /api/users fetch and any errors in the route handler, to verify that serverLog works on the server (backend).
```javascript
import { NextResponse } from "next/server";
import { logger as serverLog } from "@/app/_utils/GlobleLogger/logger";
import { userRepository } from "@/app/_repositories/users";

export async function GET() {
  try {
    // Fetch all users from the repository
    const users = await userRepository.getAllUser();

    // Log successful fetch with user data (or you can log only metadata)
    serverLog.info("GET /api/users - fetched users", {
      count: Array.isArray(users) ? users.length : undefined,
    });

    // Return the user list as JSON
    return NextResponse.json(users);
  } catch (e) {
    if (e instanceof Error) {
      // Log the error details on the server
      serverLog.error("GET /api/users - failed to fetch users", {
        message: e.message,
        stack: e.stack,
      });

      // Return a generic 500 error to the client
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }

    // Handle non-Error exceptions (e.g. throwing strings or other values)
    serverLog.warn("GET /api/users - non-Error thrown", { error: e });
    return NextResponse.json({ error: "Unknown error" }, { status: 409 });
  }
}
```

- Logs each Prisma database query with bound parameters using dbLog, to verify that server-side DB logging is working correctly.
```javascript
prisma.$on("query", (e) => {
    try {
      const paramsArray = JSON.parse(e.params);
      let query = e.query;
      paramsArray.forEach((param: any, index: number) => {
        query = query.replace(`$${index + 1}`, JSON.stringify(param));
      });

      // Log all query
      dbLog.info(query);

    } catch (err) {
      console.error("Failed to process query log", err);
      console.log(e);
    }
  });
```

- Wraps the repository method with serverLogStartEnd so the function’s start/end, errors, and DB access (via Prisma) are all logged on the server.
```javascript
import { prisma } from "@/app/_utils/prismaSingleton";
import { serverLogStartEnd } from "@/app/_utils/GlobleLogger/serverLogStartEnd";
import { logger as serverLog } from "@/app/_utils/GlobleLogger/logger";

export namespace userRepository {
  // Labels for functions in this repository (used in logs)
  const funcName = {
    getAllUser: "getAllUser",
  };
  // Wrap the repository method with serverLogStartEnd so that:
  // - the start and end of the function call are logged
  // - errors are automatically captured
  export const getAllUser = serverLogStartEnd(funcName.getAllUser, async () => {
    // Execute Prisma query to fetch all users
    const users = await prisma.user.findMany();

    // Log domain-specific information (here: number of users fetched)
    serverLog.info("userRepository.getAllUser - fetched users", {
      count: users.length,
    });

    // Return the result back to the caller (e.g. API route)
    return users;
  });
}
```

## View Log
- You can view the log files in your project’s `logFiles` folder.
<div>
  <img height="200" src="https://github.com/myanmar-occ/Globle-Logger-NextJs/blob/main/Images/log-output.png" />
</div>

## Overwrite and Change
- You can customize or override the logger config in `app/_utils/GlobleLogger/const.ts`.
```javascript
const paths = {
  serverLog: "./logFiles/server.log",
  dbLog: "./logFiles/db.log",
  clientLog: "./logFiles/client.log",
};

const logSizes = {
  xs: 1024, // 1MB
  sm: 2048, // 2MB
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

```This logger is built with [log4js](https://www.npmjs.com/package/log4js) for [Next.js](https://nextjs.org) applications with [Prisma](https://prisma.io) as the ORM and can be used for client, server, and database logging.

## Getting Started

#### 1. Install [log4js](https://www.npmjs.com/package/log4js)

```sh
npm i log4js
```

## Logger Setup

#### 1. Move the file into the `GlobalLogger` folder inside the `app/_utils` directory. If you don’t have an `_utils` folder yet, create `app/_utils` first.

<div>
  <img height="200" src="https://github.com/myanmar-occ/Globle-Logger-NextJs/blob/main/Images/move-folder.png"  />
</div>

#### 2. Add or update the following code in your `prismaSingleton`.

```javascript
import { PrismaClient } from "@prisma/client";
import { dbLog } from "./GlobleLogger/logger";

const createPrismaClient = () => {
  const prisma = new PrismaClient({
    log: [
      {
        emit: "stdout",
        level: "error",
      },
      {
        emit: "stdout",
        level: "warn",
      },
      {
        emit: "event",
        level: "query",
      },
    ],
  });

  prisma.$on("query", (e) => {
    try {
      const paramsArray = JSON.parse(e.params);
      let query = e.query;
      paramsArray.forEach((param: any, index: number) => {
        query = query.replace(`$${index + 1}`, JSON.stringify(param));
      });

      /* optional */
      // console.log({ query, duration: e.duration });
      // dbLog.info(query);

    } catch (err) {
      console.error("Failed to process query log", err);
      console.log(e);
    }
  });

  return prisma;
};

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
export default prisma;
```

#### 3. Move the file into the `clientLog` folder inside the `app/api` directory.

<div>
  <img height="200" src="https://github.com/myanmar-occ/Globle-Logger-NextJs/blob/main/Images/clientLog-move-folder.png" />
</div>
