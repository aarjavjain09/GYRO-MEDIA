import { Service, MeetingSlot, Meeting } from "./types";

export const SERVICES: Service[] = [
  {
    id: "photography",
    name: "Premium Photography",
    description: "High-end editorial and event photography tailored for high-profile visual storytelling, brand campaigns, and elegant corporate imagery.",
    basePrice: 15000, // per hour (INR)
    icon: "Camera",
    features: [
      "Full-frame professional gear & prime lenses",
      "Individually hand-retouched high-res deliverables",
      "Private password-protected digital review gallery",
      "Commercial usage rights & digital delivery",
      "Standard 5-day post-production turnaround"
    ]
  },
  {
    id: "videography",
    name: "Cinematic Videography",
    description: "Bespoke 4K cinematic capture with dual-source high-fidelity sound, custom pacing, and director-level visual composition.",
    basePrice: 25000, // per hour (INR)
    icon: "Video",
    features: [
      "Cinema-grade 4K camera package",
      "Professional multi-source audio recording",
      "Includes general cuts and continuous raw output",
      "Dynamic camera movement & premium stabilizing",
      "Standard 7-day post-production turnaround"
    ]
  },
  {
    id: "edits",
    name: "Post-Production & Edits",
    description: "Professional editing, advanced pacing, motion graphics, custom color science, and sound design for pre-shot raw footage.",
    basePrice: 12000, // per project (up to 5 mins) (INR)
    icon: "Sliders",
    features: [
      "Direct raw media assets upload portal",
      "Professional cuts, transitions, and tight pacing",
      "High-end atmospheric color grading",
      "Royalty-free premium audio licensing and mixing",
      "Standard 3-day dynamic turnaround"
    ]
  }
];

export const INITIAL_MEETING_SLOTS: MeetingSlot[] = [
  {
    id: "slot-001",
    date: "2026-08-14",
    startTime: "11:00 AM",
    endTime: "11:30 AM",
    durationMinutes: 30,
    providerName: "Mudit Sachdeva (_illusionmaker)",
    serviceType: "Creative Discovery Call",
    isBooked: true,
    meetingId: "meet-101",
    platform: "google_meet"
  },
  {
    id: "slot-002",
    date: "2026-08-14",
    startTime: "02:30 PM",
    endTime: "03:00 PM",
    durationMinutes: 30,
    providerName: "Mudit Sachdeva (_illusionmaker)",
    serviceType: "Commercial Campaign Consultation",
    isBooked: false,
    platform: "google_meet"
  },
  {
    id: "slot-003",
    date: "2026-08-14",
    startTime: "04:30 PM",
    endTime: "05:15 PM",
    durationMinutes: 45,
    providerName: "Mudit Sachdeva (_illusionmaker)",
    serviceType: "VFX & High-End Colour Grading Briefing",
    isBooked: false,
    platform: "google_meet"
  },
  {
    id: "slot-004",
    date: "2026-08-15",
    startTime: "10:30 AM",
    endTime: "11:00 AM",
    durationMinutes: 30,
    providerName: "Mudit Sachdeva (_illusionmaker)",
    serviceType: "Creative Discovery Call",
    isBooked: true,
    meetingId: "meet-102",
    platform: "google_meet"
  },
  {
    id: "slot-005",
    date: "2026-08-15",
    startTime: "01:00 PM",
    endTime: "01:30 PM",
    durationMinutes: 30,
    providerName: "Mudit Sachdeva (_illusionmaker)",
    serviceType: "Editorial Photography Pre-Shoot Review",
    isBooked: false,
    platform: "google_meet"
  },
  {
    id: "slot-006",
    date: "2026-08-15",
    startTime: "03:30 PM",
    endTime: "04:00 PM",
    durationMinutes: 30,
    providerName: "Mudit Sachdeva (_illusionmaker)",
    serviceType: "Music Video Cinematography Discussion",
    isBooked: false,
    platform: "zoom"
  },
  {
    id: "slot-007",
    date: "2026-08-16",
    startTime: "11:30 AM",
    endTime: "12:00 PM",
    durationMinutes: 30,
    providerName: "Mudit Sachdeva (_illusionmaker)",
    serviceType: "Celebrity / Brand Shoot Alignment",
    isBooked: false,
    platform: "google_meet"
  },
  {
    id: "slot-008",
    date: "2026-08-16",
    startTime: "02:00 PM",
    endTime: "02:30 PM",
    durationMinutes: 30,
    providerName: "Mudit Sachdeva (_illusionmaker)",
    serviceType: "Creative Discovery Call",
    isBooked: false,
    platform: "google_meet"
  },
  {
    id: "slot-009",
    date: "2026-08-17",
    startTime: "10:00 AM",
    endTime: "10:30 AM",
    durationMinutes: 30,
    providerName: "Mudit Sachdeva (_illusionmaker)",
    serviceType: "Creative Discovery Call",
    isBooked: true,
    meetingId: "meet-103",
    platform: "google_meet"
  },
  {
    id: "slot-010",
    date: "2026-08-17",
    startTime: "03:00 PM",
    endTime: "03:45 PM",
    durationMinutes: 45,
    providerName: "Mudit Sachdeva (_illusionmaker)",
    serviceType: "Custom Production Package Consultation",
    isBooked: false,
    platform: "phone"
  },
  {
    id: "slot-011",
    date: "2026-08-18",
    startTime: "02:30 PM",
    endTime: "03:00 PM",
    durationMinutes: 30,
    providerName: "Mudit Sachdeva (_illusionmaker)",
    serviceType: "Post-Production Raw Cut Alignment",
    isBooked: false,
    platform: "google_meet"
  }
];

