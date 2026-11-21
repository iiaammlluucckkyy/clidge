import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  fetchAllEvents,
  createEventRecord,
  updateEventRecord,
  cancelEventRecord,
  endEventRecord,
  fetchEventParticipants,
  joinEventRecord,
  leaveEventRecord,
  getLocalParticipants
} from '../services/eventService.js';
import { useAuth } from './AuthContext';
import { useLocation } from './LocationContext';
import { flaskApi } from '../services/flaskApi';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const locationCtx = useLocation();

  const [events, setEvents] = useState([]);
  const [participantsList, setParticipantsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'joined', 'created', 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [errorNotification, setErrorNotification] = useState(null);
  const [successNotification, setSuccessNotification] = useState(null);

  // Load initial events and participants
  const refreshEvents = async () => {
    try {
      const data = await fetchAllEvents();
      setEvents(data);
      const parts = getLocalParticipants();
      setParticipantsList(parts);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshEvents();
  }, [currentUser]);

  // Clear notifications after 4 seconds
  useEffect(() => {
    if (errorNotification || successNotification) {
      const timer = setTimeout(() => {
        setErrorNotification(null);
        setSuccessNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorNotification, successNotification]);

  // Selected event
  const selectedEvent = useMemo(() => {
    return events.find(e => (e.id === selectedEventId || e.eventId === selectedEventId)) || null;
  }, [events, selectedEventId]);

  // Check if current logged-in student has joined an event
  const isStudentJoined = (eventId) => {
    if (!currentUser || currentUser.role !== 'student') return false;
    return participantsList.some(
      p => (p.eventId === eventId) && (p.studentId === currentUser.uid) && p.sharingStatus !== 'Left'
    );
  };

  // Get participation record for current student
  const getStudentParticipation = (eventId) => {
    if (!currentUser) return null;
    return participantsList.find(
      p => (p.eventId === eventId) && (p.studentId === currentUser.uid) && p.sharingStatus !== 'Left'
    ) || null;
  };

  // TEACHER: Create Event
  const createEvent = async (eventFormData) => {
    try {
      setErrorNotification(null);
      const newEvt = await createEventRecord(eventFormData, currentUser);
      setEvents(prev => [newEvt, ...prev.filter(e => e.id !== newEvt.id)]);
      setSuccessNotification(`Event "${newEvt.title}" published successfully!`);
      // Notify flask stub if connected
      flaskApi.createEvent(newEvt).catch(() => {});
      return newEvt;
    } catch (err) {
      setErrorNotification(err.message);
      throw err;
    }
  };

  // TEACHER: Edit Event
  const updateEvent = async (eventId, updateData) => {
    try {
      setErrorNotification(null);
      const updated = await updateEventRecord(eventId, updateData, currentUser);
      setEvents(prev => prev.map(e => (e.id === eventId || e.eventId === eventId) ? updated : e));
      setSuccessNotification(`Event updated successfully.`);
      return updated;
    } catch (err) {
      setErrorNotification(err.message);
      throw err;
    }
  };

  // TEACHER: Cancel Event
  const cancelEvent = async (eventId) => {
    try {
      setErrorNotification(null);
      const cancelled = await cancelEventRecord(eventId, currentUser);
      setEvents(prev => prev.map(e => (e.id === eventId || e.eventId === eventId) ? cancelled : e));
      
      // Auto terminate participant location sharing
      if (locationCtx?.endLocationSharingForEvent) {
        locationCtx.endLocationSharingForEvent(eventId);
      }
      const parts = getLocalParticipants();
      setParticipantsList(parts);

      setSuccessNotification('Event has been cancelled. Student location sharing terminated.');
      return cancelled;
    } catch (err) {
      setErrorNotification(err.message);
      throw err;
    }
  };

  // TEACHER: End Event
  const endEvent = async (eventId) => {
    try {
      setErrorNotification(null);
      const ended = await endEventRecord(eventId, currentUser);
      setEvents(prev => prev.map(e => (e.id === eventId || e.eventId === eventId) ? ended : e));

      // Auto terminate participant location sharing
      if (locationCtx?.endLocationSharingForEvent) {
        locationCtx.endLocationSharingForEvent(eventId);
      }
      const parts = getLocalParticipants();
      setParticipantsList(parts);

      setSuccessNotification('Event marked as Completed. Location sharing automatically ended.');
      return ended;
    } catch (err) {
      setErrorNotification(err.message);
      throw err;
    }
  };

  // TEACHER: Fetch Participants
  const fetchParticipants = async (eventId) => {
    try {
      return await fetchEventParticipants(eventId, currentUser);
    } catch (err) {
      setErrorNotification(err.message);
      throw err;
    }
  };

  // STUDENT: Join Event
  const joinEvent = async (eventId, sharingConsent = true) => {
    try {
      setErrorNotification(null);
      const result = await joinEventRecord(eventId, currentUser, sharingConsent);
      
      // Update local event registeredCount
      setEvents(prev => prev.map(e => (e.id === eventId || e.eventId === eventId) ? result.event : e));
      
      // Update participants list
      const parts = getLocalParticipants();
      setParticipantsList(parts);

      setSuccessNotification(`You have joined "${result.event.title}"! Geofencing sharing active.`);
      return result;
    } catch (err) {
      setErrorNotification(err.message);
      throw err;
    }
  };

  // STUDENT: Leave Event
  const leaveEvent = async (eventId) => {
    try {
      setErrorNotification(null);
      const result = await leaveEventRecord(eventId, currentUser);

      // Update local event registeredCount
      setEvents(prev => prev.map(e => (e.id === eventId || e.eventId === eventId) ? result.event : e));

      // Update participants list
      const parts = getLocalParticipants();
      setParticipantsList(parts);

      // Disable sharing if leaving active event
      if (locationCtx?.activeApprovedEvent?.id === eventId) {
        locationCtx.endLocationSharingForEvent(eventId);
      }

      setSuccessNotification('You have unregistered from the event.');
      return result;
    } catch (err) {
      setErrorNotification(err.message);
      throw err;
    }
  };

  // QR Check-in compatibility helper
  const checkInToEvent = (eventId, qrCode = '') => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId || evt.eventId === eventId) {
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
    setSuccessNotification(`Attendance verified via QR scan at ${timeNow}`);
  };

  // Filtered lists for Teacher and Student views
  const teacherCreatedEvents = useMemo(() => {
    if (!currentUser || currentUser.role !== 'teacher') return [];
    return events.filter(e => e.teacherId === currentUser.uid);
  }, [events, currentUser]);

  const studentJoinedEvents = useMemo(() => {
    if (!currentUser || currentUser.role !== 'student') return [];
    const joinedIds = new Set(
      participantsList
        .filter(p => p.studentId === currentUser.uid && p.sharingStatus !== 'Left')
        .map(p => p.eventId)
    );
    return events.filter(e => joinedIds.has(e.id) || joinedIds.has(e.eventId));
  }, [events, participantsList, currentUser]);

  const upcomingEvents = useMemo(() => {
    return events.filter(e => e.status === 'Upcoming' || e.status === 'Ongoing');
  }, [events]);

  const eventHistory = useMemo(() => {
    return events.filter(e => e.status === 'Completed');
  }, [events]);

  // Filtered events based on search and status
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      // Role-specific tab filtering
      if (activeTab === 'upcoming' && evt.status !== 'Upcoming' && evt.status !== 'Ongoing') return false;
      if (activeTab === 'completed' && evt.status !== 'Completed') return false;
      if (activeTab === 'cancelled' && evt.status !== 'Cancelled') return false;
      if (activeTab === 'created') {
        if (!currentUser || evt.teacherId !== currentUser.uid) return false;
      }
      if (activeTab === 'joined') {
        if (!currentUser) return false;
        const joined = participantsList.some(
          p => (p.eventId === evt.id || p.eventId === evt.eventId) &&
               p.studentId === currentUser.uid &&
               p.sharingStatus !== 'Left'
        );
        if (!joined) return false;
      }
      if (activeTab === 'history') {
        if (evt.status !== 'Completed') return false;
      }

      // Filter status dropdown/pill
      const matchesFilter = filterStatus === 'All' ? true : evt.status.toLowerCase() === filterStatus.toLowerCase();

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (evt.title && evt.title.toLowerCase().includes(q)) ||
        (evt.department && evt.department.toLowerCase().includes(q)) ||
        (evt.venue && evt.venue.toLowerCase().includes(q)) ||
        (evt.category && evt.category.toLowerCase().includes(q));

      return matchesFilter && matchesSearch;
    });
  }, [events, participantsList, activeTab, filterStatus, searchQuery, currentUser]);

  return (
    <EventContext.Provider
      value={{
        events,
        filteredEvents,
        upcomingEvents,
        eventHistory,
        teacherCreatedEvents,
        studentJoinedEvents,
        participantsList,
        selectedEvent,
        selectedEventId,
        filterStatus,
        activeTab,
        searchQuery,
        isLoading,
        errorNotification,
        successNotification,
        setSelectedEventId,
        setFilterStatus,
        setActiveTab,
        setSearchQuery,
        setErrorNotification,
        setSuccessNotification,
        refreshEvents,
        isStudentJoined,
        getStudentParticipation,
        createEvent,
        updateEvent,
        cancelEvent,
        endEvent,
        fetchParticipants,
        joinEvent,
        leaveEvent,
        checkInToEvent
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
