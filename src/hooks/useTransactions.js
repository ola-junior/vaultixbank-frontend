import { useState, useEffect } from 'react';
import api from '../services/api';

export const useTransactions = (filters = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1,
    limit: 20
  });

  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await api.get('/transactions', { params });
      const responseData = response.data;
      const transactionPayload = responseData?.data ?? responseData ?? [];
      setTransactions(Array.isArray(transactionPayload) ? transactionPayload : []);
      setPagination({
        page: responseData?.page ?? pagination.page,
        total: responseData?.total ?? 0,
        pages: responseData?.pages ?? 1,
        limit: pagination.limit
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchTransactions(pagination.page);
  };

  const nextPage = () => {
    if (pagination.page < pagination.pages) {
      fetchTransactions(pagination.page + 1);
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      fetchTransactions(pagination.page - 1);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.pages) {
      fetchTransactions(page);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, [JSON.stringify(filters)]);

  return {
    transactions,
    loading,
    error,
    pagination,
    refresh,
    nextPage,
    prevPage,
    goToPage,
    setFilters: (newFilters) => {
      Object.assign(filters, newFilters);
      fetchTransactions(1);
    }
  };
};