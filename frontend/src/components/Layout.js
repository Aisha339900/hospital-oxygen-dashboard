import React from "react";
import Sidebar from "./Sidebar";
import { useAuthContext } from "../context/AuthContext";

/**
 * Layout wraps the main application area with the Sidebar navigation.
 * It receives the current active view and navigation callbacks as props,
 * forwarding them to the Sidebar so the existing navigation logic is preserved.
 */
function Layout({
  children,
  favoriteLinks,
  sidebarCollections,
  activeView,
  viewableDashboards,
  onDashboardSelect,
  onLogsSelect,
  onSettingsSelect,
  onNavigate,
}) {
  const { user, logout } = useAuthContext();

  return (
    <div className="app-grid">
      <Sidebar
        favoriteLinks={favoriteLinks}
        sidebarCollections={sidebarCollections}
        activeView={activeView}
        viewableDashboards={viewableDashboards}
        onDashboardSelect={onDashboardSelect}
        onLogsSelect={onLogsSelect}
        onSettingsSelect={onSettingsSelect}
        onNavigate={onNavigate}
        user={user}
        onLogout={logout}
      />
      <div className="workspace">{children}</div>
    </div>
  );
}

export default Layout;
