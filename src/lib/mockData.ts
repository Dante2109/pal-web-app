import type {
  Patient, Report, TimelineEntry, Family, FamilyWithMembers,
  DoctorProfile, Appointment, ClinicalAlert,
  EmergencyPatient, QRScanEntry, AccessLogEntry, UnderTreatmentPatient, BedOccupancy,
} from './types'

export const patients: Patient[] = [
  {
    id: 'pat-001', name: 'Rajesh Kumar', age: '58', bloodGroup: 'O+', gender: 'Male',
    mobile: '+91 98765 43210', height: '172', weight: '78',
    allergies: ['Penicillin', 'Sulfa Drugs', 'Peanuts'],
    conditions: ['Type 2 Diabetes', 'Hypertension', 'Hyperlipidemia'],
    medications: ['Metformin 500mg BID', 'Amlodipine 5mg daily', 'Atorvastatin 20mg daily', 'Aspirin 75mg daily'],
    surgeries: ['Laparoscopic Appendectomy (2023)'],
    implants: ['Drug-Eluting Coronary Stent (LAD, 2025)'],
    medicalDevices: ['Blood Glucose Monitor'],
    vaccinations: ['COVID-19 (2024)', 'Influenza (2025)'],
    familyHistory: ['Father: Diabetes', 'Mother: Hypertension'],
    lifestyle: { smoking: 'never', alcohol: 'occasional', exercise: 'light' },
    emergencyContact: { contactName: 'Priya Kumar', contactPhone: '+91 98765 43211', contactRelationship: 'Spouse' },
    emergencyContacts: [
      { contactName: 'Priya Kumar', contactPhone: '+91 98765 43211', contactRelationship: 'Spouse' },
      { contactName: 'Arjun Kumar', contactPhone: '+91 98765 43212', contactRelationship: 'Son' },
    ],
    primaryDoctor: { doctorName: 'Dr. Anil Sharma', doctorPhone: '+91 98765 43000', doctorHospital: 'Apollo Hospitals' },
    reports: [
      { id: 'rpt-001', patientId: 'pat-001', type: 'Blood Report', date: '2026-06-15', summary: 'HbA1c: 7.2% — slightly elevated. LDL: 130 mg/dL. Creatinine: 1.1 mg/dL.', rawText: '...' },
      { id: 'rpt-002', patientId: 'pat-001', type: 'ECG', date: '2026-06-10', summary: 'Normal sinus rhythm. No ST-segment abnormalities detected.', rawText: '...' },
      { id: 'rpt-003', patientId: 'pat-001', type: 'Prescription', date: '2026-06-01', summary: 'Metformin 500mg BID — 30 days. Amlodipine 5mg daily — 30 days.', rawText: '...' },
    ],
    timeline: [
      { id: 'tl-001', type: 'diagnosis', title: 'Type 2 Diabetes Diagnosed', description: 'Fasting glucose 145 mg/dL, HbA1c 7.5%', date: '2022-03-14' },
      { id: 'tl-002', type: 'diagnosis', title: 'Hypertension Diagnosed', description: 'BP 150/95 on routine check', date: '2023-01-20' },
      { id: 'tl-003', type: 'surgery', title: 'Laparoscopic Appendectomy', description: 'Emergency appendectomy', date: '2023-06-18' },
      { id: 'tl-004', type: 'surgery', title: 'Coronary Stent Placement', description: 'Drug-eluting stent placed in LAD artery', date: '2025-02-10' },
    ],
    createdAt: '2022-01-15',
  },
  {
    id: 'pat-002', name: 'Priya Kumar', age: '52', bloodGroup: 'B+', gender: 'Female',
    mobile: '+91 98765 43211',
    allergies: ['Sulfa Drugs'],
    conditions: ['Hypothyroidism', 'Migraine'],
    medications: ['Thyroxine 50mcg daily', 'Sumatriptan 50mg PRN'],
    surgeries: [],
    implants: [],
    lifestyle: { smoking: 'never', alcohol: 'never', exercise: 'moderate' },
    emergencyContact: { contactName: 'Rajesh Kumar', contactPhone: '+91 98765 43210', contactRelationship: 'Spouse' },
    emergencyContacts: [{ contactName: 'Rajesh Kumar', contactPhone: '+91 98765 43210', contactRelationship: 'Spouse' }],
    primaryDoctor: { doctorName: 'Dr. Neha Gupta', doctorPhone: '+91 98765 43001', doctorHospital: 'Apollo Hospitals' },
    reports: [
      { id: 'rpt-004', patientId: 'pat-002', type: 'Blood Report', date: '2026-06-12', summary: 'TSH: 3.2 µIU/mL — within normal range.', rawText: '...' },
    ],
    timeline: [
      { id: 'tl-005', type: 'diagnosis', title: 'Hypothyroidism Diagnosed', description: 'TSH 8.5 µIU/mL', date: '2021-08-10' },
    ],
    createdAt: '2022-01-20',
  },
  {
    id: 'pat-003', name: 'Arjun Kumar', age: '22', bloodGroup: 'A+', gender: 'Male',
    mobile: '+91 98765 43212',
    allergies: ['Dust', 'Pollen'],
    conditions: ['Asthma'],
    medications: ['Salbutamol inhaler PRN'],
    surgeries: [],
    implants: [],
    lifestyle: { smoking: 'never', alcohol: 'occasional', exercise: 'active' },
    emergencyContact: { contactName: 'Rajesh Kumar', contactPhone: '+91 98765 43210', contactRelationship: 'Father' },
    emergencyContacts: [{ contactName: 'Rajesh Kumar', contactPhone: '+91 98765 43210', contactRelationship: 'Father' }],
    primaryDoctor: { doctorName: 'Dr. Neha Gupta', doctorPhone: '+91 98765 43001', doctorHospital: 'Apollo Hospitals' },
    reports: [],
    timeline: [
      { id: 'tl-006', type: 'diagnosis', title: 'Asthma Diagnosed', description: 'Childhood asthma', date: '2008-03-01' },
    ],
    createdAt: '2022-02-01',
  },
  {
    id: 'pat-004', name: 'Ananya Kumar', age: '19', bloodGroup: 'AB+', gender: 'Female',
    mobile: '+91 98765 43213',
    allergies: [],
    conditions: [],
    medications: [],
    surgeries: [],
    implants: [],
    lifestyle: { smoking: 'never', alcohol: 'never', exercise: 'moderate' },
    emergencyContact: { contactName: 'Rajesh Kumar', contactPhone: '+91 98765 43210', contactRelationship: 'Father' },
    emergencyContacts: [{ contactName: 'Rajesh Kumar', contactPhone: '+91 98765 43210', contactRelationship: 'Father' }],
    reports: [],
    timeline: [],
    createdAt: '2022-02-15',
  },
  {
    id: 'pat-005', name: 'Suresh Kumar', age: '65', bloodGroup: 'O-', gender: 'Male',
    mobile: '+91 98765 43220',
    allergies: ['Aspirin', 'Codeine'],
    conditions: ['Hypertension', 'COPD', 'Glaucoma'],
    medications: ['Losartan 50mg daily', 'Tiotropium inhaler daily', 'Latanoprost eye drops'],
    surgeries: ['Cataract Surgery (2024)'],
    implants: [],
    lifestyle: { smoking: 'former', alcohol: 'never', exercise: 'sedentary' },
    emergencyContact: { contactName: 'Lakshmi Kumar', contactPhone: '+91 98765 43221', contactRelationship: 'Spouse' },
    emergencyContacts: [{ contactName: 'Lakshmi Kumar', contactPhone: '+91 98765 43221', contactRelationship: 'Spouse' }],
    primaryDoctor: { doctorName: 'Dr. Anil Sharma', doctorPhone: '+91 98765 43000', doctorHospital: 'Apollo Hospitals' },
    reports: [
      { id: 'rpt-005', patientId: 'pat-005', type: 'Blood Report', date: '2026-06-08', summary: 'BP: 145/90. Creatinine: 1.3 mg/dL.', rawText: '...' },
    ],
    timeline: [
      { id: 'tl-007', type: 'diagnosis', title: 'COPD Diagnosed', description: 'Chronic cough, spirometry confirmed', date: '2019-11-05' },
      { id: 'tl-008', type: 'surgery', title: 'Cataract Surgery', description: 'Left eye', date: '2024-04-22' },
    ],
    createdAt: '2022-03-01',
  },
  {
    id: 'pat-006', name: 'Lakshmi Kumar', age: '62', bloodGroup: 'A-', gender: 'Female',
    mobile: '+91 98765 43221',
    allergies: [],
    conditions: ['Osteoarthritis', 'Anemia'],
    medications: ['Iron supplements', 'Acetaminophen PRN'],
    surgeries: ['Hip Replacement (2023)'],
    implants: ['Artificial Hip Joint'],
    lifestyle: { smoking: 'never', alcohol: 'never', exercise: 'light' },
    emergencyContact: { contactName: 'Suresh Kumar', contactPhone: '+91 98765 43220', contactRelationship: 'Spouse' },
    emergencyContacts: [{ contactName: 'Suresh Kumar', contactPhone: '+91 98765 43220', contactRelationship: 'Spouse' }],
    primaryDoctor: { doctorName: 'Dr. Neha Gupta', doctorPhone: '+91 98765 43001', doctorHospital: 'Apollo Hospitals' },
    reports: [],
    timeline: [
      { id: 'tl-009', type: 'surgery', title: 'Hip Replacement Surgery', description: 'Right hip', date: '2023-09-14' },
    ],
    createdAt: '2022-03-05',
  },
  {
    id: 'pat-007', name: 'Vikram Sharma', age: '45', bloodGroup: 'B-', gender: 'Male',
    mobile: '+91 98765 43230',
    allergies: [],
    conditions: ['GERD', 'Insomnia'],
    medications: ['Omeprazole 20mg daily', 'Zolpidem 10mg PRN'],
    surgeries: [],
    implants: [],
    lifestyle: { smoking: 'current', alcohol: 'regular', exercise: 'sedentary' },
    emergencyContact: { contactName: 'Neha Sharma', contactPhone: '+91 98765 43231', contactRelationship: 'Spouse' },
    emergencyContacts: [{ contactName: 'Neha Sharma', contactPhone: '+91 98765 43231', contactRelationship: 'Spouse' }],
    primaryDoctor: { doctorName: 'Dr. Anil Sharma', doctorPhone: '+91 98765 43000', doctorHospital: 'Apollo Hospitals' },
    reports: [],
    timeline: [
      { id: 'tl-010', type: 'diagnosis', title: 'GERD Diagnosed', description: 'Chronic acid reflux', date: '2023-05-10' },
    ],
    createdAt: '2022-04-01',
  },
  {
    id: 'pat-008', name: 'Neha Sharma', age: '40', bloodGroup: 'AB-', gender: 'Female',
    mobile: '+91 98765 43231',
    allergies: ['Latex'],
    conditions: ['Migraine', 'Anxiety'],
    medications: ['Sumatriptan 50mg PRN', 'Escitalopram 10mg daily'],
    surgeries: [],
    implants: [],
    lifestyle: { smoking: 'never', alcohol: 'occasional', exercise: 'moderate' },
    emergencyContact: { contactName: 'Vikram Sharma', contactPhone: '+91 98765 43230', contactRelationship: 'Spouse' },
    emergencyContacts: [{ contactName: 'Vikram Sharma', contactPhone: '+91 98765 43230', contactRelationship: 'Spouse' }],
    primaryDoctor: { doctorName: 'Dr. Neha Gupta', doctorPhone: '+91 98765 43001', doctorHospital: 'Apollo Hospitals' },
    reports: [],
    timeline: [],
    createdAt: '2022-04-05',
  },
  {
    id: 'pat-009', name: 'Rohan Sharma', age: '12', bloodGroup: 'B+', gender: 'Male',
    mobile: '+91 98765 43232',
    allergies: ['Dust'],
    conditions: ['Asthma'],
    medications: ['Salbutamol inhaler PRN', 'Fluticasone inhaler daily'],
    surgeries: [],
    implants: [],
    lifestyle: { smoking: 'never', alcohol: 'never', exercise: 'active' },
    emergencyContact: { contactName: 'Vikram Sharma', contactPhone: '+91 98765 43230', contactRelationship: 'Father' },
    emergencyContacts: [{ contactName: 'Vikram Sharma', contactPhone: '+91 98765 43230', contactRelationship: 'Father' }],
    primaryDoctor: { doctorName: 'Dr. Neha Gupta', doctorPhone: '+91 98765 43001', doctorHospital: 'Apollo Hospitals' },
    reports: [],
    timeline: [
      { id: 'tl-011', type: 'diagnosis', title: 'Asthma Diagnosed', description: 'Childhood asthma', date: '2018-06-15' },
    ],
    createdAt: '2022-04-10',
  },
  {
    id: 'pat-010', name: 'Aanya Sharma', age: '8', bloodGroup: 'B+', gender: 'Female',
    mobile: '+91 98765 43233',
    allergies: [],
    conditions: [],
    medications: [],
    surgeries: [],
    implants: [],
    lifestyle: { smoking: 'never', alcohol: 'never', exercise: 'active' },
    emergencyContact: { contactName: 'Vikram Sharma', contactPhone: '+91 98765 43230', contactRelationship: 'Father' },
    emergencyContacts: [{ contactName: 'Vikram Sharma', contactPhone: '+91 98765 43230', contactRelationship: 'Father' }],
    reports: [],
    timeline: [],
    createdAt: '2022-04-15',
  },
]

