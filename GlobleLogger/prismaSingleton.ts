// import { PrismaClient } from "@prisma/client";


// // ページがリロードされるたびに PrismaClient インスタンスが生成され、
// // それらが DB 接続をして「 FATAL: too many connections」となることを抑制するため
// // PrismaClient のインスタンスをシングルトンにするための処理。

// declare global {
//   // allow global `var` declarations
//   // eslint-disable-next-line no-var
//   var prisma: PrismaClient | undefined;
// }

// export const prisma =
//   global.prisma ||
//   new PrismaClient({
//     // log: ["query", "error", "info", "warn"],
//   });

// if (process.env.NODE_ENV !== "production") global.prisma = prisma;

import { PrismaClient } from "@prisma/client";
import { dbLog } from "./logger";


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

      console.log({ query, duration: e.duration });
      dbLog.info(query);
    } catch (err) {
      console.error("Failed to process query log", err);
      console.log(e);
    }
  });

  return prisma;
};

// ----- Global Singleton -----

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
