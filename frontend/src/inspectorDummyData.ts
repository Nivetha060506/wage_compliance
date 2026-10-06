export interface InspectorCheckitem {
  id: number;
  item: string;
  result: 'PASS' | 'FAIL' | 'NOT_APPLICABLE';
  remarks: string;
}

export interface InspectorObservation {
  id: string;
  category: 'WAGES' | 'ATTENDANCE' | 'OVERTIME' | 'STATUTORY_RECORDS' | 'OTHER';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
}

export interface InspectorFinding {
  id: string;
  category: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  inspectorRemarks: string;
}

export interface InspectorEvidence {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  relatedTo: string;
}

export interface InspectorInspectionItem {
  id: string;
  establishmentId: string;
  establishmentName: string;
  registrationNumber: string;
  district: string;
  industry: string;
  totalEmployees: number;
  ownerName: string;
  scheduledDate: string;
  inspectionType: 'Risk-Based' | 'Routine' | 'Follow-up' | 'Special';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  status: 'ASSIGNED' | 'UPCOMING' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'DRAFT';
  instructions?: string;
  followUpFor?: string;
  relatedViolation?: string;
  requiredAction?: string;
  employerProof?: string;
  verificationObservation?: string;
  verificationResult?: 'CORRECTED' | 'PARTIALLY_CORRECTED' | 'NOT_CORRECTED';
  checklist?: InspectorCheckitem[];
  observations?: InspectorObservation[];
  findings?: InspectorFinding[];
  evidence?: InspectorEvidence[];
  inspectorRemarks?: string;
  reportSubmittedAt?: string;
  previousInspectionSummary?: string;
  complianceSummary?: string;
  wageInfoSummary?: string;
  previousViolations?: string;
  progressSummary?: string;
}

export const INSPECTOR_KPI_STATS = {
  assignedInspections: 8,
  upcomingInspections: 3,
  inProgress: 2,
  submittedReports: 5,
  followUpInspections: 2,
  completedInspections: 12
};

export const INSPECTOR_PROFILE_DATA = {
  name: 'Rajesh Kumar',
  role: 'Labour Inspector',
  employeeId: 'LI-2045',
  district: 'Erode Zone',
  department: 'Department of Labour & Employment, Govt. of Tamil Nadu',
  email: 'inspector@example.com',
  phone: '+91 94432 10987',
  designation: 'Senior Field Labour Inspector',
  status: 'Active / On-Duty'
};

