import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';

export const EditEventModal = ({ isOpen, onClose, event }) => {
  const { updateEvent } = useEvents();
  const { currentUser } = useAuth();
  const { collegeZones } = useLocation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    date: '',
    startTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        venue: event.venue || '',
        date: event.date || '',
        startTime: event.startTime || ''
      });
      setFormError('');
    }
  }, [event]);

  if (!event) return null;

  const isOwner = currentUser?.role === 'teacher' && (!event.collegeCode || event.collegeCode === currentUser.collegeCode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!isOwner) return setFormError('Unauthorized.');
    try {
      setIsSubmitting(true);
      await updateEvent(event.id || event.eventId, formData);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setFormError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Event" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}
        <div>
          <label className="block font-bold uppercase text-[10px] mb-1">Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2"
          />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="font-bold uppercase text-[10px]">Place *</label>
            {collegeZones.length > 0 && (
              <select
                onChange={(e) => e.target.value && setFormData({ ...formData, venue: e.target.value })}
                defaultValue=""
                className="text-[11px] bg-cyan-50 dark:bg-cyan-950 rounded px-2 py-0.5"
              >
                <option value="">Pick zone...</option>
                {collegeZones.map((z) => <option key={z.id} value={z.name}>{z.name}</option>)}
              </select>
            )}
          </div>
          <input
            type="text"
            required
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2"
          />
          <input
            type="text"
            required
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2"
          />
        </div>
        <textarea
          rows={3}
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="cyan" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditEventModal;
