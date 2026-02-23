"use client";

import { useEffect, useState } from "react";
import OnboardingWizard from "./wizard";

const PROFILE_KEY = "dao-intel:profile";

export default function OnboardingPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      // Starting a new project onboarding should reset the pinned project/profile.
      window.localStorage.removeItem(PROFILE_KEY);
    } catch {
      // ignore
    } finally {
      setReady(true);
    }
  }, []);

  if (!ready) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-3 pb-16 pt-10 sm:px-6 lg:pt-14">
      <OnboardingWizard />
    </div>
  );
}