// 1. ASSIGNED & IN-PROGRESS (Current active work)
export const DUMMY_ASSIGNED_INSPECTIONS: InspectorInspectionItem[] = [
  {
    id: 'INS-1001',
    establishmentId: 'EST-1001',
    establishmentName: 'ABC Textiles Pvt Ltd',
    registrationNumber: 'TN-ERD-2024-00125',
    district: 'Erode',
    industry: 'Textile Manufacturing',
    totalEmployees: 250,
    ownerName: 'R. Sakthivel',
    scheduledDate: '2026-10-06',
    inspectionType: 'Risk-Based',
    priority: 'HIGH',
    riskLevel: 'HIGH',
    riskScore: 78,
    status: 'IN_PROGRESS',
    instructions: 'Verify overtime wage registers, attendance log completeness, and statutory minimum wage rates for shift B workers.',
    previousInspectionSummary: 'Inspected on 15 Oct 2025; minor delays in overtime wage disbursement noted.',
    complianceSummary: 'Submitted Q2 2026 statutory returns. 32 overtime entries flagged for verification.',
    wageInfoSummary: 'Minimum wage rate: ₹520/day. Overtime rate: double statutory rate (₹130/hr). 250 workers covered.',
    previousViolations: 'VIO-890: Attendance log gap (Resolved 2025).',
    checklist: [
      { id: 1, item: 'Minimum Wage Compliance', result: 'PASS', remarks: 'All basic wage rates adhere to Government notification rates.' },
      { id: 2, item: 'Timely Wage Payment', result: 'PASS', remarks: 'Disbursement executed before 7th of the month via bank transfer.' },
      { id: 3, item: 'Attendance Records', result: 'FAIL', remarks: 'Attendance records for the previous two months were incomplete.' },
      { id: 4, item: 'Overtime Records', result: 'FAIL', remarks: 'Overtime register missing double-rate calculation breakdown for shift B workers.' },
      { id: 5, item: 'Wage Register', result: 'PASS', remarks: 'Form B wage register maintained up to date.' },
      { id: 6, item: 'Employee Records', result: 'PASS', remarks: 'Worker register entries verified against physical count.' },
      { id: 7, item: 'Statutory Records', result: 'FAIL', remarks: 'Form IV notice of opening and wage rate display missing in main work area.' }
    ],
    observations: [
      { id: 'OBS-301', category: 'WAGES', description: 'Wage payment records showed delays for a section of contractual workers during August 2026.', severity: 'HIGH', status: 'RECORDED' },
      { id: 'OBS-302', category: 'OVERTIME', description: 'Overtime records were not maintained consistently across shift schedules.', severity: 'MEDIUM', status: 'RECORDED' },
      { id: 'OBS-303', category: 'STATUTORY_RECORDS', description: 'Some required statutory notices and register copies were not available during site inspection.', severity: 'HIGH', status: 'RECORDED' }
    ],
    findings: [
      { id: 'FND-401', category: 'Wage Compliance', description: 'Evidence indicates delayed wage payments and incomplete attendance logging for contract workers.', severity: 'HIGH', inspectorRemarks: 'Officer review required for statutory notice issuance.' }
    ],
    evidence: [
      { id: 'EVD-901', fileName: 'attendance_register_oct.pdf', fileType: 'application/pdf', uploadDate: '2026-10-06', relatedTo: 'Attendance Records' },
      { id: 'EVD-902', fileName: 'wage_register_sample.pdf', fileType: 'application/pdf', uploadDate: '2026-10-06', relatedTo: 'Wage Register' },
      { id: 'EVD-903', fileName: 'inspection_observation_01.jpg', fileType: 'image/jpeg', uploadDate: '2026-10-06', relatedTo: 'Statutory Records' }
    ]
  },
  {
    id: 'INS-1002',
    establishmentId: 'EST-1002',
    establishmentName: 'Kongu Engineering Works',
    registrationNumber: 'TN-CBE-2024-00180',
    district: 'Coimbatore',
    industry: 'Engineering & Metallurgy',
    totalEmployees: 180,
    ownerName: 'S. Loganathan',
    scheduledDate: '2026-10-06',
    inspectionType: 'Routine',
    priority: 'MEDIUM',
    riskLevel: 'MEDIUM',
    riskScore: 54,
    status: 'ASSIGNED',
    instructions: 'Verify statutory register compliance for night shift workers and overtime wage calculations.',
    previousInspectionSummary: 'Inspected on 20 May 2025; fully compliant.',
    complianceSummary: 'All periodic statutory returns submitted on time.',
    wageInfoSummary: 'Minimum wage rate: ₹580/day. 180 workers covered.',
    checklist: [
      { id: 1, item: 'Minimum Wage Compliance', result: 'PASS', remarks: 'Wage rates compliant with engineering sector minimum wages.' },
      { id: 2, item: 'Timely Wage Payment', result: 'PASS', remarks: 'Paid on 5th of every month.' },
      { id: 3, item: 'Attendance Records', result: 'PASS', remarks: 'Biometric attendance register properly synced.' }
    ],
    observations: [],
    findings: [],
    evidence: []
  }
];

