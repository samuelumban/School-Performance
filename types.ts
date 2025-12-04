export type SchoolType = 'SMAK' | 'SMTK';

export type PerformanceLevel = 'Excellent' | 'Good' | 'Nice' | 'Bad';

export interface School {
  id: string; // Will be the NPSN
  npsn: string;
  name: string;
  type: SchoolType;
  status: string;
  province: string;
  totalScore: number;
  eventsParticipated: number;
  totalEventsPossible: number;
  participatedEventIds: string[]; // List of IDs of events this school participated in
}

export interface Event {
  id: string;
  name: string;
  date: string;
  type: 'Socialization' | 'DataRequest' | 'Response';
  weight: number; // Points awarded for participation
  description: string;
}

export interface AppState {
  schools: School[];
  events: Event[];
}