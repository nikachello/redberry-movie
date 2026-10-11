import SessionsPage from "@/components/sessions/SessionsPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="p-6 text-white">Loading sessions...</div>}
    >
      <SessionsPage />
    </Suspense>
  );
}
