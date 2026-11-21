import React, { useState, useEffect } from 'react';
import {
  Save,
  Calendar,
  MapPin,
  Shield,
  Users,
  Clock,
  BookOpen,
  Image as ImageIcon,
  Compass,
  AlertCircle
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { CAMPUS_ZONES } from '../../data/campusZones';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';

export const EditEventModal = ({ isOpen, onClose, event }) => {
  const { updateEvent } = useEvents();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical Workshop',
    venue: '',
    latitude: 11.4982,
    longitude: 78.1634,
    radius: 65,
    date: '',
    startTime: '',
    endTime: '',
    maxCapacity: 150,
    imageUrl: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Populate form with current event properties
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        category: event.category || 'Technical Workshop',
        venue: event.venue || '',
        latitude: event.latitude || 11.4982,
        longitude: event.longitude || 78.1634,
        radius: event.radius || event.geofenceRadius || 65,
        date: event.date || '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        maxCapacity: event.maxCapacity || 150,
        imageUrl: event.imageUrl || ''
      });
      setFormError('');
    }
  }, [event]);

  if (!event) return null;

  // Authorization check: Only owning teacher can edit
  const isOwner = currentUser && (currentUser.role === 'teacher') && (event.teacherId === currentUser.uid);

  const handleVenuePresetChange = (e) => {
    const venueName = e.target.value;
    const matchedZone = CAMPUS_ZONES.find(z => z.name === venueName);
    if (matchedZone) {
      setFormData(prev => ({
        ...prev,
        venue: matchedZone.name,
        latitude: matchedZone.center.lat,
        longitude: matchedZone.center.lng,
        radius: matchedZone.radiusMeters
      }));
    } else {
      setFormData(prev => ({ ...prev, venue: venueName }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isOwner) {
      setFormError('Unauthorized: You can only edit events you have created.');
      return;
    }

    if (!formData.title.trim()) {
      setFormError('Event title cannot be empty.');
      return;
    }
    if (!formData.venue.trim()) {
      setFormError('Campus venue cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateEvent(event.id || event.eventId, {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        radius: Number(formData.radius),
        maxCapacity: Number(formData.maxCapacity)
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to update event.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Event Details"
      subtitle={`Modifying details for "${event.title}"`}
      maxWidth="max-w-2xl"
    >
      {!isOwner ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div>
            <strong className="block font-bold">Permission Denied</strong>
            Only the faculty coordinator who created this event (ID: {event.teacherId}) is authorized to modify its schedule or parameters.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Event Title */}
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="Technical Workshop">Technical Workshop</option>
                <option value="Guest Lecture">Guest Lecture</option>
                <option value="Technical Seminar">Technical Seminar</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Special Class">Special Class</option>
                <option value="Academic Symposium">Academic Symposium</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
                Max Students
              </label>
              <input
                type="number"
                min="5"
                max="1000"
                required
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Event Description *
            </label>
            <textarea
              required
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="text"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="text"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          {/* Venue & Geofence Coordinates */}
          <div className="p-3.5 bg-cyan-50/40 rounded-2xl border border-cyan-100/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-900">
              <Compass className="w-4 h-4 text-cyan-600" />
              <span>Geofenced Venue & Location Coordinates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Preset Venue
                </label>
                <select
                  value={formData.venue}
                  onChange={handleVenuePresetChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                >
                  {CAMPUS_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.name}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Venue Display Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Geofence Radius (m)
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  required
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Event Banner Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="cyan"
              size="sm"
              icon={Save}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EditEventModal;
