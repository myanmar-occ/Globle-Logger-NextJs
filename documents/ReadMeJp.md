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
