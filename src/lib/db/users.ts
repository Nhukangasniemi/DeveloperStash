import { cache } from "react";
import { connection } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * Stand-in for the signed-in user until auth lands: every page reads the
 * seeded demo user's data. Swap this for the Auth.js session later.
 */
const DEMO_USER_EMAIL = "demo@devstash.io";

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isPro: boolean;
}

/**
 * Cached per request, so the layout and the page share one query however many
 * times each asks for the user.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  // A real session reads cookies, which makes the page dynamic. Until then,
  // opt in explicitly — otherwise Next prerenders the page at build time and
  // serves that snapshot of the database forever.
  await connection();

  return prisma.user.findUniqueOrThrow({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true, name: true, email: true, image: true, isPro: true },
  });
});

export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  return user.id;
}