export const families: FamilyWithMembers[] = [
  {
    family: { id: 'fam-001', name: 'My Family', createdBy: 'usr-001', icon: 'home' },
    members: [
      { id: 'fm-001', familyId: 'fam-001', patientId: 'pat-001', role: 'Self', permissionLevel: 'Owner', patient: patients[0] },
      { id: 'fm-002', familyId: 'fam-001', patientId: 'pat-002', role: 'Wife', permissionLevel: 'Admin', patient: patients[1] },
      { id: 'fm-003', familyId: 'fam-001', patientId: 'pat-003', role: 'Son', permissionLevel: 'Viewer', patient: patients[2] },
      { id: 'fm-004', familyId: 'fam-001', patientId: 'pat-004', role: 'Daughter', permissionLevel: 'Viewer', patient: patients[3] },
    ],
  },
  {
    family: { id: 'fam-002', name: "Brother's Family", createdBy: 'usr-001', icon: 'people' },
    members: [
      { id: 'fm-005', familyId: 'fam-002', patientId: 'pat-007', role: 'Brother', permissionLevel: 'Admin', patient: patients[6] },
      { id: 'fm-006', familyId: 'fam-002', patientId: 'pat-008', role: 'Sister-in-Law', permissionLevel: 'Editor', patient: patients[7] },
      { id: 'fm-007', familyId: 'fam-002', patientId: 'pat-009', role: 'Nephew', permissionLevel: 'Viewer', patient: patients[8] },
      { id: 'fm-008', familyId: 'fam-002', patientId: 'pat-010', role: 'Niece', permissionLevel: 'Viewer', patient: patients[9] },
    ],
  },
  {
    family: { id: 'fam-003', name: 'Parents', createdBy: 'usr-001', icon: 'heart' },
    members: [
      { id: 'fm-009', familyId: 'fam-003', patientId: 'pat-005', role: 'Father', permissionLevel: 'Admin', patient: patients[4] },
      { id: 'fm-010', familyId: 'fam-003', patientId: 'pat-006', role: 'Mother', permissionLevel: 'Admin', patient: patients[5] },
    ],
  },
]

