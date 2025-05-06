"use client";

import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function SessionSync() {
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      // ID トークンを強制リフレッシュ
      const idToken = await user.getIdToken(true);
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
    });
    return () => unsubscribe();
  }, []);

  return null;
}