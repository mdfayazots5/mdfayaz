import React, { useState, useEffect } from "react";
import { PortfolioData } from "../models/portfolio.model";
import { MASTER_DATA } from "../mocks/portfolio.mock";
import { getEntries } from "../services/api";

export const usePortfolioData = (portfolioType: number) => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getEntries()
      .then((entries) => {
        if (isMounted) {
          setData({
            master: {
              ...MASTER_DATA,
              projects: entries,
            },
          });
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err.message || "Failed to fetch portfolio data");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [portfolioType]);

  return { data, loading, error };
};


