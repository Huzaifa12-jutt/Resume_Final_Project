import React, { useState, useRef } from 'react';
import { FiUploadCloud, FiFile, FiX, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Button from '../common/Button';

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateAndAddFiles = (files) => {
    const validFiles = [];
    const newFileNames = new Set(selectedFiles.map((f) => f.name));

    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    Array.from(files).forEach((file) => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        toast.error(`${file.name} is not a supported file. Only PDF, PNG, JPG, and JPEG are allowed.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds maximum file size (10MB).`);
        return;
      }
      if (newFileNames.has(file.name)) {
        toast.error(`${file.name} is already selected.`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      validateAndAddFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);

    try {
      await onUpload(selectedFiles, (progress) => {
        setUploadProgress(progress);
      });
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      // Handled by custom hook/axios
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCloseModal = () => {
    if (isUploading) return;
    setSelectedFiles([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Bulk Upload Candidate Resumes">
      <div className="space-y-4">
        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50'
              : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            className="hidden"
          />
          <div className="flex justify-center mb-3 text-indigo-600">
            <FiUploadCloud className="h-12 w-12" />
          </div>
          <p className="text-sm font-semibold text-gray-800">
            Click to browse or drag & drop candidate resumes here
          </p>
          <p className="text-xs text-indigo-600 mt-1">Upload multiple resumes and evaluate them instantly against the active job description.</p>
          <p className="text-xs text-gray-400 mt-1">Supports PDF, PNG, JPG, and JPEG files up to 10MB each</p>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">
              Selected Files ({selectedFiles.length})
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <FiFile className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span className="truncate text-gray-700 font-medium">{file.name}</span>
                    <span className="text-xs text-gray-400">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  {!isUploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span>Uploading files...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <Button
            variant="secondary"
            onClick={handleCloseModal}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartUpload}
            isLoading={isUploading}
            disabled={selectedFiles.length === 0}
            icon={FiCheckCircle}
          >
            Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadModal;
