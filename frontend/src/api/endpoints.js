export const endpoints = {
  health: '/health',
  jobs: '/jobs',
  job: (jobId) => `/jobs/${jobId}`,
  candidates: (jobId) => `/jobs/${jobId}/candidates`,
  sampleCandidates: (jobId) => `/jobs/${jobId}/candidates/sample`,
  candidate: (jobId, candidateId) => `/jobs/${jobId}/candidates/${candidateId}`,
  rank: (jobId) => `/jobs/${jobId}/rank`,
  export: (jobId) => `/jobs/${jobId}/export`,
  chat: (jobId) => `/jobs/${jobId}/chat`,
  chatHistory: (jobId) => `/jobs/${jobId}/chat/history`,
  gmail: {
    auth: '/gmail/auth',
    callback: '/gmail/auth/callback',
    fetch: '/gmail/fetch',
    status: '/gmail/status',
    disconnect: '/gmail/disconnect',
  },
};
