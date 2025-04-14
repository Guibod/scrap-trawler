import React, { createContext, useContext, useState, useEffect } from "react";
import CardService from "~/resources/domain/services/card.service";
import { CardLanguage } from "~/resources/storage/entities/card.entity"
import { addToast } from "@heroui/react"
import type { CardDbo } from "~/resources/domain/dbos/card.dbo"
import type { FuseResult } from "fuse.js"

export type CardContextType = {
  getCard: (name: string) => Promise<CardDbo | null>;
  searchCard: (query: string, langs?: CardLanguage[]) => Promise<CardDbo[]>;
  searchCards: (query: string, langs?: CardLanguage[]) => Promise<FuseResult<CardDbo>[]>;
  buildIndex: () => Promise<void>;
  isIndexing: boolean;
  indexingProgress: number | null;
  indexingSize: number | null;
  indexSize: number | null;
};

export const CardContext = createContext<CardContextType | null>(null);

type CardProviderProps = {
  children: React.ReactNode;
  cardService?: CardService;
}

export const CardProvider: React.FC<CardProviderProps> = ({ children, cardService = CardService.getInstance() }) => {
  const [isIndexing, setIsIndexing] = useState(false);
  const [progress, setProgress] = useState<{ progress: number, total: number } | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    cardService.onIndexingStart(() => {
      setIsIndexing(true)
      addToast({
        title: "Card indexation started",
        description: "The indexation process has started. This may take a while.",
        severity: "primary",
        timeout: 500,
      });
    });
    cardService.onIndexingComplete((total) => {
      setIsIndexing(false)
      setTotal(total)
      addToast({
        title: "Card indexation complete",
        description: "Search features are now available.",
        severity: "success"
      });
    });
    cardService.onIndexingProgress((progress, total) => {
      setProgress({ progress, total });
    }, 1000);
  }, [cardService]);

  const contextValue: CardContextType = {
    getCard: cardService.getCard.bind(cardService),
    searchCard: cardService.searchCard.bind(cardService),
    searchCards: cardService.searchCard.bind(cardService),
    buildIndex: cardService.buildIndex.bind(cardService),
    isIndexing,
    indexingProgress: progress?.progress,
    indexingSize: progress?.total,
    indexSize: total
  };

  return <CardContext.Provider value={contextValue}>{children}</CardContext.Provider>;
};

export const useCards = () => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error("useCards must be used within a CardProvider");
  }
  return context;
};
