import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <Header />

      <div className="flex flex-1 ">
        {/* Sidebar (fixed + toggle control) */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Main content area */}
        <main
          className={`flex-1 m-10 overflow-y-auto transition-all duration-300 ${collapsed ? "pl-20" : "pl-64"
            }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