// 2. UPCOMING INSPECTIONS (Scheduled future dates > today)
export const DUMMY_UPCOMING_INSPECTIONS: InspectorInspectionItem[] = [
  {
    id: 'INS-1003',
    establishmentId: 'EST-1003',
    establishmentName: 'Tamil Nadu Garments',
    registrationNumber: 'TN-TPR-2024-00320',
    district: 'Tiruppur',
    industry: 'Garment Manufacturing',
    totalEmployees: 320,
    ownerName: 'K. Palanisamy',
    scheduledDate: '2026-10-09',
    inspectionType: 'Risk-Based',
    priority: 'HIGH',
    riskLevel: 'CRITICAL',
    riskScore: 89,
    status: 'ASSIGNED',
    instructions: 'Investigate minimum wage payment delays reported in Q2 statutory returns and verify wage registers.'
  },
  {
    id: 'INS-1004',
    establishmentId: 'EST-1004',
    establishmentName: 'Kaveri Industries',
    registrationNumber: 'TN-SLM-2024-00150',
    district: 'Salem',
    industry: 'Chemical & Processing',
    totalEmployees: 150,
    ownerName: 'M. Sampath',
    scheduledDate: '2026-10-11',
    inspectionType: 'Routine',
    priority: 'MEDIUM',
    riskLevel: 'MEDIUM',
    riskScore: 45,
    status: 'ASSIGNED',
    instructions: 'Routine statutory inspection of wage registers and employee safety allowances.'
  },
  {
    id: 'INS-1005',
    establishmentId: 'EST-1005',
    establishmentName: 'Sri Lakshmi Mills',
    registrationNumber: 'TN-TPR-2024-00210',
    district: 'Tiruppur',
    industry: 'Textile Spinning',
    totalEmployees: 210,
    ownerName: 'A. Ramanathan',
    scheduledDate: '2026-10-13',
    inspectionType: 'Risk-Based',
    priority: 'HIGH',
    riskLevel: 'HIGH',
    riskScore: 72,
    status: 'ASSIGNED',
    instructions: 'Risk-triggered inspection based on overtime anomalies.'
  }
];

// 3. FOLLOW-UP INSPECTIONS (Re-inspections for violation verification)
export const DUMMY_FOLLOWUP_INSPECTIONS: InspectorInspectionItem[] = [
  {
    id: 'FU-2001',
    establishmentId: 'EST-1001',
    establishmentName: 'ABC Textiles Pvt Ltd',
    registrationNumber: 'TN-ERD-2024-00125',
    district: 'Erode',
    industry: 'Textile Manufacturing',
    totalEmployees: 250,
    ownerName: 'R. Sakthivel',
    scheduledDate: '2026-10-15',
    inspectionType: 'Follow-up',
    priority: 'HIGH',
    riskLevel: 'HIGH',
    riskScore: 78,
    status: 'ASSIGNED',
    followUpFor: 'VIO-1025',
    relatedViolation: 'VIO-1025',
    requiredAction: 'Maintain complete attendance records and update statutory registers.',
    employerProof: 'attendance_records_sep_oct.pdf',
    verificationObservation: 'Records were updated and available for physical verification during re-inspection.'
  },
  {
    id: 'FU-2002',
    establishmentId: 'EST-1002',
    establishmentName: 'Kongu Engineering Works',
    registrationNumber: 'TN-CBE-2024-00180',
    district: 'Coimbatore',
    industry: 'Engineering & Metallurgy',
    totalEmployees: 180,
    ownerName: 'S. Loganathan',
    scheduledDate: '2026-10-18',
    inspectionType: 'Follow-up',
    priority: 'MEDIUM',
    riskLevel: 'MEDIUM',
    riskScore: 54,
    status: 'ASSIGNED',
    followUpFor: 'VIO-1026',
    relatedViolation: 'VIO-1026',
    requiredAction: 'Disburse pending overtime allowances to shift B workers.',
    employerProof: 'overtime_disbursement_proof.pdf',
    verificationObservation: 'Partial bank transfer statements submitted by employer.'
  }
];

