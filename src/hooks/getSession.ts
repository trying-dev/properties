"use server";

import { auth } from " +/lib/auth";

export async function getSession() {
  try {
    const session = await auth();
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function getUserRole() {
  try {
    const session = await auth();
    return session?.user?.role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}
