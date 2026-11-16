import React, { createContext, useContext, useState } from 'react';
import { INITIAL_EVENTS } from '../data/sampleEvents';
import { flaskApi } from '../services/flaskApi';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedEvent = events.find(e => e.id === selectedEventId) || null;

  const joinEvent = (eventId) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          isJoined: true,
          registeredCount: evt.registeredCount + 1,
          studentAttendanceStatus: 'Registered (Pending Check-in)'
        };
      }
      return evt;
    }));
  };

  const leaveEvent = (eventId) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          isJoined: false,
          registeredCount: Math.max(0, evt.registeredCount - 1),
          studentAttendanceStatus: 'Not Registered',
          studentCheckInTime: null
        };
      }
      return evt;
    }));
  };

  const checkInToEvent = (eventId, qrCode = '') => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          isJoined: true,
          currentlyPresent: (evt.currentlyPresent || 0) + 1,
          studentAttendanceStatus: 'Checked In',
          studentCheckInTime: timeNow
        };
      }
      return evt;
    }));
  };

  const createEvent = (eventData) => {
    const newEvent = {
      id: `evt-2026-${String(events.length + 1).padStart(3, '0')}`,
      status: 'Upcoming',
      registeredCount: 1,
      currentlyPresent: 0,
      attendanceRate: 0,
      isJoined: false,
      studentAttendanceStatus: 'Not Registered',
      studentCheckInTime: null,
      qrCodeKey: `CLIDGE-EVT-NEW-${Date.now()}`,
      agenda: eventData.agenda || [
        '09:30 AM - Welcome & Introduction',
        '11:00 AM - Keynote Address & Technical Track',
        '02:00 PM - Practical Hands-on Workshop & Q&A'
      ],
      ...eventData
    };

    setEvents(prev => [newEvent, ...prev]);
    // Notify flask stub if connected
    flaskApi.createEvent(newEvent).catch(() => {});
    return newEvent;
  };

  const filteredEvents = events.filter(evt => {
    const matchesFilter = filterStatus === 'All' ? true : evt.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <EventContext.Provider
      value={{
        events,
        filteredEvents,
        selectedEvent,
        selectedEventId,
        filterStatus,
        searchQuery,
        setSelectedEventId,
        setFilterStatus,
        setSearchQuery,
        joinEvent,
        leaveEvent,
        checkInToEvent,
        createEvent
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