// 4. DRAFT REPORTS (In-progress unsubmitted reports)
export const DUMMY_DRAFT_REPORTS = [
  {
    id: 'RPT-5001',
    inspectionId: 'INS-0999',
    establishmentName: 'Salem Engineering Works',
    registrationNumber: 'TN-SLM-2024-00199',
    district: 'Salem',
    industry: 'Engineering & Fabrication',
    totalEmployees: 140,
    ownerName: 'K. Subramaniam',
    scheduledDate: '2026-10-04',
    inspectionDate: '2026-10-04',
    riskLevel: 'HIGH',
    riskScore: 76,
    status: 'DRAFT',
    progressSummary: 'Checklist 60% completed, 2 Observations recorded, 1 Finding, 1 Evidence file attached',
    checklist: [
      { id: 1, item: 'Minimum Wage Compliance', result: 'PASS', remarks: 'Minimum wage rates verified against notification.' },
      { id: 2, item: 'Timely Wage Payment', result: 'PASS', remarks: 'Bank disbursement statements verified.' },
      { id: 3, item: 'Attendance Records', result: 'FAIL', remarks: 'Night shift attendance log incomplete.' },
      { id: 4, item: 'Overtime Records', result: 'FAIL', remarks: 'Overtime registers lack break logs.' }
    ],
    observations: [
      { id: 'OBS-310', category: 'OVERTIME', description: 'Overtime registers missing break logs for night shift workers.', severity: 'MEDIUM', status: 'RECORDED' },
      { id: 'OBS-311', category: 'STATUTORY_RECORDS', description: 'Statutory wage notice board missing at main factory gate.', severity: 'MEDIUM', status: 'RECORDED' }
    ],
    findings: [
      { id: 'FND-410', category: 'Overtime Compliance', description: 'Incomplete overtime register maintenance.', severity: 'MEDIUM', inspectorRemarks: 'Officer review requested.' }
    ],
    evidence: [
      { id: 'EVD-910', fileName: 'salem_shift_log.pdf', fileType: 'application/pdf', uploadDate: '2026-10-04', relatedTo: 'Attendance Records' }
    ]
  },
  {
    id: 'RPT-5002',
    inspectionId: 'INS-0998',
    establishmentName: 'Kaveri Processing Unit',
    registrationNumber: 'TN-ERD-2024-00188',
    district: 'Erode',
    industry: 'Agro Processing',
    totalEmployees: 110,
    ownerName: 'M. Velusamy',
    scheduledDate: '2026-10-03',
    inspectionDate: '2026-10-03',
    riskLevel: 'MEDIUM',
    riskScore: 52,
    status: 'DRAFT',
    progressSummary: 'Checklist 40% completed, 1 Observation recorded, 0 Findings',
    checklist: [
      { id: 1, item: 'Minimum Wage Compliance', result: 'PASS', remarks: 'Compliant.' },
      { id: 2, item: 'Timely Wage Payment', result: 'PASS', remarks: 'Compliant.' },
      { id: 3, item: 'Attendance Records', result: 'FAIL', remarks: 'Attendance log missing September entries.' }
    ],
    observations: [
      { id: 'OBS-312', category: 'ATTENDANCE', description: 'September attendance register entries unverified.', severity: 'LOW', status: 'RECORDED' }
    ],
    findings: [],
    evidence: []
  }
];

