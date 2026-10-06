export const EMPLOYER_ESTABLISHMENT_DATA = {
  id: 'EST-001',
  establishmentName: 'ABC Textiles Pvt Ltd',
  registrationNumber: 'TN-ERD-2024-00125',
  establishmentType: 'Factory',
  industry: 'Textile Manufacturing',
  district: 'Erode',
  address: 'Perundurai Industrial Area, Erode, Tamil Nadu - 638052',
  totalEmployees: 250,
  ownerName: 'Kumar',
  designation: 'Authorized Representative',
  email: 'employer@example.com',
  phone: '+91 98765 43210',
  registrationDate: '2024-08-15',
  verificationStatus: 'VERIFIED',
  documentVerificationStatus: 'APPROVED',
  officerRemarks: 'All submitted registration documents have been verified and approved by the Labour Department Officer.'
};

export const EMPLOYER_REGISTRATION_STATUS_STEPS = [
  { step: 'Registration Submitted', completed: true, date: '15 Aug 2024' },
  { step: 'Documents Uploaded', completed: true, date: '15 Aug 2024' },
  { step: 'Document Verification', completed: true, date: '18 Aug 2024' },
  { step: 'Officer Review', completed: true, date: '20 Aug 2024' },
  { step: 'Registration Verified', completed: true, date: '22 Aug 2024' }
];

export const EMPLOYER_CURRENT_COMPLIANCE = {
  period: 'September 2026',
  submissionDate: '2026-10-01',
  totalEmployees: 250,
  minWageCompliant: 'YES',
  wagePaymentCompleted: 'YES',
  delayedWorkers: 8,
  overtimeApplicable: 'YES',
  overtimeWorkers: 35,
  overtimeHours: 420,
  overtimePayment: 'YES',
  attendanceRecords: 'MAINTAINED',
  wageRegister: 'AVAILABLE',
  employeeRecords: 'AVAILABLE',
  status: 'UNDER_REVIEW',
  supportingDocs: ['wage_register_sep_2026.pdf', 'attendance_register_sep_2026.pdf', 'overtime_register_sep_2026.pdf']
};

export const EMPLOYER_COMPLIANCE_HISTORY = [
  { id: 'CMP-1001', period: 'Sep 2026', submissionDate: '2026-10-01', workers: 250, status: 'UNDER_REVIEW', reviewDate: 'Pending' },
  { id: 'CMP-0987', period: 'Aug 2026', submissionDate: '2026-09-02', workers: 245, status: 'ACCEPTED', reviewDate: '2026-09-05' },
  { id: 'CMP-0972', period: 'Jul 2026', submissionDate: '2026-08-02', workers: 240, status: 'ACCEPTED', reviewDate: '2026-08-04' },
  { id: 'CMP-0958', period: 'Jun 2026', submissionDate: '2026-07-02', workers: 238, status: 'CORRECTION_REQUIRED', reviewDate: '2026-07-05' }
];

export const EMPLOYER_DOCUMENTS = [
  { id: 'REG-001', docName: 'Registration Certificate', docType: 'Registration Certificate', fileName: 'reg_certificate_2024.pdf', uploadedAt: '2024-08-15', verificationStatus: 'APPROVED', remarks: 'Verified by Labour Department Officer' },
  { id: 'DOC-002', docName: 'Establishment / Business Proof', docType: 'Establishment Proof', fileName: 'factory_lease_deed.pdf', uploadedAt: '2024-08-15', verificationStatus: 'APPROVED', remarks: 'Verified by Officer' },
  { id: 'DOC-003', docName: 'Employer Authorization Proof', docType: 'Authorization Proof', fileName: 'authorization_letter.pdf', uploadedAt: '2024-08-15', verificationStatus: 'APPROVED', remarks: 'Verified by Officer' },
  { id: 'DOC-004', docName: 'Wage Register - September 2026', docType: 'Wage Register - Sep 2026', fileName: 'wage_register_sep_2026.pdf', uploadedAt: '2026-10-01', verificationStatus: 'PENDING', remarks: 'Awaiting Officer review' },
  { id: 'DOC-005', docName: 'Attendance Register - September 2026', docType: 'Attendance Register', fileName: 'attendance_register_sep_2026.pdf', uploadedAt: '2026-10-01', verificationStatus: 'PENDING', remarks: 'Awaiting Officer review' }
];

