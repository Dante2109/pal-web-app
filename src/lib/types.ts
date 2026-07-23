export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say'

export interface EmergencyContact {
  contactName: string
  contactPhone: string
  contactRelationship: string
}

export interface PrimaryDoctor {
  doctorName: string
  doctorPhone: string
  doctorHospital?: string
}

export interface Lifestyle {
  smoking: 'never' | 'former' | 'current'
  alcohol: 'never' | 'occasional' | 'regular'
  exercise: 'sedentary' | 'light' | 'moderate' | 'active'
}

export interface Insurance {
  provider: string
  policyNumber: string
  groupNumber?: string
  coverageType?: string
  validUntil?: string
}

export interface Patient {
  id: string
  name: string
  age: string
  bloodGroup: string
  gender: Gender
  mobile: string
  height?: string
  weight?: string
  allergies: string[]
  conditions: string[]
  medications: string[]
  surgeries: string[]
  implants: string[]
  medicalDevices?: string[]
  vaccinations?: string[]
  familyHistory?: string[]
  lifestyle?: Lifestyle
  emergencyContact: EmergencyContact
  emergencyContacts?: EmergencyContact[]
  primaryDoctor?: PrimaryDoctor
  reports: Report[]
  timeline: TimelineEntry[]
  createdAt: string
}

export interface Report {
  id: string
  patientId: string
  type: string
  date: string
  summary: string
  rawText: string
  uri?: string
}

export interface TimelineEntry {
  id: string
  type: 'diagnosis' | 'surgery' | 'hospitalization' | 'test' | 'vaccination' | 'other'
  title: string
  description: string
  date: string
  source?: string
}

export interface Family {
  id: string
  name: string
  createdBy: string
  icon?: string
}

export interface FamilyMember {
  id: string
  familyId: string
  patientId: string
  role: string
  permissionLevel: 'Owner' | 'Admin' | 'Editor' | 'Viewer' | 'EmergencyContact'
}

export interface FamilyWithMembers {
  family: Family
  members: (FamilyMember & { patient: Patient })[]
}

export interface DoctorProfile {
  id: string
  name: string
  specialty: string
  hospital: string
  phone: string
  license: string
  experience: string
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  time: string
  type: 'follow-up' | 'new' | 'review' | 'consultation'
  reason: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
}

export interface ClinicalAlert {
  id: string
  patientId: string
  patientName: string
  type: 'lab-result' | 'follow-up' | 'critical'
  message: string
  time: string
}

export interface EmergencyPatient {
  id: string
  patientId: string
  patientName: string
  age: string
  bloodGroup: string
  reason: string
  severity: 'critical' | 'serious' | 'stable'
  arrivalTime: string
}

export interface QRScanEntry {
  id: string
  patientId: string
  patientName: string
  scannedBy: string
  role: string
  timeAgo: string
}

export interface AccessLogEntry {
  id: string
  patientId: string
  patientName: string
  accessedBy: string
  role: string
  action: string
  time: string
}

export interface UnderTreatmentPatient {
  id: string
  patientId: string
  patientName: string
  age: string
  bloodGroup: string
  conditions: string[]
  medications: string[]
  admittedSince: string
  doctorName: string
  status: 'stable' | 'improving' | 'critical'
}

export interface BedOccupancy {
  department: string
  total: number
  occupied: number
}
