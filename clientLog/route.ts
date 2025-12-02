import { logLevels } from "@/app/_utils/GlobleLogger/const";
import { clentToServerLogSender as clientLog } from "@/app/_utils/GlobleLogger/logger";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { message, level } = data;
  switch (level) {
    case logLevels.trace: {
      clientLog.trace(message);
      break;
    }
    case logLevels.debug: {
      clientLog.debug(message);
      break;
    }
    case logLevels.info: {
      clientLog.info(message);
      break;
    }
    case logLevels.warn: {
      clientLog.warn(message);
      break;
    }
    case logLevels.error: {
      clientLog.error(message);
      break;
    }
    case logLevels.fatal: {
      clientLog.fatal(message);
      break;
    }
  }

  return NextResponse.json({
    message: message,
  });
}