export const EMPLOYER_UPCOMING_INSPECTIONS = [
  { id: 'INS-1001', establishmentName: 'ABC Textiles Pvt Ltd', inspectionDate: '2026-10-06', inspectionType: 'Risk-Based', inspectorName: 'Rajesh Kumar', riskLevel: 'HIGH', status: 'ASSIGNED', instructions: 'Verify overtime wage registers and attendance log completeness.' },
  { id: 'INS-1004', establishmentName: 'ABC Textiles Pvt Ltd', inspectionDate: '2026-10-18', inspectionType: 'Follow-up', inspectorName: 'Rajesh Kumar', riskLevel: 'HIGH', status: 'SCHEDULED', instructions: 'Verify completion of statutory notice board installation.' }
];

export const EMPLOYER_INSPECTION_HISTORY = [
  { id: 'INS-0901', inspectionDate: '2026-09-15', inspectionType: 'Routine', inspectorName: 'Rajesh Kumar', result: 'COMPLETED', followUpStatus: 'CLOSED', remarks: '1 minor wage anomaly detected and warning issued' },
  { id: 'INS-0875', inspectionDate: '2026-08-12', inspectionType: 'Risk-Based', inspectorName: 'Rajesh Kumar', result: 'COMPLETED', followUpStatus: 'CLOSED', remarks: 'Overtime payment discrepancy resolved' },
  { id: 'INS-0842', inspectionDate: '2026-07-10', inspectionType: 'Routine', inspectorName: 'Rajesh Kumar', result: 'COMPLETED', followUpStatus: 'NOT_REQUIRED', remarks: 'Fully compliant' },
  { id: 'INS-0801', inspectionDate: '2026-06-08', inspectionType: 'Risk-Based', inspectorName: 'Rajesh Kumar', result: 'COMPLETED', followUpStatus: 'CLOSED', remarks: 'Attendance register gap rectified' }
];

export const EMPLOYER_NOTICES = [
  { id: 'N-3001', noticeNumber: 'TN/ERD/2026/N-3001', issueDate: '2026-10-05', category: 'Wage Compliance', severity: 'HIGH', issue: 'Delayed wage payment for contractual workers during August 2026', responseDeadline: '2026-10-15', status: 'RESPONSE_REQUIRED' },
  { id: 'N-3002', noticeNumber: 'TN/ERD/2026/N-3002', issueDate: '2026-10-03', category: 'Overtime Compliance', severity: 'MEDIUM', issue: 'Incomplete overtime break logs for shift B workers', responseDeadline: '2026-10-13', status: 'RESPONSE_SUBMITTED' }
];

export const EMPLOYER_EXPLANATIONS = [
  { id: 'EXP-5001', noticeId: 'N-3001', noticeNumber: 'TN/ERD/2026/N-3001', submittedDate: '2026-10-07', explanationText: 'The wage payment delay occurred due to a temporary banking gateway timeout during payroll processing. All pending wages have now been fully disbursed to contract worker bank accounts.', supportingDoc: 'salary_payment_receipt.pdf', status: 'UNDER_REVIEW' },
  { id: 'EXP-5002', noticeId: 'N-3002', noticeNumber: 'TN/ERD/2026/N-3002', submittedDate: 'Pending', explanationText: '', supportingDoc: '', status: 'PENDING' }
];

export const EMPLOYER_CORRECTIVE_ACTIONS = [
  { id: 'CA-4001', relatedViolation: 'VIO-1025', requiredAction: 'Maintain complete attendance records.', employerResponse: 'Biometric attendance registers have been updated and synced for all 250 workers across all shifts.', proofDocument: 'attendance_records_oct.pdf', submittedDate: '2026-10-08', status: 'UNDER_REVIEW' },
  { id: 'CA-4002', relatedViolation: 'VIO-1026', requiredAction: 'Maintain complete overtime break records.', employerResponse: '', proofDocument: '', submittedDate: '', status: 'CORRECTION_REQUIRED' }
];

export const EMPLOYER_FOLLOWUPS = [
  { id: 'FU-2001', relatedViolation: 'VIO-1025', scheduledDate: '2026-10-15', status: 'PENDING' }
];

export const EMPLOYER_KPI_STATS = {
  registrationStatus: 'VERIFIED',
  complianceStatus: 'UNDER REVIEW',
  upcomingInspections: 2,
  openNotices: 2,
  pendingCorrectiveActions: 1
};
