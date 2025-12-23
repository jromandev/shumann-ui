import { useState } from "react";
import { Activity, TrendingUp, Calendar, Zap } from "lucide-react";
import { TabNavigation } from "./components/TabNavigation";
import { LiveDashboard } from "./views/LiveDashboard";
import { GraphsView } from "./views/GraphsView";
import { EventsView } from "./views/EventsView";
import { CalendarView } from "./views/CalendarView";
import "./App.css";

type TabId = "live" | "graphs" | "events" | "calendar";

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("live");

  const tabs = [
    { id: "live" as TabId, label: "Live", icon: <Activity size={20} /> },
    { id: "graphs" as TabId, label: "Graphs", icon: <TrendingUp size={20} /> },
    { id: "events" as TabId, label: "Events", icon: <Zap size={20} /> },
    {
      id: "calendar" as TabId,
      label: "Calendar",
      icon: <Calendar size={20} />,
    },
  ];

  const renderView = () => {
    switch (activeTab) {
      case "live":
        return <LiveDashboard />;
      case "graphs":
        return <GraphsView />;
      case "events":
        return <EventsView />;
      case "calendar":
        return <CalendarView />;
      default:
        return <LiveDashboard />;
    }
  };

  return (
    <div className="app">
      <main className="app-main">{renderView()}</main>

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabId)}
      />
    </div>
  );
}

export default App;
