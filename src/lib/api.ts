const BASE_URL = 'https://mediguardian-ai-kdeo.onrender.com'

export type Role = 'USER' | 'DOCTOR' | 'HOSPITAL' | 'LAB' | 'ADMIN'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
  errorCode?: string
  timestamp: string
}

// ---------- Auth ----------

export interface AuthResponse {
  token: string
  role: Role
}

export async function login(identifier: string, password: string): Promise<ApiResponse<AuthResponse>> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  })
  return res.json()
}

export interface RegisterRequest {
  email?: string
  mobileNumber?: string
  password: string
  role: Role
  profile?: {
    firstName: string
    lastName?: string
    dateOfBirth: string
    gender?: string
    bloodGroup?: string
  }
}

export async function register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function logout(token: string): Promise<ApiResponse<null>> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

// ---------- Emergency (public) ----------

export interface EmergencyProfileResponse {
  profileId: string
  firstName: string
  lastName: string
  profilePhotoUrl?: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  height?: number
  weight?: number
  mobile?: string
  emergencyContacts?: { contactName: string; contactPhone: string; contactRelationship: string }[]
  primaryDoctor?: { doctorName: string; doctorPhone: string; doctorHospital?: string }
  lifestyle?: { smoking: string; alcohol: string; exercise: string }
  allergies: string[]
  conditions: string[]
  medications: string[]
  surgeries: string[]
  implants: string[]
  medicalDevices?: string[]
  vaccinations?: string[]
  familyHistory?: string[]
  emergencyId: string
}

