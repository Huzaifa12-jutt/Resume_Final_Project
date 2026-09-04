import api from '../api/axios';
import { endpoints } from '../api/endpoints';

export const candidatesService = {
  upload: (jobId, files, onUploadProgress) => {
    const data = new FormData();
    files.forEach((file) => data.append('files', file));
    return api.post(endpoints.candidates(jobId), data, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress }).then((r) => r.data);
  },
  addSamples: (jobId) => api.post(endpoints.sampleCandidates(jobId)).then((r) => r.data),
  get: (jobId, candidateId) => api.get(endpoints.candidate(jobId, candidateId)).then((r) => r.data),
  getResumeUrl: (jobId, candidateId) => api.get(endpoints.candidateResumeUrl(jobId, candidateId)).then((r) => r.data),
  remove: (jobId, candidateId) => api.delete(endpoints.candidate(jobId, candidateId)),
  rank: (jobId) => api.post(endpoints.rank(jobId)).then((r) => r.data),
  export: (jobId) => api.get(endpoints.export(jobId), { responseType: 'blob' }).then((r) => r.data),
};
