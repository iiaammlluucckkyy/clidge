import React, { useState } from 'react';
import {
  PlusCircle,
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

// Realistic sample image presets for college events
const IMAGE_PRESETS = [
  {
    label: 'AI & Computing',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'
  },
  {
    label: 'Seminar & Hall',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60'
  },
  {
    label: 'Hackathon & Lab',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60'
  },
  {
    label: 'Cybersecurity',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60'
  }
];

export const CreateEventModal = ({ isOpen, onClose }) => {
  const { createEvent } = useEvents();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical Workshop',
    department: currentUser?.department || 'Computer Science and Engineering',
    venue: CAMPUS_ZONES[0].name,
    latitude: CAMPUS_ZONES[0].center.lat,
    longitude: CAMPUS_ZONES[0].center.lng,
    radius: CAMPUS_ZONES[0].radiusMeters,
    date: '2026-11-25',
    startTime: '09:30 AM',
    endTime: '04:30 PM',
    maxCapacity: 150,
    imageUrl: IMAGE_PRESETS[0].url
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Auto-populate lat, long, radius when venue preset is changed
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

    if (!formData.title.trim()) {
      setFormError('Please enter the event name.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Please provide a brief event description.');
      return;
    }
    if (!formData.venue.trim()) {
      setFormError('Please specify the campus venue.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createEvent({
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        radius: Number(formData.radius),
        maxCapacity: Number(formData.maxCapacity)
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to create event. Please verify teacher authorization.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Campus Event"
      subtitle="Set session schedule, venue geofence, and capacity"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* 1. Event Name (Title) */}
        <div>
          <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
            Event Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. AI & Machine Learning Workshop"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          />
        </div>

        {/* Category & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
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
              Department
            </label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>
        </div>

        {/* 2. Description */}
        <div>
          <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
            Description *
          </label>
          <textarea
            required
            rows="2"
            placeholder="Brief overview of session topics and prerequisites..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          />
        </div>

        {/* 3. Date, Start Time, End Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Event Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Start Time *
            </label>
            <input
              type="text"
              required
              value={formData.startTime}
              placeholder="09:30 AM"
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              End Time *
            </label>
            <input
              type="text"
              required
              value={formData.endTime}
              placeholder="04:30 PM"
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>
        </div>

        {/* 4. Venue, Latitude, Longitude, Geofence Radius */}
        <div className="p-3.5 bg-cyan-50/40 rounded-2xl border border-cyan-100/80 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-900">
            <Compass className="w-4 h-4 text-cyan-600" />
            <span>Geofenced Venue & Location Coordinates</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Campus Venue Preset
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
                Custom Venue Label
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
                Latitude *
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
                Longitude *
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
                Geofence Radius (m) *
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

        {/* 5. Event Image (Optional) & Max Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Event Banner Image (Optional)</span>
              <span className="text-[10px] font-normal text-slate-400">URL or Preset</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 mb-1.5"
            />
            {/* Image presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500">Presets:</span>
              {IMAGE_PRESETS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: p.url }))}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-cyan-100 text-slate-700 hover:text-cyan-800 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
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

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="cyan"
            size="sm"
            icon={PlusCircle}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Publishing Event...' : 'Publish Campus Event'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateEventModal;
