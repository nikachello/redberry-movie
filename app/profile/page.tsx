import { Suspense } from "react";
import ProfilePage from "@/components/profile/ProfilePage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#080d1c] px-6 pt-28 text-white">
          Loading profile...
        </main>
      }
    >
      <ProfilePage />
    </Suspense>
  );
}