export const INITIAL_BOOKED_MEETINGS: Meeting[] = [
  {
    id: "meet-101",
    slotId: "slot-001",
    date: "2026-08-14",
    startTime: "11:00 AM",
    endTime: "11:30 AM",
    durationMinutes: 30,
    clientName: "Aarjav Jain",
    clientEmail: "aarjavjainn@gmail.com",
    clientPhone: "+91 98112 34567",
    providerName: "Mudit Sachdeva (_illusionmaker)",
    topic: "Luxe Fashion Campaign Discovery & Lighting Scheme",
    projectInterest: "photography",
    notes: "Client requested editorial moodboard review with warm tones & prime lens specs.",
    platform: "google_meet",
    meetingLink: "https://meet.google.com/xyz-mudit-creame",
    status: "confirmed",
    createdAt: "2026-08-12T14:30:00",
    reminderSent: true,
    reminderLogs: [
      {
        id: "rem-1",
        sentAt: "2026-08-13T11:00:00",
        type: "24h_before",
        recipient: "aarjavjainn@gmail.com",
        channel: "both",
        messagePreview: "Reminder: Creative Discovery Call with Mudit Sachdeva tomorrow at 11:00 AM. Join link: https://meet.google.com/xyz-mudit-creame"
      }
    ]
  },
  {
    id: "meet-102",
    slotId: "slot-004",
    date: "2026-08-15",
    startTime: "10:30 AM",
    endTime: "11:00 AM",
    durationMinutes: 30,
    clientName: "Julian Mercer",
    clientEmail: "julian@creame.studio",
    clientPhone: "+1 (555) 234-8900",
    providerName: "Mudit Sachdeva (_illusionmaker)",
    topic: "Cinematic Reel Turnaround & Sound Pacing Discussion",
    projectInterest: "videography",
    notes: "Discussing high-speed 120fps drone footage and multi-track audio mix.",
    platform: "google_meet",
    meetingLink: "https://meet.google.com/abc-cinematic-reel",
    status: "confirmed",
    createdAt: "2026-08-13T09:15:00",
    reminderSent: true,
    reminderLogs: [
      {
        id: "rem-2",
        sentAt: "2026-08-14T10:30:00",
        type: "24h_before",
        recipient: "julian@creame.studio",
        channel: "email",
        messagePreview: "Upcoming Session Reminder: 10:30 AM Google Meet with Mudit Sachdeva."
      }
    ]
  },
  {
    id: "meet-103",
    slotId: "slot-009",
    date: "2026-08-17",
    startTime: "10:00 AM",
    endTime: "10:30 AM",
    durationMinutes: 30,
    clientName: "Elena Rostova",
    clientEmail: "elena@luxe.co",
    clientPhone: "+44 7700 900123",
    providerName: "Mudit Sachdeva (_illusionmaker)",
    topic: "Global Luxury Watch Launch - VFX & Colour Grade",
    projectInterest: "edits",
    notes: "Brand launch requiring signature metallic dark look with 3D product reflections.",
    platform: "google_meet",
    meetingLink: "https://meet.google.com/lux-watch-vfx",
    status: "confirmed",
    createdAt: "2026-08-13T16:45:00",
    reminderSent: false,
    reminderLogs: []
  }
];

