import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  subscribeCollegeEvents,
  createEventRecord,
  updateEventRecord,
  deleteEventRecord,
  cancelEventRecord,
  endEventRecord,
  fetchEventParticipants,
  joinEventRecord,
  leaveEventRecord,
  getLocalParticipants
} from '../services/eventService.js';
import { useAuth } from './AuthContext';
import { useLocation } from './LocationContext';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const locationCtx = useLocation();

  const [events, setEvents] = useState([]);
  const [participantsList, setParticipantsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorNotification, setErrorNotification] = useState(null);
  const [successNotification, setSuccessNotification] = useState(null);

  // Real-time subscription scoped strictly to currentUser's collegeCode!
  // Never shows fake/sample events — a new college/student sees [] immediately.
  useEffect(() => {
    if (!currentUser?.collegeCode) {
      setEvents([]);
      setParticipantsList([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsub = subscribeCollegeEvents(currentUser.collegeCode, (collegeEvents) => {
      setEvents(collegeEvents);
      const parts = getLocalParticipants().filter(
        p => !p.collegeCode || p.collegeCode === currentUser.collegeCode
      );
      setParticipantsList(parts);
      setIsLoading(false);
    });

    return () => unsub && unsub();
  }, [currentUser?.collegeCode, currentUser?.uid]);

  useEffect(() => {
    if (errorNotification || successNotification) {
      const timer = setTimeout(() => {
        setErrorNotification(null);
        setSuccessNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorNotification, successNotification]);

  const selectedEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId || e.eventId === selectedEventId) || null;
  }, [events, selectedEventId]);

  const isStudentJoined = (eventId) => {
    if (!currentUser || currentUser.role !== 'student') return false;
    return participantsList.some(
      p => p.eventId === eventId && p.studentId === currentUser.uid && p.sharingStatus !== 'Left'
    );
  };

  const getStudentParticipation = (eventId) => {
    if (!currentUser) return null;
    return participantsList.find(
      p => p.eventId === eventId && p.studentId === currentUser.uid && p.sharingStatus !== 'Left'
    ) || null;
  };

  const createEvent = async (eventFormData) => {
    try {
      setErrorNotification(null);
      const newEvt = await createEventRecord(eventFormData, currentUser);
      setEvents(prev => [newEvt, ...prev.filter(e => e.id !== newEvt.id)]);
      setSuccessNotification(`Event "${newEvt.title}" published for ${currentUser.collegeName || 'your college'}!`);
      return newEvt;
    } catch (err) {
      setErrorNotification(err.message);
      throw err;
    }
  };

  const updateEvent = async (eventId, updateData) => {
    try {
      setErrorNotification(null);
      const updated = await updateEventRecord(eventId, updateData, currentUser);
      setEvents(prev => prev.map(e => (e.id === eventId || e.eventId === eventId) ? updated : e));
      setSuccessNotification('Event updated successfully.');
      return updated;
    } catch (err) {
      setErrorNotification(err.message);
      throw err;
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      setErrorNotification(null);
      await deleteEventRecord(eventId, currentUser);
      setEvents(prev => prev.filter(e => e.id !== eventId && e.eventId !== eventId));
      setSuccessNotification('Event deleted.');
      return true;
    } catch (err) {
      setErrorNotification(err.message);
      throw err;
    }
  };

  const cancelEvent = async (eventId) => {
    try {
      setErrorNotification(null);
      const cancelled = await cancelEventRecord(eventId, currentUser);
      setEvents(prev => prev.map(e => (e.id === eventId || e.eventId === eventId) ? cancelled : e));
      if (locationCtx?.endLocationSharingForEvent) {
        locationCtx.endLocationSharingForEvent(eventId);
      }
      setParticipantsList(getLocalParticipants());
      setSuccessNotification('Event cancelled.');
      return cancelled;
    } catch (err) {
      setErrorNotification(err.message);
      throw err;
    }
  };

  const endEvent = async (eventId) => {
    try {
      setErrorNotification(null);
      const ended = await endEventRecord(eventId, currentUser);
      setEvents(prev => prev.map(e => (e.id === eventId || e.eventId === eventId) ? ended : e));
      if (locationCtx?.endLocationSharingForEvent) {
        locationCtx.endLocationSharingForEvent(eventId);
      }
      setParticipantsList(getLocalParticipants());
      setSuccessNotification('Event ended.');
      return ended;
    } catch (err) {
      setErrorNotification(err.message);
      throw err;
    }
  };

  const fetchParticipants = async (eventId) => {
    return await fetchEventParticipants(eventId, currentUser);
  };

  const joinEvent = async (eventId, sharingConsent = true) => {
    try {
      setErrorNotification(null);
      const result = await joinEventRecord(eventId, currentUser, sharingConsent);
      setEvents(prev => prev.map(e => (e.id === eventId || e.eventId === eventId) ? result.event : e));
      setParticipantsList(getLocalParticipants());
      setSuccessNotification(`Joined "${result.event.title}"!`);
      return result;
    } catch (err) {
      setErrorNotification(err.message);
      throw err;
    }
  };

  const leaveEvent = async (eventId) => {
    try {
      setErrorNotification(null);
      const result = await leaveEventRecord(eventId, currentUser);
      setEvents(prev => prev.map(e => (e.id === eventId || e.eventId === eventId) ? result.event : e));
      setParticipantsList(getLocalParticipants());
      setSuccessNotification('Unregistered from event.');
      return result;
    } catch (err) {
      setErrorNotification(err.message);
      throw err;
    }
  };

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

  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      if (activeTab === 'upcoming' && evt.status !== 'Upcoming' && evt.status !== 'Ongoing') return false;
      if (activeTab === 'completed' && evt.status !== 'Completed') return false;
      if (activeTab === 'cancelled' && evt.status !== 'Cancelled') return false;
      if (activeTab === 'created' && (!currentUser || evt.teacherId !== currentUser.uid)) return false;
      if (activeTab === 'joined') {
        if (!currentUser) return false;
        const joined = participantsList.some(
          p => (p.eventId === evt.id || p.eventId === evt.eventId) && p.studentId === currentUser.uid && p.sharingStatus !== 'Left'
        );
        if (!joined) return false;
      }
      if (activeTab === 'history' && evt.status !== 'Completed') return false;

      const matchesFilter = filterStatus === 'All' ? true : (evt.status || '').toLowerCase() === filterStatus.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (evt.title && evt.title.toLowerCase().includes(q)) ||
        (evt.venue && evt.venue.toLowerCase().includes(q)) ||
        (evt.description && evt.description.toLowerCase().includes(q));

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
        isLoading,
        filterStatus,
        activeTab,
        searchQuery,
        errorNotification,
        successNotification,
        setSelectedEventId,
        setFilterStatus,
        setActiveTab,
        setSearchQuery,
        createEvent,
        updateEvent,
        deleteEvent,
        cancelEvent,
        endEvent,
        fetchParticipants,
        joinEvent,
        leaveEvent,
        isStudentJoined,
        getStudentParticipation
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
