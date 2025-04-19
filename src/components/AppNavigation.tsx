
import React from "react";
import { Button } from "./ui/button";
import { Search, FileText, Info } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppNavigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-bold text-patent-primary">PatentAI Nexus</h1>
          </div>
          
          <div className="flex">
            <nav className="flex space-x-2 sm:space-x-4">
              <Button
                variant={activeTab === "search" ? "default" : "ghost"}
                className={activeTab === "search" ? "bg-patent-primary" : "text-gray-700"}
                onClick={() => setActiveTab("search")}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              
              <Button
                variant={activeTab === "ingest" ? "default" : "ghost"}
                className={activeTab === "ingest" ? "bg-patent-primary" : "text-gray-700"}
                onClick={() => setActiveTab("ingest")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Ingest
              </Button>
              
              <Button
                variant={activeTab === "adrlcs" ? "default" : "ghost"}
                className={activeTab === "adrlcs" ? "bg-patent-primary" : "text-gray-700"}
                onClick={() => setActiveTab("adrlcs")}
              >
                <Info className="h-4 w-4 mr-2" />
                ADRLCS
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppNavigation;
