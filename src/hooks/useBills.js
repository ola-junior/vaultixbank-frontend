import { useState, useCallback } from 'react';
import api from '../services/api';

export const useBills = () => {
  const [providers, setProviders]   = useState([]);
  const [plans, setPlans]           = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingPlans, setLoadingPlans]         = useState(false);
  const [verifying, setVerifying]   = useState(false);
  const [paying, setPaying]         = useState(false);

  const fetchProviders = useCallback(async (category) => {
    setLoadingProviders(true);
    try {
      const res = await api.get(`/bills/providers/${category}`);
      setProviders(res.data.data || []);
    } catch (err) {
      console.error('fetchProviders error:', err);
      setProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  }, []);

  const fetchPlans = useCallback(async (category, providerCode) => {
    setLoadingPlans(true);
    try {
      const res = await api.get(`/bills/plans/${category}/${providerCode}`);
      setPlans(res.data.data || []);
    } catch (err) {
      console.error('fetchPlans error:', err);
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  const verifyRecipient = useCallback(async ({ category, provider, recipient }) => {
    setVerifying(true);
    try {
      const res = await api.post('/bills/verify-recipient', { category, provider, recipient });
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setVerifying(false);
    }
  }, []);

  const payBill = useCallback(async (payload) => {
    setPaying(true);
    try {
      const res = await api.post('/bills/pay', payload);
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setPaying(false);
    }
  }, []);

  const fetchHistory = useCallback(async ({ page = 1, category = 'all' } = {}) => {
    const res = await api.get('/bills/history', { params: { page, category } });
    return res.data;
  }, []);

  return {
    providers, plans,
    loadingProviders, loadingPlans,
    verifying, paying,
    fetchProviders, fetchPlans,
    verifyRecipient, payBill, fetchHistory,
    resetPlans: () => setPlans([]),
  };
};