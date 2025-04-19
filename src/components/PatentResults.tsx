
import React, { useState } from "react";
import { SearchResult, Classification } from "../types/patent";
import { classifyPatent } from "../services/api";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Loader, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface PatentResultsProps {
  results: SearchResult[];
}

const PatentResults: React.FC<PatentResultsProps> = ({ results }) => {
  const [classifying, setClassifying] = useState<Record<string, boolean>>({});
  const [classifications, setClassifications] = useState<Record<string, Classification[]>>({});
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});
  const [showDebugInfo, setShowDebugInfo] = useState<Record<string, boolean>>({});

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

  const toggleDebugInfo = (patentId: string) => {
    setShowDebugInfo(prev => ({ 
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
        const isDebugVisible = showDebugInfo[patentId] || false;
        
        return (
          <div key={patentId} className="patent-card">
            <div className="patent-card-header">
              <h2 className="patent-card-title">{result.patent.title}</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-6 w-6"
                      onClick={() => toggleDebugInfo(patentId)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle debugging information</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
              
              {/* Matched Keywords */}
              {result.matched_keywords && result.matched_keywords.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Matched Keywords:</p>
                  <div className="flex flex-wrap gap-1">
                    {result.matched_keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
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
              
              {/* Debug Info */}
              {isDebugVisible && result.debugging && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs">
                  <h4 className="font-medium text-sm mb-2">Debugging Information</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Standard Score:</span>
                      <span>{(result.debugging.original_score || 0 * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Enhanced Score:</span>
                      <span>{(result.debugging.enhanced_score || 0 * 100).toFixed(0)}%</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <span className="font-medium">Weights Used:</span>
                      <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-1">
                        {result.debugging.weights_used && Object.entries(result.debugging.weights_used).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Classifications */}
              <div className="patent-card-meta mt-4">
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
