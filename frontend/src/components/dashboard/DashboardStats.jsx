import React from 'react';
import { FiUsers, FiCheckCircle, FiStar, FiTrendingUp, FiTrendingDown, FiShield, FiAlertTriangle, FiXCircle } from 'react-icons/fi';
import Card from '../common/Card';

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Candidates',
      value: stats.totalCandidates,
      icon: FiUsers,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Ranked Candidates',
      value: stats.rankedCandidates,
      icon: FiCheckCircle,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Average Score',
      value: stats.averageScore !== null ? `${stats.averageScore}%` : 'N/A',
      icon: FiStar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Highest Score',
      value: stats.highestScore !== null ? `${stats.highestScore}%` : 'N/A',
      icon: FiTrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Lowest Score',
      value: stats.lowestScore !== null ? `${stats.lowestScore}%` : 'N/A',
      icon: FiTrendingDown,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Green Tier (≥75%)',
      value: stats.greenCandidates,
      icon: FiShield,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-100/60',
    },
    {
      title: 'Yellow Tier (50-74%)',
      value: stats.yellowCandidates,
      icon: FiAlertTriangle,
      color: 'text-amber-700',
      bgColor: 'bg-amber-100/60',
    },
    {
      title: 'Red Tier (<50%)',
      value: stats.redCandidates,
      icon: FiXCircle,
      color: 'text-rose-700',
      bgColor: 'bg-rose-100/60',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="p-4 flex items-center space-x-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bgColor} ${card.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 line-clamp-1">{card.title}</p>
              <p className="text-lg font-extrabold text-gray-900 mt-0.5">{card.value}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;
