import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import atsService from '../services/atsService';
import { candidatesService } from '../services/candidatesService';

export const useJobDashboard = (jobId) => {
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Operation loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingSamples, setIsGeneratingSamples] = useState(false);
  const [isRanking, setIsRanking] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all'); // all, green, yellow, red
  const [sortBy, setSortBy] = useState('rank'); // rank, score, name

  // Fetch job & candidates
  const fetchDashboardData = useCallback(async () => {
    if (!jobId) return;
    setIsLoading(true);
    try {
      const data = await atsService.getRecruiterJob(jobId);
      setJob(data.job || data);
      const candidatesList = data.candidates || [];
      // Assign overall_score to score to fix mismatch if needed, though backend now returns score too.
      setCandidates(candidatesList.map(c => ({
        ...c,
        score: c.score ?? c.overall_score
      })));
    } catch (error) {
      console.error('Failed to fetch job details:', error);
      toast.error('Failed to load job data');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Upload Resumes
  const uploadCandidates = async (files, onProgress) => {
    setIsUploading(true);
    try {
      await candidatesService.upload(jobId, files, onProgress);
      toast.success('Resumes uploaded successfully!');
      await fetchDashboardData();
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Generate Samples
  const generateSamples = async () => {
    setIsGeneratingSamples(true);
    try {
      await candidatesService.addSamples(jobId);
      toast.success('Sample candidates generated!');
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to generate sample resumes:', error);
    } finally {
      setIsGeneratingSamples(false);
    }
  };

  // Run Ranking
  const runRanking = async () => {
    setIsRanking(true);
    try {
      await candidatesService.rank(jobId);
      toast.success('AI Ranking completed successfully!');
      await fetchDashboardData();
    } catch (error) {
      console.error('Ranking failed:', error);
    } finally {
      setIsRanking(false);
    }
  };

  // Export CSV
  const exportCSV = async () => {
    setIsExporting(true);
    try {
      const blob = await candidatesService.export(jobId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${job?.title || 'job'}_rankings.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Rankings exported as CSV!');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Delete Candidate
  const deleteCandidate = async (candidateId) => {
    try {
      await candidatesService.remove(jobId, candidateId);
      toast.success('Candidate deleted successfully!');
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to delete candidate:', error);
    }
  };

  // Compute Statistics
  const stats = useMemo(() => {
    const total = candidates.length;
    const rankedList = candidates.filter(
      (c) => c.score !== undefined && c.score !== null && !isNaN(c.score)
    );
    const rankedCount = rankedList.length;

    let totalScore = 0;
    let highest = null;
    let lowest = null;
    let greenCount = 0;
    let yellowCount = 0;
    let redCount = 0;

    rankedList.forEach((c) => {
      const score = Number(c.score);
      totalScore += score;
      if (highest === null || score > highest) highest = score;
      if (lowest === null || score < lowest) lowest = score;

      if (score >= 75) greenCount++;
      else if (score >= 50) yellowCount++;
      else redCount++;
    });

    const averageScore = rankedCount > 0 ? Math.round(totalScore / rankedCount) : null;

    return {
      totalCandidates: total,
      rankedCandidates: rankedCount,
      averageScore,
      highestScore: highest !== null ? Math.round(highest) : null,
      lowestScore: lowest !== null ? Math.round(lowest) : null,
      greenCandidates: greenCount,
      yellowCandidates: yellowCount,
      redCandidates: redCount,
    };
  }, [candidates]);

  // Filtered and Sorted Candidates List
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        // Search query
        const query = searchQuery.toLowerCase();
        const nameMatch = c.name?.toLowerCase().includes(query);
        const emailMatch = c.email?.toLowerCase().includes(query);
        const skillsMatch = Array.isArray(c.skills)
          ? c.skills.some((s) => s.toLowerCase().includes(query))
          : c.skills?.toLowerCase().includes(query);
        const matchesSearch = nameMatch || emailMatch || skillsMatch || !query;

        // Tier filter
        const score = Number(c.score || 0);
        let matchesTier = true;
        if (tierFilter === 'green') matchesTier = score >= 75;
        if (tierFilter === 'yellow') matchesTier = score >= 50 && score < 75;
        if (tierFilter === 'red') matchesTier = score < 50;

        return matchesSearch && matchesTier;
      })
      .sort((a, b) => {
        if (sortBy === 'rank') {
          return (a.rank || 999) - (b.rank || 999);
        }
        if (sortBy === 'score') {
          return (b.score || 0) - (a.score || 0);
        }
        if (sortBy === 'name') {
          return (a.name || '').localeCompare(b.name || '');
        }
        return 0;
      });
  }, [candidates, searchQuery, tierFilter, sortBy]);

  return {
    job,
    candidates: filteredCandidates,
    rawCandidates: candidates,
    stats,
    isLoading,
    isUploading,
    isGeneratingSamples,
    isRanking,
    isExporting,
    searchQuery,
    setSearchQuery,
    tierFilter,
    setTierFilter,
    sortBy,
    setSortBy,
    fetchDashboardData,
    uploadCandidates,
    generateSamples,
    runRanking,
    exportCSV,
    deleteCandidate,
  };
};

export default useJobDashboard;