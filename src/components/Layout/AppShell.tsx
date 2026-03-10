import type { ReactNode } from "react";

interface AppShellProps {
  leftSidebar: ReactNode;
  topHeader: ReactNode;
  rightSidebar?: ReactNode;
  children: ReactNode;
}

export function AppShell({ leftSidebar, topHeader, rightSidebar, children }: AppShellProps) {
  return (
    <div className="app-shell">
      {leftSidebar}
      <div className="content-shell">
        {topHeader}
        <main>{children}</main>
      </div>
      {rightSidebar ?? null}
    </div>
  );
}
