import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import atsService from '../services/atsService';

export const useJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name, candidates

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await atsService.listRecruiterJobs();
      setJobs(Array.isArray(data) ? data : data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const createJob = async (jobData) => {
    try {
      const newJob = await atsService.createRecruiterJob(jobData);
      toast.success('Job created successfully!');
      await fetchJobs();
      return newJob;
    } catch (error) {
      console.error('Failed to create job:', error);
      throw error;
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await atsService.deleteRecruiterJob(jobId);
      toast.success('Job deleted successfully!');
      await fetchJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
      throw error;
    }
  };

  const filteredAndSortedJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const titleMatch = job.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = job.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch || descMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        }
        if (sortBy === 'name') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'candidates') {
          return (b.total_candidates || b.candidates?.length || 0) - (a.total_candidates || a.candidates?.length || 0);
        }
        return 0;
      });
  }, [jobs, searchQuery, sortBy]);

  return {
    jobs: filteredAndSortedJobs,
    rawJobs: jobs,
    isLoading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    fetchJobs,
    createJob,
    deleteJob,
  };
};

export default useJobs;