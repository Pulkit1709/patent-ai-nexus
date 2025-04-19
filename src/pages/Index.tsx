import { useState } from "react";
import AppNavigation from "../components/AppNavigation";
import PatentSearch from "../components/PatentSearch";
import PatentIngest from "../components/PatentIngest";
import AdrlcsExplanation from "../components/AdrlcsExplanation";
import AppFooter from "../components/AppFooter";

const Index = () => {
  const [activeTab, setActiveTab] = useState("search");

  return (
    <div className="min-h-screen flex flex-col bg-patent-background">
      <AppNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-grow">
        {activeTab === "search" && <PatentSearch />}
        {activeTab === "ingest" && <PatentIngest />}
        {activeTab === "adrlcs" && <AdrlcsExplanation />}
      </main>
      
      <AppFooter />
    </div>
  );
};

export default Index;
