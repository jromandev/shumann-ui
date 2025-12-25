import type { ReactNode } from "react";

interface TabNavigationProps {
  tabs: { id: string; label: string; icon: ReactNode }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  return (
    <div className="tab-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          <div className="tab-icon">{tab.icon}</div>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
