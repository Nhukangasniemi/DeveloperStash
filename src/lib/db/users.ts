import { connection } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * Stand-in for the signed-in user until auth lands: every page reads the
 * seeded demo user's data. Swap this for the Auth.js session later.
 */
const DEMO_USER_EMAIL = "demo@devstash.io";

export async function getCurrentUserId(): Promise<string> {
  // A real session reads cookies, which makes the page dynamic. Until then,
  // opt in explicitly — otherwise Next prerenders the page at build time and
  // serves that snapshot of the database forever.
  await connection();

  const user = await prisma.user.findUniqueOrThrow({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  });

  return user.id;
}
