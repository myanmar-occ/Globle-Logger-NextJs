このロガーは、[log4js](https://www.npmjs.com/package/log4js) を使用して [Next.js](https://nextjs.org) アプリケーション向けに作成されており、ORM として [Prisma](https://prisma.io) を利用しつつ、クライアント・サーバー・データベースのログを記録できます。
## はじめに

#### 1. [log4js](https://www.npmjs.com/package/log4js) をインストール

```sh
npm i log4js
```

## ロガーのセットアップ

#### 1. `app/_utils` ディレクトリ内の `GlobalLogger` フォルダにファイルを移動します。_utils フォルダがない場合は、先に `app/_utils` を作成してください。
<div>
  <img height="200" src="https://github.com/myanmar-occ/Globle-Logger-NextJs/blob/main/Images/move-folder.png"  />
</div>

#### 2. `prismaSingleton` に次のコードを追加または更新します。

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

#### 3. `app/api` ディレクトリ内の `clientLog` フォルダにファイルを移動します。

<div>
  <img height="200" src="https://github.com/myanmar-occ/Globle-Logger-NextJs/blob/main/Images/clientLog-move-folder.png" />
</div>

## ロガーの使い方
### クライアント側
- ページマウント時に各レベル（`trace`, `debug`, `info`, `warn`, `error`, `fatal`）で 1 件ずつログを出力し、clientLog がブラウザで正常に動作しているか確認します。
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
- ハンドラーを `clientLogStartEnd` でラップすることで、関数の開始・終了と、その中で出力されるカスタムログが自動的に記録されます。
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
### サーバー側
- `/api/users` の取得処理とエラーを `serverLog` でログ出力し、サーバー（バックエンド）側でのロギングが正しく動作しているか確認します。
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

- Prisma の各クエリをバインドパラメータ込みで dbLog に出力し、サーバー側の DB ログが正しく動作しているか確認します。
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

- リポジトリメソッドを `serverLogStartEnd` でラップし、関数の開始／終了、エラー、および Prisma を介した DB アクセスをすべてサーバーログに記録します。
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

## ログの確認
- プロジェクト内の `logFiles` フォルダでログファイルを確認できます。
<div>
  <img height="200" src="https://github.com/myanmar-occ/Globle-Logger-NextJs/blob/main/Images/log-output.png" />
</div>

## 設定の上書き・変更
- `app/_utils/GlobleLogger/config.ts` でロガー設定をカスタマイズまたは上書きできます。
```javascript
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

```
