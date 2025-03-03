import React, { Suspense } from "react";
import SignInClient from "./SignInClient";

export const dynamic = "force-dynamic"; // prevents static pre-render

export default function SignInPage() {
  return (
    <Suspense fallback={<div style={{ color: "#fff" }}>Loading...</div>}>
      <SignInClient />
    </Suspense>
  );
}
