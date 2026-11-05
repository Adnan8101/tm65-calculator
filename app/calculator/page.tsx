import { Suspense } from "react";
import type { Metadata } from "next";
import Wizard from "@/components/calc/wizard";

export const metadata: Metadata = { title: "Calculator" };

export default function Page() {
  return (
    <Suspense>
      <Wizard />
    </Suspense>
  );
}