export const INITIAL_PROJECTS = [
  {
    id: "proj-101",
    name: "Soleil Fashion Editorial",
    serviceId: "photography",
    clientName: "Alex Rivera",
    clientEmail: "alex@soleilmag.com",
    status: "active" as const,
    totalPrice: 45000,
    deadline: "2026-07-25T18:00",
    createdAt: "2026-07-15T10:00",
    invoiceId: "INV-2026-001",
    currentMilestoneIndex: 2,
    uploadedFiles: [],
    notes: "High-fashion look, warm editorial filters requested.",
    milestones: [
      { id: "m1", name: "Shoot Completed", description: "All raw editorial frames successfully captured.", status: "completed" as const, updatedAt: "2026-07-15T16:00" },
      { id: "m2", name: "Culling & Selection", description: "Initial filtering of top 100 select frames.", status: "completed" as const, updatedAt: "2026-07-16T11:00" },
      { id: "m3", name: "Color Correction", description: "Color balance and initial raw corrections.", status: "current" as const },
      { id: "m4", name: "Detailed Retouching", description: "Skin cleanup, frequency separation, and crop.", status: "pending" as const },
      { id: "m5", name: "Final Delivery", description: "Secure archive release and review gallery delivery.", status: "pending" as const }
    ]
  },
  {
    id: "proj-102",
    name: "Aura Brand Launch Film",
    serviceId: "videography",
    clientName: "Sophia Mercer",
    clientEmail: "sophia@aurawear.co",
    status: "review" as const,
    totalPrice: 85000,
    deadline: "2026-07-20T12:00",
    createdAt: "2026-07-12T09:00",
    invoiceId: "INV-2026-002",
    currentMilestoneIndex: 3,
    uploadedFiles: [{ name: "storyboard.pdf", size: "1.4 MB" }],
    notes: "Dynamic, fast cuts matching high-intensity synthwave track.",
    milestones: [
      { id: "v1", name: "Pre-production & Scripting", description: "Concept and shot lists aligned.", status: "completed" as const, updatedAt: "2026-07-12T14:00" },
      { id: "v2", name: "Production Shoot", description: "A-roll and B-roll capture completed.", status: "completed" as const, updatedAt: "2026-07-13T19:00" },
      { id: "v3", name: "Rough Cut & Assembly", description: "First visual flow selection.", status: "completed" as const, updatedAt: "2026-07-15T15:00" },
      { id: "v4", name: "Audio, Grading & VFX", description: "Audio mixing and custom LUT grade applied.", status: "current" as const },
      { id: "v5", name: "Final Render & Handoff", description: "Export in ProRes & Web optimized MP4 formats.", status: "pending" as const }
    ]
  }
];


