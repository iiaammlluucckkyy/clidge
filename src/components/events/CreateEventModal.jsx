import React, { useState } from 'react';
import { PlusCircle, Calendar, MapPin, Shield, Users, Clock, BookOpen } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { CAMPUS_ZONES } from '../../data/campusZones';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';

export const CreateEventModal = ({ isOpen, onClose }) => {
  const { createEvent } = useEvents();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Technical Workshop',
    department: currentUser?.department || 'Computer Science and Engineering',
    venue: CAMPUS_ZONES[0].name,
    zoneId: CAMPUS_ZONES[0].id,
    geofenceRadius: 65,
    date: '2026-11-20',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    maxCapacity: 150,
    coordinator: currentUser?.name || 'Faculty Coordinator',
    coordinatorContact: currentUser?.email || 'coordinator@muthayammal.edu.in',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVenueChange = (e) => {
    const selectedZone = CAMPUS_ZONES.find(z => z.name === e.target.value) || CAMPUS_ZONES[0];
    setFormData(prev => ({
      ...prev,
      venue: selectedZone.name,
      zoneId: selectedZone.id,
      geofenceRadius: selectedZone.radiusMeters
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      createEvent(formData);
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Campus Event"
      subtitle="Define session schedule, geofenced venue perimeter, and student capacity"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
            Event / Session Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Workshop on Edge Computing & Distributed Systems"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            >
              <option value="Technical Workshop">Technical Workshop</option>
              <option value="Guest Lecture">Guest Lecture</option>
              <option value="Technical Seminar">Technical Seminar</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Special Class">Special Class</option>
              <option value="Cultural / Sports">Cultural / Sports</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Host Department
            </label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Venue Selection & Geofence Radius */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Campus Venue (Geofenced Zone)
            </label>
            <select
              value={formData.venue}
              onChange={handleVenueChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            >
              {CAMPUS_ZONES.map((zone) => (
                <option key={zone.id} value={zone.name}>
                  {zone.name} ({zone.building})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Radius (Meters)
            </label>
            <input
              type="number"
              min="20"
              max="200"
              value={formData.geofenceRadius}
              onChange={(e) => setFormData({ ...formData, geofenceRadius: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Date & Time Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Start Time
            </label>
            <input
              type="text"
              value={formData.startTime}
              placeholder="09:30 AM"
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              End Time
            </label>
            <input
              type="text"
              value={formData.endTime}
              placeholder="04:30 PM"
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Capacity & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Max Students
            </label>
            <input
              type="number"
              min="10"
              max="1000"
              value={formData.maxCapacity}
              onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Brief Overview / Objective
            </label>
            <input
              type="text"
              placeholder="Key topic coverage, speakers, hands-on lab..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="cyan"
            size="sm"
            icon={PlusCircle}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Event...' : 'Publish Campus Event'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateEventModal;
