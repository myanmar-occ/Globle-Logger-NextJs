import { logLevels } from "@/app/_utils/GlobleLogger/const";
import { clientLog } from "@/app/_utils/GlobleLogger/logger";
// import { clentToServerLogSender } from "@/app/_utils/GlobleLogger/logger";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; 

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { message, level } = data;
  // clentToServerLogSender.level = logLevels.error
  switch (level) {
      case logLevels.trace: {
      // clentToServerLogSender.trace(message);
      clientLog.trace(message);

      break;
    }
    case logLevels.debug: {
      // clentToServerLogSender.debug(message);
      clientLog.debug(message);
      
      break;
    }
    case logLevels.info: {
      // clentToServerLogSender.info(message);
      clientLog.info(message);

      break;
    }
    case logLevels.warn: {
      // clentToServerLogSender.warn(message);
      clientLog.warn(message);

      break;
    }
    case logLevels.error: {
      // clentToServerLogSender.error(message);
      clientLog.error(message);

      break;
    }
    case logLevels.fatal: {
      // clentToServerLogSender.fatal(message);
      clientLog.fatal(message);

      break;
    }
  }

  return NextResponse.json({
    message: message,
  });
}
