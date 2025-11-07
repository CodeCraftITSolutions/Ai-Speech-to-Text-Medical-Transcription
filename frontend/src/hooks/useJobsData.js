import { message } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { listJobs } from "../api/client.js";
import { useUser } from "../context/UserContext.jsx";

const normaliseStatus = (status) =>
  typeof status === "string" ? status.toLowerCase() : "";

const buildStats = (jobs) => {
  const counts = {
    total: jobs.length,
    completed: 0,
    processing: 0,
    pending: 0,
    failed: 0,
  };

  jobs.forEach((job) => {
    const status = normaliseStatus(job.status);
    switch (status) {
      case "completed":
        counts.completed += 1;
        break;
      case "processing":
        counts.processing += 1;
        break;
      case "failed":
        counts.failed += 1;
        break;
      default:
        counts.pending += 1;
        break;
    }
  });

  return {
    ...counts,
    inQueue: counts.pending + counts.processing,
    readyForReview: counts.completed,
  };
};

const sortByRecentActivity = (jobs) => {
  const parseDate = (value) => {
    if (!value) {
      return 0;
    }
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  return [...jobs]
    .sort((a, b) =>
      parseDate(b.updated_at ?? b.created_at) - parseDate(a.updated_at ?? a.created_at)
    )
    .slice(0, 5);
};

const useJobsData = (options = {}) => {
  const { callWithAuth, isAuthenticated } = useUser();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const autoFetch =
    typeof options === "boolean" ? options : options?.autoFetch ?? true;

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      if (!mountedRef.current) {
        return;
      }
      setJobs([]);
      setLastUpdated(null);
      return;
    }

    if (!mountedRef.current) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await callWithAuth(listJobs);
      if (!mountedRef.current) {
        return;
      }
      const nextJobs = Array.isArray(response) ? response : [];
      setJobs(nextJobs);
      setLastUpdated(new Date());
    } catch (err) {
      if (!mountedRef.current) {
        return;
      }
      const messageText = err?.message ?? "Unable to load jobs";
      setError(messageText);
      message.error(messageText);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [callWithAuth, isAuthenticated]);

  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);

  const stats = useMemo(() => buildStats(jobs), [jobs]);
  const recentJobs = useMemo(() => sortByRecentActivity(jobs), [jobs]);

  const statusBreakdown = useMemo(() => {
    const breakdown = new Map();
    jobs.forEach((job) => {
      const status = normaliseStatus(job.status) || "unknown";
      breakdown.set(status, (breakdown.get(status) ?? 0) + 1);
    });
    return breakdown;
  }, [jobs]);

  return {
    jobs,
    loading,
    error,
    lastUpdated,
    stats,
    recentJobs,
    statusBreakdown,
    refresh,
  };
};

export default useJobsData;