export async function getEmergencyProfile(emergencyId: string, token?: string | null): Promise<EmergencyProfileResponse | null> {
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}/api/v1/emergency/${emergencyId}`, { cache: 'no-store', headers })
  if (!res.ok) return null
  return res.json()
}

// ---------- Profile ----------

export interface ProfileResponse {
  id: string
  accountId?: string
  firstName: string
  lastName?: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  height?: number
  weight?: number
  mobile?: string
  emergencyContacts?: { contactName: string; contactPhone: string; contactRelationship: string }[]
  primaryDoctor?: { doctorName: string; doctorPhone: string; doctorHospital?: string }
  lifestyle?: { smoking: string; alcohol: string; exercise: string }
  allergies: string[]
  conditions: string[]
  medications: string[]
  surgeries: string[]
  implants: string[]
  medicalDevices?: string[]
  vaccinations?: string[]
  familyHistory?: string[]
  emergencyId: string
  qrCodeUrl?: string
  profilePhotoUrl?: string
  insurance?: { provider: string; policyNumber: string; groupNumber?: string; coverageType?: string; validUntil?: string }
}

export async function getMyProfile(token: string): Promise<ApiResponse<ProfileResponse>> {
  const res = await fetch(`${BASE_URL}/api/v1/profiles/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function getProfileById(token: string, id: string): Promise<ApiResponse<ProfileResponse>> {
  const res = await fetch(`${BASE_URL}/api/v1/profiles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

// ---------- Medical Records ----------

export interface MedicalRecord {
  id: string
  profileId: string
  title: string
  type: 'PRESCRIPTION' | 'LAB_REPORT' | 'DOCTOR_NOTE' | 'OTHER'
  description?: string
  visibility: 'PRIVATE' | 'FAMILY_SHARED' | 'DOCTOR_SHARED' | 'FAMILY_HEAD_ONLY'
  uploadDate: string
  presignedUrl: string
}

export async function getProfileRecords(token: string, profileId: string): Promise<ApiResponse<MedicalRecord[]>> {
  const res = await fetch(`${BASE_URL}/api/v1/profiles/${profileId}/records`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

// ---------- Hospital ----------

export interface ScanHistory {
  id: string
  doctorAccountId: string
  scannedProfileId: string
  scannedProfileName:string
  scanTime: string
}

export async function getScanHistory(token: string): Promise<ScanHistory[]> {
  const res = await fetch(`${BASE_URL}/api/v1/emergency/scan-history`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  const json = await res.json()
  return json.data || json
}

export interface PatientSearchResult {
  profileId: string
  firstName: string
  lastName: string
  profilePhotoUrl?: string
  dateOfBirth?: string
  gender?: string
  mobileNumber: string
  emergencyId: string
}

export async function searchPatient(token: string, mobileNumber: string): Promise<PatientSearchResult | null> {
  const res = await fetch(`${BASE_URL}/api/v1/hospital/patients/search?mobileNumber=${encodeURIComponent(mobileNumber)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

export interface NewbornRequest {
  parentProfileId: string
  firstName: string
  lastName?: string
  dateOfBirth: string
  gender: string
  bloodGroup?: string
  weight?: number
  height?: number
}

export async function registerNewborn(token: string, data: NewbornRequest): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/api/v1/hospital/newborn`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) return null
  return res.text()
}

// ---------- Doctors ----------

export interface Doctor {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  designation: string
  department: string
  specialization: string[]
  qualification: string
  experience: number
  bloodGroup: string
  gender: string
  dateOfBirth: string
  address: string
  city: string
  state: string
  country: string
  pincode: string
  consultationCharge: number
  availability: { day: string; slots: { from: string; to: string }[] }[]
  bio: string
  education: { degree: string; university: string; from: string; to: string }[]
  awards: { title: string; description: string }[]
  certifications: { title: string; description: string }[]
  languages: string[]
  photoUrl?: string
  active: boolean
}

const mockDoctors: Doctor[] = [
  {
    id: 'DOC-001',
    firstName: 'Michael',
    lastName: 'Thompson',
    email: 'michael.thompson@example.com',
    phone: '+1 54546 45648',
    designation: 'Cardiologist',
    department: 'Cardiology',
    specialization: ['Interventional Cardiology', 'Echocardiography'],
    qualification: 'MBBS, M.D, Cardiology',
    experience: 15,
    bloodGroup: 'O_POSITIVE',
    gender: 'MALE',
    dateOfBirth: '1978-03-15',
    address: '4150 Hiney Road',
    city: 'Las Vegas',
    state: 'NV',
    country: 'USA',
    pincode: '89109',
    consultationCharge: 499,
    availability: [
      { day: 'Monday', slots: [{ from: '09:00', to: '12:00' }, { from: '14:00', to: '17:00' }] },
      { day: 'Tuesday', slots: [{ from: '09:00', to: '12:00' }] },
      { day: 'Wednesday', slots: [{ from: '11:00', to: '14:00' }] },
      { day: 'Thursday', slots: [{ from: '09:00', to: '12:00' }, { from: '14:00', to: '17:00' }] },
    ],
    bio: 'Dr. Michael Thompson has been practicing cardiology for over 15 years. He has extensive experience in managing chronic heart conditions, preventive care, and interventional procedures.',
    education: [
      { degree: 'MD in Cardiology', university: 'Boston Medicine Institution', from: '1990-05-25', to: '1992-01-29' },
      { degree: 'MBBS', university: 'Harvard Medical School', from: '1985-05-25', to: '1990-01-29' },
    ],
    awards: [
      { title: 'Top Doctor Award (2023)', description: 'Recognized by U.S. News & World Report for outstanding achievements in cardiology.' },
      { title: 'Patient Choice Award (2022)', description: 'Awarded by Vitals.com for consistently receiving high patient ratings in satisfaction and care.' },
    ],
    certifications: [
      { title: 'American Board of Cardiology (ABC), 2015', description: 'Demonstrates mastery of comprehensive cardiovascular care.' },
      { title: 'American Heart Association, 2024', description: 'Certification in performing life-saving techniques, including CPR and emergency cardiac care.' },
    ],
    languages: ['English', 'French'],
    active: true,
  },
  {
    id: 'DOC-002',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@example.com',
    phone: '+1 45454 78965',
    designation: 'Neurologist',
    department: 'Neurology',
    specialization: ['Stroke Management', 'Neuroimaging'],
    qualification: 'MBBS, M.D, Neurology',
    experience: 12,
    bloodGroup: 'A_POSITIVE',
    gender: 'FEMALE',
    dateOfBirth: '1982-07-22',
    address: '220 Medical Center Blvd',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    pincode: '94102',
    consultationCharge: 599,
    availability: [
      { day: 'Monday', slots: [{ from: '08:00', to: '12:00' }] },
      { day: 'Wednesday', slots: [{ from: '09:00', to: '13:00' }] },
      { day: 'Friday', slots: [{ from: '10:00', to: '15:00' }] },
    ],
    bio: 'Dr. Sarah Chen is a board-certified neurologist with over 12 years of experience in diagnosing and treating complex neurological disorders.',
    education: [
      { degree: 'MD in Neurology', university: 'Stanford Medical School', from: '2005-06-01', to: '2008-05-30' },
      { degree: 'MBBS', university: 'UCSF School of Medicine', from: '2000-08-15', to: '2005-05-30' },
    ],
    awards: [
      { title: 'Clinical Excellence Award (2023)', description: 'Awarded for outstanding patient outcomes in stroke recovery.' },
    ],
    certifications: [
      { title: 'American Board of Psychiatry and Neurology, 2010', description: 'Board certified in neurology with special qualification in child neurology.' },
    ],
    languages: ['English', 'Mandarin', 'French'],
    active: true,
  },
  {
    id: 'DOC-003',
    firstName: 'James',
    lastName: 'Rodriguez',
    email: 'james.rodriguez@example.com',
    phone: '+1 36524 85214',
    designation: 'Pediatrician',
    department: 'Pediatrics',
    specialization: ['Neonatology', 'Adolescent Medicine'],
    qualification: 'MBBS, M.D, Pediatrics',
    experience: 10,
    bloodGroup: 'B_POSITIVE',
    gender: 'MALE',
    dateOfBirth: '1985-11-08',
    address: '150 Childrens Way',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    pincode: '90027',
    consultationCharge: 349,
    availability: [
      { day: 'Tuesday', slots: [{ from: '09:00', to: '13:00' }] },
      { day: 'Thursday', slots: [{ from: '09:00', to: '13:00' }] },
      { day: 'Saturday', slots: [{ from: '10:00', to: '14:00' }] },
    ],
    bio: 'Dr. James Rodriguez is a compassionate pediatrician dedicated to providing comprehensive healthcare for children from infancy through adolescence.',
    education: [
      { degree: 'MD in Pediatrics', university: 'UCLA Medical Center', from: '2008-09-01', to: '2011-06-30' },
    ],
    awards: [],
    certifications: [
      { title: 'American Board of Pediatrics, 2012', description: 'Certified in general pediatrics with a focus on developmental-behavioral health.' },
    ],
    languages: ['English', 'Spanish'],
    active: true,
  },
]

export async function getDoctors(token: string): Promise<Doctor[]> {
  return mockDoctors
}

export async function getDoctorById(token: string, id: string): Promise<Doctor | null> {
  return mockDoctors.find(d => d.id === id) || null
}

export async function createDoctor(token: string, data: Partial<Doctor>): Promise<Doctor> {
  const doctor: Doctor = {
    id: `DOC-${String(mockDoctors.length + 1).padStart(3, '0')}`,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    phone: data.phone || '',
    designation: data.designation || '',
    department: data.department || '',
    specialization: data.specialization || [],
    qualification: data.qualification || '',
    experience: data.experience || 0,
    bloodGroup: data.bloodGroup || 'O_POSITIVE',
    gender: data.gender || 'MALE',
    dateOfBirth: data.dateOfBirth || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    country: data.country || 'USA',
    pincode: data.pincode || '',
    consultationCharge: data.consultationCharge || 0,
    availability: data.availability || [],
    bio: data.bio || '',
    education: data.education || [],
    awards: data.awards || [],
    certifications: data.certifications || [],
    languages: data.languages || [],
    active: true,
  }
  mockDoctors.push(doctor)
  return doctor
}

// ---------- AI ----------

export async function analyzeProgress(token: string, profileId: string, condition: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/api/v1/ai/analyze/${profileId}?condition=${encodeURIComponent(condition)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.text()
}

export async function chatWithEmergencyProfile(emergencyId: string, question: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/api/v1/ai/emergency/${emergencyId}/chat?question=${encodeURIComponent(question)}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.text()
}

// ---------- Notifications ----------

export interface Notification {
  id: string
  accountId: string
  message: string
  read: boolean
  createdAt: string
}

export async function getNotifications(token: string): Promise<Notification[]> {
  const res = await fetch(`${BASE_URL}/api/v1/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  return res.json()
}

// ---------- Families ----------

export interface FamilyResponse {
  id: string
  name: string
  headProfileId: string
  members: {
    profileId: string
    firstName: string
    lastName: string
    relationshipToHead: string
    canViewMedicalHistory: boolean
    status: string
    dependent: boolean
  }[]
}

export async function getMyFamilies(token: string): Promise<ApiResponse<FamilyResponse[]>> {
  const res = await fetch(`${BASE_URL}/api/v1/families/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}
