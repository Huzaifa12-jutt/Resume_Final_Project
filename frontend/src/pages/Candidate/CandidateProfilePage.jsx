import React, { useEffect, useRef, useState } from 'react';
import { FiUser, FiFileText, FiUploadCloud, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { atsService } from '../../services/atsService';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const CandidateProfilePage = () => {
  useDocumentTitle('My Profile');
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeName, setResumeName] = useState('No resume uploaded yet');
  const [skills, setSkills] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await atsService.getProfile();
        setProfile(data);
        setSkills(Array.isArray(data.skills) && data.skills.length ? data.skills : ['Upload a resume to extract skills']);
      } catch (error) {
        setProfile(null);
        setSkills(['Upload a resume to extract skills']);
      }

      try {
        const urlResult = await atsService.getResumeUrl();
        setResumeUrl(urlResult.url);
        setResumeName(urlResult.file_name || 'Candidate Resume PDF');
      } catch {
        setResumeUrl('');
        setResumeName('No resume uploaded yet');
      }
    };

    loadProfile();
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF resumes are supported.');
      return;
    }

    setIsUploading(true);
    try {
      await atsService.uploadResume(file);
      toast.success('Resume uploaded successfully. You can now apply to jobs.');
      const profileData = await atsService.getProfile();
      setProfile(profileData);
      setSkills(Array.isArray(profileData.skills) && profileData.skills.length ? profileData.skills : ['Resume uploaded, parsing skills...']);
      const urlResult = await atsService.getResumeUrl();
      setResumeUrl(urlResult.url);
      setResumeName(file.name);
    } catch (error) {
      toast.error(error.message || 'Unable to upload resume.');
    } finally {
      setIsUploading(false);
      event.target.value = null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Candidate Profile & Resume</h1>
        <p className="text-xs text-gray-500 mt-0.5">Upload your resume and keep your profile ready for AI job matching.</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
          <div className="h-16 w-16 rounded-full bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center">
            {user?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-xs text-gray-500">{user?.title || 'Software Engineer'}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
            <FiFileText className="mr-2 text-indigo-600" /> Active Resume PDF
          </h3>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50/50">
            <FiUploadCloud className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800 truncate">{resumeName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{resumeUrl ? 'Resume available for applications' : 'Upload a PDF resume before applying for jobs'}</p>
            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading…' : resumeUrl ? 'Replace Resume PDF' : 'Upload Resume PDF'}
              </Button>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  View uploaded resume
                </a>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
            <FiAward className="mr-2 text-indigo-600" /> Extracted Skills Overview
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((s, idx) => (
                <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100">
                  {s}
                </span>
              ))
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">Resume upload and parsing pending</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CandidateProfilePage;
