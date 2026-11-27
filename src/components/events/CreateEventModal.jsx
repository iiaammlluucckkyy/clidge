import React, { useState } from 'react';
import { Compass, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';

export const CreateEventModal = ({ isOpen, onClose }) => {
  const { createEvent } = useEvents();
  const { currentUser } = useAuth();
  const { collegeZones } = useLocation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Campus Event',
    department: currentUser?.department || 'General',
    venue: '',
    latitude: 0,
    longitude: 0,
    radius: 65,
    date: new Date().toISOString().slice(0, 10),
    startTime: '10:00 AM',
    endTime: '04:00 PM',
    maxCapacity: 200
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleVenuePresetChange = (e) => {
    const venueName = e.target.value;
    const matchedZone = collegeZones.find(z => z.name === venueName);
    if (matchedZone) {
      setFormData(prev => ({
        ...prev,
        venue: matchedZone.name,
        latitude: Number(matchedZone.latitude),
        longitude: Number(matchedZone.longitude),
        radius: Number(matchedZone.radius) || 65
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.title.trim()) return setFormError('Please enter event title.');
    if (!formData.venue.trim()) return setFormError('Please enter event place.');
    if (!formData.description.trim()) return setFormError('Please enter event description.');

    try {
      setIsSubmitting(true);
      await createEvent({
        ...formData,
        latitude: Number(formData.latitude) || 0,
        longitude: Number(formData.longitude) || 0,
        radius: Number(formData.radius) || 65
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to create event.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create College Event" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div>
          <label className="block font-bold uppercase text-[10px] mb-1">Event Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Technical Seminar"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2.5"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold uppercase text-[10px]">Place / Venue *</label>
            {collegeZones.length > 0 && (
              <select
                onChange={handleVenuePresetChange}
                defaultValue=""
                className="text-[11px] bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200 rounded-lg px-2 py-0.5"
              >
                <option value="">Fill from saved zones...</option>
                {collegeZones.map((z) => (
                  <option key={z.id} value={z.name}>{z.name}</option>
                ))}
              </select>
            )}
          </div>
          <input
            type="text"
            required
            placeholder="e.g. Main Auditorium"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold uppercase text-[10px] mb-1">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-bold uppercase text-[10px] mb-1">Time *</label>
            <input
              type="text"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold uppercase text-[10px] mb-1">Description *</label>
          <textarea
            rows={3}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="cyan" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Publishing...' : 'Publish Event'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateEventModal;
