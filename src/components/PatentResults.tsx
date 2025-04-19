
import React, { useState } from "react";
import { SearchResult, Classification } from "../types/patent";
import { classifyPatent } from "../services/api";
import { Button } from "./ui/button";
import { Loader } from "lucide-react";

interface PatentResultsProps {
  results: SearchResult[];
}

const PatentResults: React.FC<PatentResultsProps> = ({ results }) => {
  const [classifying, setClassifying] = useState<Record<string, boolean>>({});
  const [classifications, setClassifications] = useState<Record<string, Classification[]>>({});
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});

  const handleClassify = async (patentId: string) => {
    setClassifying(prev => ({ ...prev, [patentId]: true }));
    
    try {
      const response = await classifyPatent({ patent_id: patentId });
      
      if (response.success) {
        setClassifications(prev => ({ 
          ...prev, 
          [patentId]: response.classifications 
        }));
      }
    } catch (error) {
      console.error("Error classifying patent:", error);
    } finally {
      setClassifying(prev => ({ ...prev, [patentId]: false }));
    }
  };

  const toggleAbstract = (patentId: string) => {
    setExpandedAbstracts(prev => ({ 
      ...prev, 
      [patentId]: !prev[patentId] 
    }));
  };

  if (results.length === 0) {
    return (
      <div className="patent-no-results">
        No patents found matching your search criteria
      </div>
    );
  }

  return (
    <div className="patent-results-container">
      {results.map((result) => {
        const patentId = result.patent.id;
        const patentClassifications = classifications[patentId] || 
                                     (result.classification ? [result.classification] : []);
        const isExpanded = expandedAbstracts[patentId] || false;
        
        return (
          <div key={patentId} className="patent-card">
            <div className="patent-card-header">
              <h2 className="patent-card-title">{result.patent.title}</h2>
            </div>
            
            <div className="patent-card-body">
              <p className={`patent-card-abstract ${isExpanded ? "" : "line-clamp-3"}`}>
                {result.patent.abstract}
              </p>
              
              {result.patent.abstract.length > 150 && (
                <button 
                  onClick={() => toggleAbstract(patentId)}
                  className="text-patent-primary text-sm hover:underline mt-1"
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}
              
              {/* Relevance Scores */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>BM25:</span>
                  <span className="font-medium">{(result.scores.bm25 * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Semantic:</span>
                  <span className="font-medium">{(result.scores.semantic * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>LLM Coherence:</span>
                  <span className="font-medium">{(result.scores.llm_coherence * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>GNN:</span>
                  <span className="font-medium">{(result.scores.gnn * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>PRF:</span>
                  <span className="font-medium">{(result.scores.prf * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>User Feedback:</span>
                  <span className="font-medium">{(result.scores.user_feedback * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between col-span-2 border-t pt-1 mt-1">
                  <span className="font-medium">Final Score:</span>
                  <span className="font-bold text-patent-highlight">
                    {(result.scores.final * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              {/* Classifications */}
              <div className="patent-card-meta">
                {patentClassifications.map((classification, index) => (
                  <span key={index} className="patent-card-tag">
                    {classification.domain}
                    <span className="ml-1 opacity-75">
                      {(classification.confidence * 100).toFixed(0)}%
                    </span>
                  </span>
                ))}
                
                <span className="patent-card-score">
                  Score: {(result.scores.final * 100).toFixed(0)}
                </span>
              </div>
              
              {/* Classify Button */}
              <div className="mt-4">
                <Button
                  onClick={() => handleClassify(patentId)}
                  disabled={classifying[patentId]}
                  variant="outline"
                  size="sm"
                  className="text-patent-secondary border-patent-secondary hover:bg-patent-secondary hover:text-white"
                >
                  {classifying[patentId] ? (
                    <>
                      <Loader className="h-3 w-3 animate-spin mr-1" />
                      Classifying...
                    </>
                  ) : (
                    patentClassifications.length > 0 ? "Reclassify" : "Classify"
                  )}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PatentResults;
