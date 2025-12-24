import React from "react";
import { RiskApp } from "../../components/RiskApp";
import { AppHeader } from "../../components/AppHeader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <RiskApp>
      <div>
        <AppHeader />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </RiskApp>
  );
}
