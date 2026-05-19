import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const usePrizePool = () => {
  const [prizePool, setPrizePool] = useState({
    total_pool: 0,
    jackpot_pool: 0,
    four_match_pool: 0,
    three_match_pool: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchPrizePool = useCallback(async () => {
    try {
      const res = await api.get('/prize-pool');
      setPrizePool({
        total_pool: Number(res.data.total_pool) || 0,
        jackpot_pool: Number(res.data.jackpot_pool) || 0,
        four_match_pool: Number(res.data.four_match_pool) || 0,
        three_match_pool: Number(res.data.three_match_pool) || 0,
      });
    } catch (error) {
      console.error('Error fetching prize pool:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrizePool();
  }, [fetchPrizePool]);

  return { prizePool, loading, refetch: fetchPrizePool };
};
