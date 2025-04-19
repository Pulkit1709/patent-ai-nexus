
import { useState } from "react";
import { SearchRequest, SearchResponse } from "../types/patent";
import { searchPatents } from "../services/api";
import PatentResults from "./PatentResults";
import { Button } from "./ui/button";
import { Loader, Search } from "lucide-react";

const PatentSearch = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }
    
    setError(null);
    setIsSearching(true);
    
    try {
      const request: SearchRequest = {
        query: query.trim(),
        limit: 10,
        useAdrlcs: true
      };
      
      const response = await searchPatents(request);
      setSearchResponse(response);
    } catch (err) {
      console.error("Error searching patents:", err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="patent-search-container">
      <div className="patent-search-header">
        <h1 className="patent-search-title">AI Patent Search</h1>
        <p className="patent-search-subtitle">
          Search patents using the ADRLCS pipeline for enhanced relevance
        </p>
      </div>
      
      <form onSubmit={handleSearch} className="patent-search-bar">
        <input
          type="text"
          className="patent-search-input"
          placeholder="Enter patent search query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isSearching}
        />
        <Button 
          type="submit" 
          className="patent-search-button" 
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <Loader className="h-4 w-4 animate-spin mr-2" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </form>
      
      {error && (
        <div className="text-red-500 text-center mb-6">{error}</div>
      )}
      
      {isSearching ? (
        <div className="patent-loader">
          <Loader className="h-8 w-8 animate-spin text-patent-primary" />
          <p className="mt-4 text-patent-primary">Searching patents with ADRLCS pipeline...</p>
        </div>
      ) : searchResponse ? (
        <>
          <div className="text-sm text-gray-500 text-center mb-6">
            Found {searchResponse.results.length} results in {(searchResponse.timing_ms / 1000).toFixed(2)}s
          </div>
          <PatentResults results={searchResponse.results} />
          
          {/* Pipeline execution details */}
          <div className="mt-10 bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-medium text-patent-primary mb-4">ADRLCS Pipeline Execution</h3>
            <div className="space-y-2">
              {searchResponse.pipeline_stages.map((stage, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-700">{stage.stage}</span>
                  <span className="text-patent-highlight font-medium">{stage.timing_ms}ms</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-medium">
                <span>Total Execution Time</span>
                <span className="text-patent-primary">{searchResponse.timing_ms}ms</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="patent-no-results text-gray-500">
          Enter a search query to find relevant patents
        </div>
      )}
    </div>
  );
};

export default PatentSearch;
