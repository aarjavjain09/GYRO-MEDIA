export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  icon: string;
  features: string[];
}

export type MilestoneStatus = 'pending' | 'current' | 'completed';

export interface Milestone {
  id: string;
  name: string;
  description: string;
  status: MilestoneStatus;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  serviceId: string;
  clientName: string;
  clientEmail: string;
  status: 'pending_payment' | 'active' | 'review' | 'completed';
  totalPrice: number;
  deadline: string;
  milestones: Milestone[];
  currentMilestoneIndex: number;
  uploadedFiles?: { name: string; size: string }[];
  notes?: string;
  createdAt: string;
  invoiceId: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  quoteOffer?: {
    serviceName: string;
    price: number;
    deadline: string;
    details: string;
  };
}

export type MeetingPlatform = 'google_meet' | 'zoom' | 'phone' | 'in_person';
export type MeetingStatus = 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';

export interface MeetingReminderLog {
  id: string;
  sentAt: string;
  type: '24h_before' | '1h_before' | 'instant_manual' | 'booking_confirmation';
  recipient: string;
  channel: 'email' | 'sms' | 'both';
  messagePreview: string;
}

export interface MeetingSlot {
  id: string;
  date: string; // "YYYY-MM-DD" e.g. "2026-08-15"
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "10:30 AM"
  durationMinutes: number; // 15, 30, 45, 60
  providerName: string; // "Mudit Sachdeva (_illusionmaker)"
  serviceType: string; // "Creative Discovery Call" | "Shoot Planning" | "Post-Production Briefing"
  isBooked: boolean;
  meetingId?: string; // reference to the booked meeting
  location?: string;
  platform?: MeetingPlatform;
}

export interface Meeting {
  id: string;
  slotId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "10:00 AM"
  endTime: string; // "10:30 AM"
  durationMinutes: number;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  providerName: string; // "Mudit Sachdeva"
  topic: string; // e.g. "Commercial Brand Shoot Discovery"
  projectInterest: 'photography' | 'videography' | 'edits' | 'custom';
  notes?: string;
  platform: MeetingPlatform;
  meetingLink: string; // e.g. "https://meet.google.com/xyz-abc-qrs"
  status: MeetingStatus;
  createdAt: string;
  reminderSent: boolean;
  reminderLogs?: MeetingReminderLog[];
}