// 5. SUBMITTED REPORTS (Completed reports sent to Labour Officer)
export const DUMMY_SUBMITTED_REPORTS = [
  {
    id: 'RPT-4901',
    inspectionId: 'INS-0995',
    establishmentName: 'Sri Lakshmi Mills',
    registrationNumber: 'TN-TPR-2024-00210',
    district: 'Tiruppur',
    industry: 'Textile Spinning',
    totalEmployees: 210,
    ownerName: 'A. Ramanathan',
    scheduledDate: '2026-10-02',
    inspectionDate: '2026-10-02',
    submittedDate: '2026-10-03',
    riskLevel: 'HIGH',
    riskScore: 72,
    status: 'SUBMITTED',
    inspectorRemarks: 'Field inspection completed. Overtime calculation discrepancies noted and submitted for Labour Officer decision.',
    checklist: [
      { id: 1, item: 'Minimum Wage Compliance', result: 'PASS', remarks: 'Compliant.' },
      { id: 2, item: 'Overtime Records', result: 'FAIL', remarks: 'Discrepancies noted in calculation sheets.' }
    ],
    observations: [
      { id: 'OBS-290', category: 'OVERTIME', description: 'Overtime calculations for spinning section require revision.', severity: 'HIGH', status: 'RECORDED' }
    ],
    findings: [
      { id: 'FND-390', category: 'Overtime Discrepancy', description: 'Underpayment of overtime rates detected.', severity: 'HIGH', inspectorRemarks: 'Officer confirmation requested.' }
    ],
    evidence: [
      { id: 'EVD-890', fileName: 'lakshmi_mills_wage_sheet.pdf', fileType: 'application/pdf', uploadDate: '2026-10-02', relatedTo: 'Overtime Records' }
    ]
  },
  {
    id: 'RPT-4902',
    inspectionId: 'INS-0994',
    establishmentName: 'Delta Engineering',
    registrationNumber: 'TN-CHE-2024-00095',
    district: 'Chennai',
    industry: 'Precision Tools',
    totalEmployees: 95,
    ownerName: 'P. Sengottaiyan',
    scheduledDate: '2026-09-30',
    inspectionDate: '2026-09-30',
    submittedDate: '2026-10-01',
    riskLevel: 'MEDIUM',
    riskScore: 48,
    status: 'SUBMITTED',
    inspectorRemarks: 'Statutory registers verified; minor notice board display issue reported to Officer.',
    checklist: [
      { id: 1, item: 'Minimum Wage Compliance', result: 'PASS', remarks: 'Compliant.' },
      { id: 2, item: 'Statutory Records', result: 'FAIL', remarks: 'Notice board missing in factory entrance.' }
    ],
    observations: [],
    findings: [],
    evidence: []
  },
  {
    id: 'RPT-4903',
    inspectionId: 'INS-0993',
    establishmentName: 'Kongu Engineering Works',
    registrationNumber: 'TN-CBE-2024-00180',
    district: 'Coimbatore',
    industry: 'Engineering & Metallurgy',
    totalEmployees: 180,
    ownerName: 'S. Loganathan',
    scheduledDate: '2026-09-28',
    inspectionDate: '2026-09-28',
    submittedDate: '2026-09-29',
    riskLevel: 'HIGH',
    riskScore: 74,
    status: 'SUBMITTED',
    inspectorRemarks: 'Wage registers inspected; submitted for Officer violation confirmation.',
    checklist: [
      { id: 1, item: 'Minimum Wage Compliance', result: 'PASS', remarks: 'Compliant.' }
    ],
    observations: [],
    findings: [],
    evidence: []
  }
];

// 6. INSPECTION HISTORY (Older completed historical inspection records)
export const DUMMY_INSPECTION_HISTORY = [
  {
    id: 'INS-0901',
    establishmentName: 'ABC Industries',
    district: 'Chennai',
    inspectionDate: '2026-09-15',
    inspectionType: 'Routine',
    result: 'COMPLETED',
    findingsSummary: '1 minor wage anomaly detected and corrected',
    followUpStatus: 'CLOSED'
  },
  {
    id: 'INS-0902',
    establishmentName: 'Salem Engineering',
    district: 'Salem',
    inspectionDate: '2026-09-12',
    inspectionType: 'Risk-Based',
    result: 'COMPLETED',
    findingsSummary: 'Fully compliant across all statutory wage heads',
    followUpStatus: 'NOT_REQUIRED'
  },
  {
    id: 'INS-0903',
    establishmentName: 'Kongu Mills',
    district: 'Coimbatore',
    inspectionDate: '2026-09-08',
    inspectionType: 'Routine',
    result: 'COMPLETED',
    findingsSummary: 'Attendance register update delay resolved',
    followUpStatus: 'CLOSED'
  },
  {
    id: 'INS-0904',
    establishmentName: 'Kaveri Textiles',
    district: 'Erode',
    inspectionDate: '2026-09-01',
    inspectionType: 'Risk-Based',
    result: 'COMPLETED',
    findingsSummary: 'Overtime rate calculation mismatch rectified',
    followUpStatus: 'CLOSED'
  }
];