export const doctors: DoctorProfile[] = [
  { id: 'doc-001', name: 'Dr. Anil Sharma', specialty: 'Cardiologist', hospital: 'Apollo Hospitals', phone: '+91 98765 43000', license: 'MCI-12-34567', experience: '18 years' },
  { id: 'doc-002', name: 'Dr. Neha Gupta', specialty: 'General Physician', hospital: 'Apollo Hospitals', phone: '+91 98765 43001', license: 'MCI-12-34568', experience: '12 years' },
]

export function getPatient(id: string): Patient | undefined {
  return patients.find(p => p.id === id)
}

export function getDoctorPatients(doctorId: string): Patient[] {
  const doctor = doctors.find(d => d.id === doctorId)
  if (!doctor) return []
  return patients.filter(p => p.primaryDoctor?.doctorName === doctor.name)
}

export function getTodayAppointments(doctorId: string): Appointment[] {
  const doctor = doctors.find(d => d.id === doctorId)
  if (!doctor) return []
  const docPatients = patients.filter(p => p.primaryDoctor?.doctorName === doctor.name)
  const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30']
  const reasons = [
    'Blood pressure check', 'Medication review', 'Chest pain evaluation',
    'Diabetes follow-up', 'Post-surgery checkup', 'ECG review',
    'Lipid profile follow-up', 'General consultation',
  ]
  return docPatients.map((p, i) => ({
    id: `appt-${doctorId}-${i}`,
    patientId: p.id,
    patientName: p.name,
    time: slots[i] || '16:00',
    type: (i % 2 === 0 ? 'follow-up' : i % 3 === 0 ? 'review' : 'consultation') as Appointment['type'],
    reason: reasons[i % reasons.length],
    status: (i === 0 ? 'in-progress' : 'scheduled') as Appointment['status'],
  }))
}

