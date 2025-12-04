import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DataUpload from './components/DataUpload';
import RankingTable from './components/RankingTable';
import { School, Event, AppState } from './types';
import { getInitialSchools } from './data';

const INITIAL_EVENTS: Event[] = [];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem('schools');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: ensure participatedEventIds exists for older data
      return parsed.map((s: any) => ({
        ...s,
        participatedEventIds: s.participatedEventIds || []
      }));
    }
    return getInitialSchools();
  });
  
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('schools', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  // Handle Restore Data
  const handleRestoreData = (data: AppState) => {
    if (data.schools) setSchools(data.schools);
    if (data.events) setEvents(data.events);
  };

  // Logic to handle "Excel" upload processing
  const handleUploadData = (eventId: string, rawData: string, dataType: 'Attendance' | 'Submission') => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // Split by new line to simulate Excel rows
    const lines = rawData.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    setSchools(prevSchools => {
      return prevSchools.map(school => {
        // Strict match: Check if the input line EXACTLY contains the NPSN
        // Or fuzzy match: Check if Name is in line (fallback)
        const schoolNpsn = school.npsn.toString().toLowerCase();
        const schoolName = school.name.toLowerCase();

        const isParticipated = lines.some(line => {
            const cleanLine = line.toLowerCase();
            return cleanLine.includes(schoolNpsn) || cleanLine.includes(schoolName);
        });

        if (isParticipated) {
          const currentHistory = school.participatedEventIds || [];
          
          // Prevent double counting if already participated in this event
          if (currentHistory.includes(eventId)) {
            return school;
          }

          // Calculate score
          let scoreToAdd = event.weight;
          
          // Speed Bonus logic simulation (random for demo if Submission)
          if (dataType === 'Submission') {
            const speedBonus = Math.random() > 0.5 ? 5 : 2; // Randomly assign 'Fast' or 'Normal'
            scoreToAdd += speedBonus;
          }

          return {
            ...school,
            totalScore: school.totalScore + scoreToAdd,
            eventsParticipated: school.eventsParticipated + 1,
            participatedEventIds: [...currentHistory, eventId]
          };
        }
        return school;
      });
    });
  };

  const handleAddEvent = (newEvent: Omit<Event, 'id'>) => {
    const event: Event = { ...newEvent, id: `e${Date.now()}` };
    setEvents([...events, event]);
    
    // Increment total possible events for all schools
    setSchools(prev => prev.map(s => ({
      ...s,
      totalEventsPossible: s.totalEventsPossible + 1
    })));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard schools={schools} events={events} />;
      case 'upload':
        return <DataUpload schools={schools} events={events} onUpload={handleUploadData} onAddEvent={handleAddEvent} onRestore={handleRestoreData} />;
      case 'ranking':
      case 'schools': // Reusing table for now
        return <RankingTable schools={schools} />;
      default:
        return <Dashboard schools={schools} events={events} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;