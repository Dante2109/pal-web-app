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

export async function getEmergencyProfile(emergencyId: string): Promise<EmergencyProfileResponse | null> {
  const res = await fetch(`${BASE_URL}/api/v1/emergency/${emergencyId}`, { cache: 'no-store' })
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
  scanTime: string
}

export async function getScanHistory(token: string, limit = 10): Promise<ScanHistory[]> {
  const res = await fetch(`${BASE_URL}/api/v1/hospital/scanned-history?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  return res.json()
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