export function getClinicalAlerts(doctorId: string): ClinicalAlert[] {
  const doctor = doctors.find(d => d.id === doctorId)
  if (!doctor) return []
  const docPatients = patients.filter(p => p.primaryDoctor?.doctorName === doctor.name)
  const alerts: ClinicalAlert[] = []
  for (const p of docPatients) {
    if (p.conditions.some(c => c.toLowerCase().includes('diabetes'))) {
      alerts.push({ id: `ca-${p.id}-hba1c`, patientId: p.id, patientName: p.name, type: 'follow-up', message: 'Due for HbA1c check — last check over 3 months ago', time: 'Today' })
    }
    if (p.conditions.some(c => c.toLowerCase().includes('hypertension'))) {
      alerts.push({ id: `ca-${p.id}-bp`, patientId: p.id, patientName: p.name, type: 'lab-result', message: 'Review recent BP readings — last visit showed elevation', time: '2 days ago' })
    }
    if (p.medications.length > 3) {
      alerts.push({ id: `ca-${p.id}-polypharmacy`, patientId: p.id, patientName: p.name, type: 'critical', message: `Polypharmacy review needed — ${p.medications.length} active medications`, time: '1 week ago' })
    }
  }
  return alerts.sort((a, b) => {
    const order = { critical: 0, 'lab-result': 1, 'follow-up': 2 }
    return order[a.type] - order[b.type]
  })
}

