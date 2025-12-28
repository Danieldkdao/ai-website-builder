"use server"

import "server-only";
import "drizzle-orm";
import { db } from "@/drizzle/db";
import { UsageTable } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { RateLimiterDrizzleNonAtomic } from "rate-limiter-flexible";

const FREE_POINTS = 2;
const PRO_POINTS = 100;
const DURATION = 30 * 24 * 60 * 60;
const GENERATION_COST = 1;

export const getUsageTracker = async () => {
  const { has } = await auth();
  const hasProAccess = has({ plan: "pro" });
  const usageTracker = new RateLimiterDrizzleNonAtomic({
    storeClient: db,
    schema: UsageTable,
    points: hasProAccess ? PRO_POINTS : FREE_POINTS,
    duration: DURATION,
  });

  return usageTracker;
};

export const consumeCredits = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  const result = await usageTracker.consume(userId, GENERATION_COST);
  return result;
};

export const getUsageStatus = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  const result = await usageTracker.get(userId);
  return result;
};
