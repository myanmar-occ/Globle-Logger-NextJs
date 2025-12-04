ဒီ logger ကို [log4js](https://www.npmjs.com/package/log4js) ဖြင့် တည်ဆောက်ထားပြီး [Prisma](https://prisma.io) ကို ORM အဖြစ် အသုံးပြုသော [Next.js](https://nextjs.org) များအတွက် ဖြစ်ပါတယ်။ Client, server နှင့် database logging အတွက် အသုံးပြုနိုင်ပါတယ်။

## စတင်အသုံးပြုခြင်း

#### 1. သွင်းယူခြင်း [log4js](https://www.npmjs.com/package/log4js)

```sh
npm i log4js
```

## Logger ချိတ်ဆက်ခြင်း

#### ၁။ ဖိုင်ကို `app/_utils` directory အောက်ရှိ `GlobalLogger folder` ထဲသို့ ‌ရွှေ့ပါ။ သင့်မှာ `_utils folder`မရှိသေးဘူးဆိုရင်၊ ပထမဆုံး `app/_utils` ကို ဖန်တီးပါ။

<div>
  <img height="200" src="https://github.com/myanmar-occ/Globle-Logger-NextJs/blob/main/Images/move-folder.png"  />
</div>

#### ၂။ အောက်ပါ code ကို သင့် `prismaSingleton` ထဲတွင် ထည့်သွင်းပါ၊ သို့မဟုတ် ပြင်ပါ။

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

#### ၃။ ဖိုင်ကို `app/api directory` အောက်ရှိ `clientLog folder` ထဲသို့ ရွှေ့ပါ။

<div>
  <img height="200" src="https://github.com/myanmar-occ/Globle-Logger-NextJs/blob/main/Images/clientLog-move-folder.png" />
</div>

## Logger အသုံးပြုပုံ

### For Client

- Page mount သောအချိန်တွင် level တစ်ခုချင်းစီ (`trace`, `debug`, `info`, `warn`, `error`, `fatal`) အတွက် message တစ်ခုစီကို log ထုတ်ပေးပြီး clientLog သည် browser မှာ မှန်ကန်စွာ အလုပ်လုပ်ကြောင်းအတည်ပြုနိုင်သည်။

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

- Handler ထုတ်ထားသည့် `clientLogStartEnd` ဖြင့် `function` ၏ အစ၊ အဆုံးနှင့် အတွင်းရှိ စိတ်ကြိုက်မှတ်တမ်းများကို အလိုအလျောက် မှတ်တမ်းတင်နိုင်ပါသည်။

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

- Route handler အတွင်း /api/users `fetch` အောင်မြင်မှုနှင့် error များကို log ထုတ်ပြီး serverLog သည် server (backend) ပေါ်တွင် မှန်ကန်စွာ အလုပ်လုပ်ကြောင်း အတည်ပြုနိုင်သည်။

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

- dbLog ကို အသုံးပြု၍ Prisma database query တစ်ခုချင်းစီနှင့် bound parameters များကို log ထုတ်ပြီး server-side DB logging မှန်ကန်စွာ အလုပ်လုပ်နေကြောင်း အတည်ပြုနိုင်သည်။

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

- repository method ကို serverLogStartEnd ဖြင့် ထုပ်ပတ်ခြင်းအားဖြင့် function ၏ စတင်မှု/အဆုံးသတ်မှု၊ error များနှင့် Prisma ဖြင့် DB access များကို server ပေါ်တွင် အားလုံး log ထုတ်ပေးနိုင်သည်။

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

## Log ကြည့်ခြင်း

- သင်၏ project အတွင်းရှိ logFiles folder မှ log files များကို ကြည့်ရှုနိုင်သည်။
<div>
  <img height="200" src="https://github.com/myanmar-occ/Globle-Logger-NextJs/blob/main/Images/log-output.png" />
</div>

## အစားထိုးရေးခြင်း နှင့် ပြောင်းလဲခြင်း

- app/\_utils/GlobleLogger/config.ts တွင် logger configuration ကို ကိုယ်ပိုင်စိတ်ကြိုက် ပြင်ဆင်နိုင်သည် သို့မဟုတ် အစားထိုးနိုင်သည်။

```javascript
import { configType } from "./types";
export const config: configType = {
  path: {
    serverLog: "./logFiles/serverLog/server.log",
    dbLog: "./logFiles/dbLog/db.log",
    clientLog: "./logFiles/clientLog/client.log",
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
  maxBackupLogFile: {
    server: 10,
    db: 10,
    client: 10,
  },
};
```