export function getTodayEmergencyPatients(): EmergencyPatient[] {
  const emergencyData: Record<string, { reason: string; severity: EmergencyPatient['severity'] }> = {
    'pat-001': { reason: 'Chest pain & shortness of breath', severity: 'critical' },
    'pat-005': { reason: 'Hypertensive urgency (BP 180/110)', severity: 'serious' },
    'pat-008': { reason: 'Severe migraine with vomiting', severity: 'serious' },
    'pat-009': { reason: 'Acute asthma exacerbation', severity: 'stable' },
  }
  const arrivalTimes: Record<string, string> = {
    'pat-001': '10:30 AM', 'pat-005': '11:45 AM', 'pat-008': '2:15 PM', 'pat-009': '3:00 PM',
  }
  return Object.keys(emergencyData).map((pid, i) => {
    const p = patients.find(pt => pt.id === pid)
    const data = emergencyData[pid]
    return {
      id: `emerg-${pid}`,
      patientId: pid,
      patientName: p?.name || 'Unknown',
      age: p?.age || '—',
      bloodGroup: p?.bloodGroup || '—',
      reason: data.reason,
      severity: data.severity,
      arrivalTime: arrivalTimes[pid],
    }
  })
}

export function getRecentQRScans(): QRScanEntry[] {
  return [
    { id: 'qr-001', patientId: 'pat-001', patientName: 'Rajesh Kumar', scannedBy: 'Dr. Anil Sharma', role: 'Cardiologist', timeAgo: '2 min ago' },
    { id: 'qr-002', patientId: 'pat-002', patientName: 'Priya Kumar', scannedBy: 'Nurse Priya Singh', role: 'Emergency Nurse', timeAgo: '15 min ago' },
    { id: 'qr-003', patientId: 'pat-005', patientName: 'Suresh Kumar', scannedBy: 'Dr. Neha Gupta', role: 'Physician', timeAgo: '1h ago' },
    { id: 'qr-004', patientId: 'pat-008', patientName: 'Neha Sharma', scannedBy: 'Staff Amit Verma', role: 'Triage', timeAgo: '2h ago' },
    { id: 'qr-005', patientId: 'pat-009', patientName: 'Rohan Sharma', scannedBy: 'Dr. Neha Gupta', role: 'Physician', timeAgo: '3h ago' },
  ]
}

