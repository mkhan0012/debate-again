'use server';

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { headers } from "next/headers";

export type LogEventType = 
  | 'PAGE_VIEW' 
  | 'CLICK' 
  | 'FORM_SUBMIT' 
  | 'ERROR' 
  | 'EXIT' 
  | 'DEBATE_START';

interface LogPayload {
  eventType: LogEventType;
  pageUrl: string;
  action?: string;
  metadata?: Record<string, any>;
}

export async function logActivity(payload: LogPayload) {
  try {
    const session = await getSession();
    
    // logic: We only log "what he did after log in"
    // If there is no user session, we do not save the data to the DB.
    if (!session?.userId) return { success: false, reason: "Guest" };

    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    
    // 1. Fetch current logs
    // We explicitly select only the activityLogs field to be efficient
    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: { activityLogs: true }
    });

    if (!user) return { success: false };

    // 2. Prepare the new entry
    const newEntry = {
      event: payload.eventType,
      url: payload.pageUrl,
      desc: payload.action || payload.eventType,
      meta: { ...payload.metadata, ua: userAgent },
      time: new Date().toISOString()
    };

    // 3. Append to existing array (or start new one)
    const currentLogs = Array.isArray(user.activityLogs) ? user.activityLogs : [];
    const updatedLogs = [...currentLogs, newEntry];

    // 4. Update the User record
    await prisma.user.update({
      where: { id: session.userId as string },
      data: {
        activityLogs: updatedLogs
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Logger Error:", error);
    return { success: false };
  }
}