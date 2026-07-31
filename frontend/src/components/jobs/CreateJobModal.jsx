import React from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Button from '../common/Button';

const CreateJobModal = ({ isOpen, onClose, onCreate }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await onCreate(data);
      reset();
      onClose();
    } catch (error) {
      // Error handled by custom hook / toast
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Job Opening">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Senior Frontend Engineer"
            {...register('title', {
              required: 'Job title is required',
              minLength: { value: 3, message: 'Title must be at least 3 characters' },
            })}
            className={`w-full rounded-xl border ${
              errors.title ? 'border-red-500' : 'border-gray-200'
            } px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={5}
            placeholder="Paste requirements, required skills, and key responsibilities..."
            {...register('description', {
              required: 'Job description is required',
              minLength: { value: 10, message: 'Description must be at least 10 characters' },
            })}
            className={`w-full rounded-xl border ${
              errors.description ? 'border-red-500' : 'border-gray-200'
            } px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Job
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateJobModal;
