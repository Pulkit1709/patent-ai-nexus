
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
    <div className="patent-search-container p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Patent Search</h1>
        <p className="text-gray-600">
          Search patents using the ADRLCS pipeline for enhanced relevance
        </p>
      </div>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-patent-primary"
            placeholder="Enter patent search query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSearching}
          />
          <Button 
            type="submit" 
            className="bg-patent-primary hover:bg-patent-primary/90" 
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
        </div>
      </form>
      
      {error && (
        <div className="text-red-500 text-center mb-6">{error}</div>
      )}
      
      {searchResponse && <PatentResults results={searchResponse.results} />}
    </div>
  );
};

export default PatentSearch;
