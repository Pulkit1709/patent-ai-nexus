
import React, { useState } from "react";
import { IngestRequest } from "../types/patent";
import { ingestPatent } from "../services/api";
import { Button } from "./ui/button";
import { Loader } from "lucide-react";

const PatentIngest: React.FC = () => {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    patentId?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !abstract.trim()) {
      setResult({
        success: false,
        message: "Please provide both a title and abstract for the patent."
      });
      return;
    }
    
    setIsIngesting(true);
    setResult(null);
    
    try {
      const request: IngestRequest = {
        title: title.trim(),
        abstract: abstract.trim()
      };
      
      const response = await ingestPatent(request);
      
      if (response.success) {
        setResult({
          success: true,
          message: "Patent successfully ingested into the system.",
          patentId: response.patent_id
        });
        
        // Reset form after successful submission
        setTitle("");
        setAbstract("");
      } else {
        setResult({
          success: false,
          message: "Failed to ingest patent. Please try again."
        });
      }
    } catch (error) {
      console.error("Error ingesting patent:", error);
      setResult({
        success: false,
        message: "An error occurred while ingesting the patent. Please try again."
      });
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-patent-primary mb-4">Ingest New Patent</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patent Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="patent-search-input w-full"
            placeholder="Enter patent title..."
            disabled={isIngesting}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patent Abstract
          </label>
          <textarea
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            className="patent-search-input w-full min-h-[150px]"
            placeholder="Enter patent abstract..."
            disabled={isIngesting}
          />
        </div>
        
        <Button
          type="submit"
          className="w-full bg-patent-primary text-white"
          disabled={isIngesting}
        >
          {isIngesting ? (
            <>
              <Loader className="h-4 w-4 animate-spin mr-2" />
              Ingesting Patent...
            </>
          ) : (
            "Ingest Patent"
          )}
        </Button>
      </form>
      
      {result && (
        <div className={`mt-4 p-4 rounded ${
          result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
        }`}>
          <p>{result.message}</p>
          {result.patentId && (
            <p className="mt-2 text-sm">
              Patent ID: <span className="font-mono">{result.patentId}</span>
            </p>
          )}
        </div>
      )}
      
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">About Patent Ingestion</h3>
        <p className="text-sm text-gray-600">
          When a patent is ingested, the ADRLCS pipeline automatically:
        </p>
        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1 mt-2">
          <li>Generates semantic embeddings using OpenAI API</li>
          <li>Creates graph neural network embeddings based on citation data</li>
          <li>Classifies the patent into relevant domains</li>
          <li>Makes it available for searching with the full ADRLCS pipeline</li>
        </ul>
      </div>
    </div>
  );
};

export default PatentIngest;