export function getEmergencyAccessLogs(): AccessLogEntry[] {
  return [
    { id: 'log-001', patientId: 'pat-001', patientName: 'Rajesh Kumar', accessedBy: 'Dr. Anil Sharma', role: 'Cardiologist', action: 'Viewed medical history & ECG reports', time: '02:30 PM' },
    { id: 'log-002', patientId: 'pat-005', patientName: 'Suresh Kumar', accessedBy: 'Nurse Priya Singh', role: 'Emergency Nurse', action: 'Accessed allergy & medication list', time: '01:15 PM' },
    { id: 'log-003', patientId: 'pat-002', patientName: 'Priya Kumar', accessedBy: 'Dr. Neha Gupta', role: 'Physician', action: 'Reviewed lab reports & prescriptions', time: '12:45 PM' },
    { id: 'log-004', patientId: 'pat-001', patientName: 'Rajesh Kumar', accessedBy: 'Staff Amit Verma', role: 'Triage', action: 'QR scan — verified patient identity', time: '11:30 AM' },
    { id: 'log-005', patientId: 'pat-008', patientName: 'Neha Sharma', accessedBy: 'Dr. Neha Gupta', role: 'Physician', action: 'Viewed medical profile & allergies', time: '10:00 AM' },
  ]
}

export function getPatientsUnderTreatment(): UnderTreatmentPatient[] {
  const admissions: Record<string, { since: string; doctor: string; status: UnderTreatmentPatient['status'] }> = {
    'pat-001': { since: '10 Mar 2026', doctor: 'Dr. Anil Sharma', status: 'stable' },
    'pat-005': { since: '15 Mar 2026', doctor: 'Dr. Anil Sharma', status: 'improving' },
    'pat-008': { since: '18 Mar 2026', doctor: 'Dr. Neha Gupta', status: 'critical' },
    'pat-009': { since: '20 Mar 2026', doctor: 'Dr. Neha Gupta', status: 'stable' },
  }
  return Object.keys(admissions).map(pid => {
    const p = patients.find(pt => pt.id === pid)
    const adm = admissions[pid]
    return {
      id: `treatment-${pid}`, patientId: pid, patientName: p?.name || 'Unknown',
      age: p?.age || '—', bloodGroup: p?.bloodGroup || '—',
      conditions: p?.conditions || [], medications: p?.medications || [],
      admittedSince: adm.since, doctorName: adm.doctor, status: adm.status,
    }
  })
}

export function getBedOccupancy(): BedOccupancy[] {
  return [
    { department: 'General Ward', total: 25, occupied: 20 },
    { department: 'ICU', total: 10, occupied: 6 },
    { department: 'Emergency', total: 10, occupied: 4 },
    { department: 'Cardiology', total: 8, occupied: 5 },
    { department: 'Pediatrics', total: 6, occupied: 2 },
  ]
}
