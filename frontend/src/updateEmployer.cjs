const fs = require('fs');

let mainPath = 'c:/Folders/Projects/Wage_Compliance/frontend/src/main.tsx';
let main = fs.readFileSync(mainPath, 'utf8');

// 1. Add import statement for employerDummyData
if (!main.includes("from './employerDummyData'")) {
  const importLine = `import {\n  EMPLOYER_ESTABLISHMENT_DATA,\n  EMPLOYER_REGISTRATION_STATUS_STEPS,\n  EMPLOYER_CURRENT_COMPLIANCE,\n  EMPLOYER_COMPLIANCE_HISTORY,\n  EMPLOYER_DOCUMENTS,\n  EMPLOYER_UPCOMING_INSPECTIONS,\n  EMPLOYER_INSPECTION_HISTORY,\n  EMPLOYER_NOTICES,\n  EMPLOYER_EXPLANATIONS,\n  EMPLOYER_CORRECTIVE_ACTIONS,\n  EMPLOYER_FOLLOWUPS,\n  EMPLOYER_KPI_STATS\n} from './employerDummyData';\n`;
  main = main.replace("import './styles.css';", `import './styles.css';\n${importLine}`);
}

// 2. Remove Notifications from EMPLOYER_NAV
const oldEmployerNav = `const EMPLOYER_NAV: NavItem[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'My Establishment', label: 'My Establishment', icon: Building2,
    subitems: [
      { id: 'Establishment Details', label: 'Establishment Details' },
      { id: 'Registration', label: 'Registration' },
      { id: 'Registration Status', label: 'Registration Status' }
    ]
  },
  {
    id: 'Compliance', label: 'Compliance', icon: ShieldCheck,
    subitems: [
      { id: 'Submit Compliance', label: 'Submit Compliance' },
      { id: 'Compliance History', label: 'Compliance History' },
      { id: 'Documents', label: 'Documents' }
    ]
  },
  {
    id: 'Inspections', label: 'Inspections', icon: ClipboardCheck,
    subitems: [
      { id: 'Upcoming', label: 'Upcoming' },
      { id: 'Inspection Details', label: 'Inspection Details' },
      { id: 'Inspection History', label: 'Inspection History' }
    ]
  },
  {
    id: 'Actions', label: 'Actions', icon: AlertTriangle,
    subitems: [
      { id: 'Notices', label: 'Notices' },
      { id: 'Explanations', label: 'Explanations' },
      { id: 'Corrective Actions', label: 'Corrective Actions' }
    ]
  },
  { id: 'Notifications', label: 'Notifications', icon: Bell },
  { id: 'Profile', label: 'Profile', icon: User }
];`;

const newEmployerNav = `const EMPLOYER_NAV: NavItem[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'My Establishment', label: 'My Establishment', icon: Building2,
    subitems: [
      { id: 'Establishment Details', label: 'Establishment Details' },
      { id: 'Registration', label: 'Registration' },
      { id: 'Registration Status', label: 'Registration Status' }
    ]
  },
  {
    id: 'Compliance', label: 'Compliance', icon: ShieldCheck,
    subitems: [
      { id: 'Submit Compliance', label: 'Submit Compliance' },
      { id: 'Compliance History', label: 'Compliance History' },
      { id: 'Documents', label: 'Documents' }
    ]
  },
  {
    id: 'Inspections', label: 'Inspections', icon: ClipboardCheck,
    subitems: [
      { id: 'Upcoming', label: 'Upcoming' },
      { id: 'Inspection Details', label: 'Inspection Details' },
      { id: 'Inspection History', label: 'Inspection History' }
    ]
  },
  {
    id: 'Actions', label: 'Actions', icon: AlertTriangle,
    subitems: [
      { id: 'Notices', label: 'Notices' },
      { id: 'Explanations', label: 'Explanations' },
      { id: 'Corrective Actions', label: 'Corrective Actions' }
    ]
  },
  { id: 'Profile', label: 'Profile', icon: User }
];`;

main = main.replace(oldEmployerNav, newEmployerNav);

// 3. Remove Notifications case from router switch for EMPLOYER
const oldEmployerRouter = `    if (u.role === 'EMPLOYER') {
      switch (activeMain) {
        case 'My Establishment':
          return <EmployerEstablishmentModule subTab={activeSub || 'Establishment Details'} />;
        case 'Compliance':
          return <EmployerComplianceModule subTab={activeSub || 'Submit Compliance'} />;
        case 'Inspections':
          return <EmployerInspectionsModule subTab={activeSub || 'Upcoming'} />;
        case 'Actions':
          return <EmployerActionsModule subTab={activeSub || 'Notices'} />;
        case 'Notifications':
          return <NotificationsModule />;
        case 'Profile':
          return <ProfileModule user={u} onUpdateUser={setU} />;
        default:
          return <EmployerDashboard onNavigate={handleSelectNav} />;
      }
    }`;

const newEmployerRouter = `    if (u.role === 'EMPLOYER') {
      switch (activeMain) {
        case 'My Establishment':
          return <EmployerEstablishmentModule subTab={activeSub || 'Establishment Details'} />;
        case 'Compliance':
          return <EmployerComplianceModule subTab={activeSub || 'Submit Compliance'} />;
        case 'Inspections':
          return <EmployerInspectionsModule subTab={activeSub || 'Upcoming'} />;
        case 'Actions':
          return <EmployerActionsModule subTab={activeSub || 'Notices'} />;
        case 'Profile':
          return <ProfileModule user={u} onUpdateUser={setU} />;
        default:
          return <EmployerDashboard onNavigate={handleSelectNav} />;
      }
    }`;

main = main.replace(oldEmployerRouter, newEmployerRouter);

// 4. Update Employer components
const employerStartMarker = `function EmployerDashboard({ onNavigate }: { onNavigate: (main: string, sub: string) => void }) {`;
const employerEndMarker = `function ProfileModule({ user, onUpdateUser }: { user: UserType; onUpdateUser?: (u: UserType) => void }) {`;

const startIdx = main.indexOf(employerStartMarker);
const endIdx = main.indexOf(employerEndMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Failed to locate start/end markers for Employer modules in main.tsx', startIdx, endIdx);
  process.exit(1);
}

const newEmployerModules = `function EmployerDashboard({ onNavigate }: { onNavigate: (main: string, sub: string) => void }) {
  const [d, setD] = useState<ApiData>({});

  useEffect(() => {
    api('/dashboard/employer').then(setD).catch(() => {});
  }, []);

  const est = d.establishment || EMPLOYER_ESTABLISHMENT_DATA;

  return (
    <>
      <Hero
        title="Employer Compliance Dashboard"
        text="Single-establishment portal for statutory wage compliance, document uploads, inspection tracking, and notice responses."
      />

      {/* 5 KPI Metric Cards */}
      <div className="metrics">
        <Card name="Registration Status" value={est.verificationStatus || EMPLOYER_KPI_STATS.registrationStatus} Icon={Building2} colorClass="blue" />
        <Card name="Compliance Status" value={EMPLOYER_KPI_STATS.complianceStatus} Icon={ShieldCheck} colorClass="green" />
        <Card name="Upcoming Inspections" value={EMPLOYER_KPI_STATS.upcomingInspections} Icon={ClipboardCheck} colorClass="purple" />
        <Card name="Open Notices" value={EMPLOYER_KPI_STATS.openNotices} Icon={AlertTriangle} colorClass="red" />
        <Card name="Pending Corrective Actions" value={EMPLOYER_KPI_STATS.pendingCorrectiveActions} Icon={CheckCircle2} colorClass="orange" />
      </div>

      {/* 5 Specific Summary Panels */}
      <div className="grid" style={{ marginBottom: 24, gridTemplateColumns: '1fr 1fr' }}>
        {/* 1. Registration Summary */}
        <article className="panel">
          <div className="panel-title">
            <h3>Registration Summary</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('My Establishment', 'Registration Status')}>View Status</button>
          </div>
          <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
            <div><b>Establishment Name:</b> {est.establishmentName}</div>
            <div><b>Registration No:</b> {est.registrationNumber}</div>
            <div><b>Registration Status:</b> <Badge value={est.verificationStatus || 'VERIFIED'} /></div>
            <div><b>Document Status:</b> <Badge value={est.documentVerificationStatus || 'APPROVED'} /></div>
          </div>
        </article>

        {/* 2. Current Compliance */}
        <article className="panel">
          <div className="panel-title">
            <h3>Current Statutory Compliance</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('Compliance', 'Submit Compliance')}>Submit Return</button>
          </div>
          <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
            <div><b>Compliance Period:</b> {EMPLOYER_CURRENT_COMPLIANCE.period}</div>
            <div><b>Submission Date:</b> {EMPLOYER_CURRENT_COMPLIANCE.submissionDate}</div>
            <div><b>Workers Covered:</b> {EMPLOYER_CURRENT_COMPLIANCE.totalEmployees}</div>
            <div><b>Status:</b> <Badge value={EMPLOYER_CURRENT_COMPLIANCE.status} /></div>
          </div>
        </article>

        {/* 3. Upcoming Inspection */}
        <article className="panel">
          <div className="panel-title">
            <h3>Upcoming Scheduled Inspection</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('Inspections', 'Upcoming')}>View Details</button>
          </div>
          <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
            <div><b>Inspection ID:</b> <b>{EMPLOYER_UPCOMING_INSPECTIONS[0].id}</b></div>
            <div><b>Scheduled Date:</b> {EMPLOYER_UPCOMING_INSPECTIONS[0].inspectionDate}</div>
            <div><b>Inspection Type:</b> {EMPLOYER_UPCOMING_INSPECTIONS[0].inspectionType}</div>
            <div><b>Status:</b> <Badge value={EMPLOYER_UPCOMING_INSPECTIONS[0].status} /></div>
          </div>
        </article>

        {/* 4. Open Statutory Notice */}
        <article className="panel">
          <div className="panel-title">
            <h3>Open Statutory Notice</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('Actions', 'Notices')}>Respond</button>
          </div>
          <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
            <div><b>Notice ID:</b> <b>{EMPLOYER_NOTICES[0].id}</b></div>
            <div><b>Category:</b> {EMPLOYER_NOTICES[0].category}</div>
            <div><b>Severity:</b> <Badge value={EMPLOYER_NOTICES[0].severity} /></div>
            <div><b>Response Due:</b> {EMPLOYER_NOTICES[0].responseDeadline}</div>
            <div><b>Status:</b> <Badge value={EMPLOYER_NOTICES[0].status} /></div>
          </div>
        </article>
      </div>

      {/* 5. Pending Corrective Action Panel */}
      <section className="panel table-panel">
        <div className="panel-title">
          <div>
            <h3>Pending Corrective Action</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Action items required to fix statutory wage anomalies identified during inspection.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('Actions', 'Corrective Actions')}>View All Actions</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Action ID</th>
                <th>Related Violation</th>
                <th>Required Action</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {EMPLOYER_CORRECTIVE_ACTIONS.map(ca => (
                <tr key={ca.id}>
                  <td><b>{ca.id}</b></td>
                  <td><Badge value={ca.relatedViolation} /></td>
                  <td>{ca.requiredAction}</td>
                  <td><Badge value={ca.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function EmployerEstablishmentModule({ subTab }: { subTab: string }) {
  const [est, setEst] = useState<any | null>(EMPLOYER_ESTABLISHMENT_DATA);
  const [formData, setFormData] = useState({
    establishmentName: EMPLOYER_ESTABLISHMENT_DATA.establishmentName,
    industry: EMPLOYER_ESTABLISHMENT_DATA.industry,
    registrationNumber: EMPLOYER_ESTABLISHMENT_DATA.registrationNumber,
    districtId: EMPLOYER_ESTABLISHMENT_DATA.district,
    address: EMPLOYER_ESTABLISHMENT_DATA.address,
    ownerName: EMPLOYER_ESTABLISHMENT_DATA.ownerName,
    totalEmployees: EMPLOYER_ESTABLISHMENT_DATA.totalEmployees,
    phone: EMPLOYER_ESTABLISHMENT_DATA.phone,
    email: EMPLOYER_ESTABLISHMENT_DATA.email
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api('/employer/establishment').then(res => {
      if (res && res.establishmentName) {
        setEst({ ...EMPLOYER_ESTABLISHMENT_DATA, ...res });
        setFormData({
          establishmentName: res.establishmentName || EMPLOYER_ESTABLISHMENT_DATA.establishmentName,
          industry: res.industry || EMPLOYER_ESTABLISHMENT_DATA.industry,
          registrationNumber: res.registrationNumber || EMPLOYER_ESTABLISHMENT_DATA.registrationNumber,
          districtId: res.districtId || EMPLOYER_ESTABLISHMENT_DATA.district,
          address: res.address || EMPLOYER_ESTABLISHMENT_DATA.address,
          ownerName: res.ownerName || EMPLOYER_ESTABLISHMENT_DATA.ownerName,
          totalEmployees: res.totalEmployees || EMPLOYER_ESTABLISHMENT_DATA.totalEmployees,
          phone: res.phone || EMPLOYER_ESTABLISHMENT_DATA.phone,
          email: res.email || EMPLOYER_ESTABLISHMENT_DATA.email
        });
      }
    }).catch(() => {});
  }, [subTab]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setErr('');
    try {
      const res = await api('/establishments', {
        method: 'POST',
        body: JSON.stringify({ ...formData, totalEmployees: Number(formData.totalEmployees) })
      }).catch(() => ({ ...formData, verificationStatus: 'VERIFIED' }));
      setMsg('Establishment registration details saved and submitted for Officer verification!');
      setEst(res);
      setLoading(false);
    } catch (x: any) {
      setLoading(false);
      setErr(x.message || 'Failed to submit registration');
    }
  };

  if (subTab === 'Registration') {
    return (
      <>
        <Hero title="Establishment Registration" text="Submit official registration details of your establishment to the State Labour Department." />
        {msg && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 }}>{msg}</p>}
        {err && <p className="error" style={{ marginBottom: 20 }}>{err}</p>}

        <section className="panel" style={{ maxWidth: 750 }}>
          <div className="panel-title">
            <h3>Registered Establishment Information Form</h3>
          </div>
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>Establishment Name *
                <input value={formData.establishmentName} onChange={e => setFormData({ ...formData, establishmentName: e.target.value })} required style={{ width: '100%', marginTop: 6 }} />
              </label>
              <label>Registration / License Number *
                <input value={formData.registrationNumber} onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })} required style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>Establishment / Industry Type *
                <select value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                  <option value="Textile Manufacturing">Textiles & Garments</option>
                  <option value="Food Processing">Food Processing</option>
                  <option value="Manufacturing">Manufacturing & Engineering</option>
                  <option value="Logistics">Logistics & Warehousing</option>
                  <option value="Services">IT & Commercial Services</option>
                </select>
              </label>
              <label>District *
                <input value={formData.districtId} onChange={e => setFormData({ ...formData, districtId: e.target.value })} required style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>Employer / Authorized Representative Name
                <input value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} style={{ width: '100%', marginTop: 6 }} />
              </label>
              <label>Number of Workers *
                <input type="number" min={1} value={formData.totalEmployees} onChange={e => setFormData({ ...formData, totalEmployees: Number(e.target.value) })} required style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>Contact Phone Number
                <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 9876543210" style={{ width: '100%', marginTop: 6 }} />
              </label>
              <label>Official Email
                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="compliance@company.com" style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label>Premises Address *
                <textarea rows={3} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save & Update Registration Form'}
            </button>
          </form>
        </section>
      </>
    );
  }

  if (subTab === 'Registration Status') {
    return (
      <>
        <Hero title="Registration Verification Status" text="Track real-time progress of your establishment registration review by the Labour Department." />
        <section className="panel" style={{ maxWidth: 800 }}>
          <div className="panel-title">
            <h3>Statutory Registration Verification Progress</h3>
            <Badge value={est?.verificationStatus || 'VERIFIED'} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '24px 0', padding: '0 10px', position: 'relative' }}>
            {EMPLOYER_REGISTRATION_STATUS_STEPS.map((s, idx) => (
              <div key={idx} style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.completed ? '#059669' : '#cbd5e1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 700 }}>
                  {s.completed ? '✓' : idx + 1}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f2d59' }}>{s.step}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{s.date}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: 20, borderRadius: 8, fontSize: 14 }}>
            <div><b>Current Verification Status:</b> <Badge value={est?.verificationStatus || 'VERIFIED'} /></div>
            <div><b>Submitted Date:</b> {est?.registrationDate || '15 Aug 2024'}</div>
            <div><b>Document Verification:</b> <Badge value={est?.documentVerificationStatus || 'APPROVED'} /></div>
            <div><b>Officer Decision Date:</b> 22 Aug 2024</div>
            <div style={{ gridColumn: 'span 2' }}>
              <b>Officer Remarks:</b> <br />
              <span style={{ color: '#334155' }}>{est?.officerRemarks || EMPLOYER_ESTABLISHMENT_DATA.officerRemarks}</span>
            </div>
          </div>
        </section>
      </>
    );
  }

  // DEFAULT: Establishment Details
  return (
    <>
      <Hero title="My Establishment Details" text="View verified establishment profile, premises address, workforce count, and authorized contact information." />
      <section className="panel" style={{ maxWidth: 800 }}>
        <div className="panel-title">
          <h3>Registered Establishment Profile</h3>
          <Badge value={est?.verificationStatus || 'VERIFIED'} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: 20, borderRadius: 8, fontSize: 14 }}>
          <div><b>Establishment Name:</b> <br />{est?.establishmentName || EMPLOYER_ESTABLISHMENT_DATA.establishmentName}</div>
          <div><b>Registration Number:</b> <br />{est?.registrationNumber || EMPLOYER_ESTABLISHMENT_DATA.registrationNumber}</div>
          <div><b>Establishment Type:</b> <br />{est?.establishmentType || EMPLOYER_ESTABLISHMENT_DATA.establishmentType}</div>
          <div><b>Industry Sector:</b> <br />{est?.industry || EMPLOYER_ESTABLISHMENT_DATA.industry}</div>
          <div><b>District:</b> <br />{est?.district || EMPLOYER_ESTABLISHMENT_DATA.district}</div>
          <div><b>Total Workforce / Employees:</b> <br />{est?.totalEmployees || EMPLOYER_ESTABLISHMENT_DATA.totalEmployees} Workers</div>
          <div><b>Employer / Representative:</b> <br />{est?.ownerName || EMPLOYER_ESTABLISHMENT_DATA.ownerName} ({EMPLOYER_ESTABLISHMENT_DATA.designation})</div>
          <div><b>Contact Details:</b> <br />{est?.phone || EMPLOYER_ESTABLISHMENT_DATA.phone} | {est?.email || EMPLOYER_ESTABLISHMENT_DATA.email}</div>
          <div><b>Registration Date:</b> <br />{est?.registrationDate || EMPLOYER_ESTABLISHMENT_DATA.registrationDate}</div>
          <div><b>Document Verification Status:</b> <br /><Badge value={est?.documentVerificationStatus || 'APPROVED'} /></div>
          <div style={{ gridColumn: 'span 2' }}><b>Premises Address:</b> <br />{est?.address || EMPLOYER_ESTABLISHMENT_DATA.address}</div>
        </div>
      </section>
    </>
  );
}

function EmployerComplianceModule({ subTab }: { subTab: string }) {
  const [submissions, setSubmissions] = useState<any[]>(EMPLOYER_COMPLIANCE_HISTORY);
  const [docs, setDocs] = useState<any[]>(EMPLOYER_DOCUMENTS);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Submit Compliance Form States (Pre-populated for Sep 2026)
  const [period, setPeriod] = useState(EMPLOYER_CURRENT_COMPLIANCE.period);
  const [workers, setWorkers] = useState(EMPLOYER_CURRENT_COMPLIANCE.totalEmployees);
  const [wagesInfo, setWagesInfo] = useState('Full wage disbursement executed via direct bank transfer to all workers.');
  const [minWageCompliant, setMinWageCompliant] = useState(true);
  const [otInfo, setOtInfo] = useState('Overtime double rate paid to 35 workers for 420 total overtime hours.');
  const [attendanceMaintained, setAttendanceMaintained] = useState(true);
  const [recordsMaintained, setRecordsMaintained] = useState(true);
  const [remarks, setRemarks] = useState('Monthly statutory wage return for September 2026.');

  // Document Upload Form
  const [docName, setDocName] = useState('Wage Register - September 2026');
  const [docType, setDocType] = useState('Wage Register - Sep 2026');
  const [fileName, setFileName] = useState('wage_register_sep_2026.pdf');

  const loadComplianceData = () => {
    api('/compliance').then(res => {
      if (Array.isArray(res) && res.length) setSubmissions([...res, ...EMPLOYER_COMPLIANCE_HISTORY.filter(h => !res.some((r: any) => r.id === h.id))]);
    }).catch(() => {});
    api('/employer/documents').then(res => {
      if (Array.isArray(res) && res.length) setDocs([...res, ...EMPLOYER_DOCUMENTS.filter(d => !res.some((r: any) => r.id === d.id))]);
    }).catch(() => {});
  };

  useEffect(() => {
    loadComplianceData();
  }, [subTab]);

  const handleSubmitCompliance = async (isDraft: boolean) => {
    setMsg('');
    setErr('');
    try {
      await api('/compliance', {
        method: 'POST',
        body: JSON.stringify({
          compliancePeriod: period,
          totalEmployees: Number(workers),
          wagePaymentInformation: wagesInfo,
          minimumWageCompliant: minWageCompliant ? 'YES' : 'NO',
          overtimeInformation: otInfo,
          attendanceRecordsMaintained: attendanceMaintained ? 'YES' : 'NO',
          requiredRecordsMaintained: recordsMaintained ? 'YES' : 'NO',
          remarks,
          status: isDraft ? 'DRAFT' : 'SUBMITTED'
        })
      }).catch(() => {});
      setMsg(isDraft ? 'Compliance return draft saved successfully!' : 'Statutory wage return for September 2026 submitted successfully! Verification status is now UNDER_REVIEW.');
      loadComplianceData();
    } catch (x: any) {
      setErr(x.message || 'Failed to submit compliance');
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      const newDoc = await api('/employer/documents', {
        method: 'POST',
        body: JSON.stringify({ docName, docType, fileName })
      }).catch(() => ({
        id: 'DOC-' + Date.now(),
        docName,
        docType,
        fileName,
        uploadedAt: new Date().toISOString().slice(0, 10),
        verificationStatus: 'PENDING',
        remarks: 'Awaiting Officer review'
      }));
      setDocs([newDoc, ...docs]);
      setMsg('Document "' + docName + '" uploaded successfully. Verification status is now PENDING.');
    } catch (x: any) {
      setErr(x.message || 'Failed to upload document');
    }
  };

  if (subTab === 'Submit Compliance') {
    return (
      <>
        <Hero title="Submit Statutory Wage Compliance" text="File monthly statutory wage returns, overtime declarations, and attendance register compliance for September 2026." />
        {msg && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 }}>{msg}</p>}
        {err && <p className="error" style={{ marginBottom: 20 }}>{err}</p>}

        <section className="panel" style={{ maxWidth: 750 }}>
          <div className="panel-title">
            <h3>Statutory Wage Return Form — September 2026</h3>
            <Badge value={EMPLOYER_CURRENT_COMPLIANCE.status} />
          </div>
          <form onSubmit={e => { e.preventDefault(); handleSubmitCompliance(false); }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>Compliance Period *
                <input value={period} onChange={e => setPeriod(e.target.value)} required style={{ width: '100%', marginTop: 6 }} />
              </label>
              <label>Number of Covered Workers *
                <input type="number" min={1} value={workers} onChange={e => setWorkers(Number(e.target.value))} required style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>Minimum Wage Compliant *
                <select value={minWageCompliant ? 'YES' : 'NO'} onChange={e => setMinWageCompliant(e.target.value === 'YES')} className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                  <option value="YES">YES — All basic wage rates comply with Government notifications</option>
                  <option value="NO">NO — Exceptions or arrears pending</option>
                </select>
              </label>
              <label>Wage Payment Disbursement Status *
                <select className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                  <option value="YES">YES — 100% Wage payment completed via direct bank transfer</option>
                  <option value="NO">NO — Delayed payments recorded</option>
                </select>
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Wage Disbursement Information Summary *
                <textarea rows={2} value={wagesInfo} onChange={e => setWagesInfo(e.target.value)} required style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>Overtime Applicable *
                <select className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                  <option value="YES">YES — 35 workers worked 420 total overtime hours</option>
                  <option value="NO">NO — No overtime worked</option>
                </select>
              </label>
              <label>Attendance Register Maintained *
                <select value={attendanceMaintained ? 'YES' : 'NO'} onChange={e => setAttendanceMaintained(e.target.value === 'YES')} className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                  <option value="YES">YES — Biometric attendance registers maintained up to date</option>
                  <option value="NO">NO</option>
                </select>
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Overtime Disbursement & Record Summary
                <textarea rows={2} value={otInfo} onChange={e => setOtInfo(e.target.value)} style={{ width: '100%', marginTop: 6 }} />
              </label>
            </div>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 6, marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 8px', color: '#0f2d59', fontSize: 13 }}>Attached Supporting Returns Documents</h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#2563eb' }}>
                {EMPLOYER_CURRENT_COMPLIANCE.supportingDocs.map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">Submit Wage Return for Review</button>
              <button type="button" className="btn btn-secondary" onClick={() => handleSubmitCompliance(true)}>Save Draft</button>
            </div>
          </form>
        </section>
      </>
    );
  }

  if (subTab === 'Compliance History') {
    return (
      <>
        <Hero title="Compliance Return History" text="Historical record of periodic statutory wage compliance returns submitted by your establishment." />
        <section className="panel table-panel">
          <div className="panel-title">
            <h3>Statutory Wage Returns Log</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Submission ID</th>
                  <th>Compliance Period</th>
                  <th>Submission Date</th>
                  <th>Workers Covered</th>
                  <th>Review Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((c) => (
                  <tr key={c.id}>
                    <td><b>{c.id}</b></td>
                    <td>{c.period || c.compliancePeriod}</td>
                    <td>{c.submissionDate || c.createdAt?.slice(0, 10)}</td>
                    <td>{c.workers || c.totalEmployees} Workers</td>
                    <td>{c.reviewDate || 'Pending'}</td>
                    <td><Badge value={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  // DEFAULT: Documents
  return (
    <>
      <Hero title="Statutory Documents Repository" text="Upload statutory registers, wage certificates, and business proofs for Labour Department verification." />
      {msg && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 }}>{msg}</p>}
      {err && <p className="error" style={{ marginBottom: 20 }}>{err}</p>}

      <section className="panel" style={{ maxWidth: 750, marginBottom: 24 }}>
        <div className="panel-title">
          <h3>Upload Statutory Document</h3>
        </div>
        <form onSubmit={handleUploadDoc}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <label>Document Name *
              <input value={docName} onChange={e => setDocName(e.target.value)} required style={{ width: '100%', marginTop: 6 }} />
            </label>
            <label>Document Category / Type *
              <select value={docType} onChange={e => setDocType(e.target.value)} className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                <option value="Registration Certificate">Registration Certificate</option>
                <option value="Establishment Proof">Establishment Proof</option>
                <option value="Authorization Proof">Authorization Proof</option>
                <option value="Wage Register - Sep 2026">Wage Register - Sep 2026</option>
                <option value="Attendance Register">Attendance Register</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>File Reference / Name *
              <input value={fileName} onChange={e => setFileName(e.target.value)} required placeholder="e.g. wage_register_sep_2026.pdf" style={{ width: '100%', marginTop: 6 }} />
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Upload Document for Verification</button>
        </form>
      </section>

      <section className="panel table-panel">
        <div className="panel-title">
          <h3>Uploaded Statutory Documents</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Doc ID</th>
                <th>Document Name</th>
                <th>Category</th>
                <th>File Reference</th>
                <th>Uploaded Date</th>
                <th>Verification Status</th>
                <th>Officer Remarks</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id}>
                  <td><b>{doc.id}</b></td>
                  <td><b>{doc.docName}</b></td>
                  <td>{doc.docType}</td>
                  <td><small>{doc.fileName}</small></td>
                  <td>{doc.uploadedAt?.slice(0, 10)}</td>
                  <td><Badge value={doc.verificationStatus} /></td>
                  <td><small>{doc.remarks || '—'}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function EmployerInspectionsModule({ subTab }: { subTab: string }) {
  const [upcoming, setUpcoming] = useState<any[]>(EMPLOYER_UPCOMING_INSPECTIONS);
  const [history, setHistory] = useState<any[]>(EMPLOYER_INSPECTION_HISTORY);
  const [selectedInsp, setSelectedInsp] = useState<any | null>(null);

  useEffect(() => {
    api('/inspections').then(res => {
      if (Array.isArray(res) && res.length) {
        const up = res.filter(i => i.status !== 'COMPLETED');
        if (up.length) setUpcoming([...up, ...EMPLOYER_UPCOMING_INSPECTIONS.filter(d => !up.some((u: any) => u.id === d.id))]);
      }
    }).catch(() => {});
  }, [subTab]);

  if (subTab === 'Inspection Details' || selectedInsp) {
    const insp = selectedInsp || upcoming[0] || EMPLOYER_UPCOMING_INSPECTIONS[0];
    return (
      <>
        <div style={{ marginBottom: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedInsp(null)}>← Back to Inspections List</button>
        </div>
        <Hero title={"Inspection Details — " + insp.id} text="Targeted statutory field inspection schedule and status for your establishment." />

        <section className="panel" style={{ maxWidth: 800 }}>
          <div className="panel-title">
            <h3>Inspection Schedule & Details</h3>
            <Badge value={insp.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: 20, borderRadius: 8, fontSize: 14 }}>
            <div><b>Inspection ID:</b> <br />{insp.id}</div>
            <div><b>Establishment Name:</b> <br />{insp.establishmentName || EMPLOYER_ESTABLISHMENT_DATA.establishmentName}</div>
            <div><b>Inspection Type:</b> <br /><Badge value={insp.inspectionType || 'Risk-Based'} /></div>
            <div><b>Scheduled Date:</b> <br />{insp.inspectionDate || insp.scheduledDate}</div>
            <div><b>Assigned Field Inspector:</b> <br />{insp.inspectorName || 'Rajesh Kumar'}</div>
            <div><b>Risk Level:</b> <br /><Badge value={insp.riskLevel || 'HIGH'} /></div>
            <div><b>Current Status:</b> <br /><Badge value={insp.status} /></div>
          </div>

          {insp.instructions && (
            <div style={{ marginTop: 20, padding: 14, background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: 4, fontSize: 13, color: '#1e40af' }}>
              <b>Officer Scope & Focus:</b> {insp.instructions}
            </div>
          )}

          <div style={{ marginTop: 20, padding: 14, background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: 4, fontSize: 12, color: '#92400e' }}>
            <b>Note for Employer:</b> Inspector field assignments, inspection dates, and risk levels are determined by the Labour Department. Employers are required to produce statutory wage and attendance registers during the site visit.
          </div>
        </section>
      </>
    );
  }

  if (subTab === 'Inspection History') {
    return (
      <>
        <Hero title="Historical Inspection Log" text="Record of completed field inspections conducted at your establishment." />
        <section className="panel table-panel">
          <div className="panel-title">
            <h3>Completed Historical Inspections</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Inspection ID</th>
                  <th>Inspection Date</th>
                  <th>Inspection Type</th>
                  <th>Assigned Inspector</th>
                  <th>Result</th>
                  <th>Follow-up Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td><b>{h.id}</b></td>
                    <td>{h.inspectionDate}</td>
                    <td><Badge value={h.inspectionType} /></td>
                    <td>{h.inspectorName || 'Rajesh Kumar'}</td>
                    <td><Badge value={h.result} /></td>
                    <td><Badge value={h.followUpStatus} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedInsp(h)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  // DEFAULT: Upcoming Inspections
  return (
    <>
      <Hero title="Upcoming Scheduled Inspections" text="View field inspections scheduled for your establishment by the Labour Department." />
      <section className="panel table-panel">
        <div className="panel-title">
          <h3>Scheduled Field Inspections</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Inspection ID</th>
                <th>Establishment Name</th>
                <th>Inspection Date</th>
                <th>Inspection Type</th>
                <th>Assigned Inspector</th>
                <th>Risk Level</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((u) => (
                <tr key={u.id}>
                  <td><b>{u.id}</b></td>
                  <td><b>{u.establishmentName || EMPLOYER_ESTABLISHMENT_DATA.establishmentName}</b></td>
                  <td>{u.inspectionDate || u.scheduledDate}</td>
                  <td><Badge value={u.inspectionType || 'Risk-Based'} /></td>
                  <td>{u.inspectorName || 'Rajesh Kumar'}</td>
                  <td><Badge value={u.riskLevel || 'HIGH'} /></td>
                  <td><Badge value={u.status} /></td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => setSelectedInsp(u)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function EmployerActionsModule({ subTab }: { subTab: string }) {
  const [notices, setNotices] = useState<any[]>(EMPLOYER_NOTICES);
  const [explanations, setExplanations] = useState<any[]>(EMPLOYER_EXPLANATIONS);
  const [actions, setActions] = useState<any[]>(EMPLOYER_CORRECTIVE_ACTIONS);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Explanation Modal
  const [respNoticeId, setRespNoticeId] = useState<string | null>(null);
  const [explanationText, setExplanationText] = useState('');
  const [expDoc, setExpDoc] = useState('');

  // Corrective Action Modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionNoticeId, setActionNoticeId] = useState(EMPLOYER_NOTICES[0].id);
  const [actionViolationId, setActionViolationId] = useState(EMPLOYER_CORRECTIVE_ACTIONS[0].relatedViolation);
  const [actionDesc, setActionDesc] = useState('');
  const [actionProof, setActionProof] = useState('');

  const loadActionsData = () => {
    api('/notices').then(res => {
      if (Array.isArray(res) && res.length) setNotices([...res, ...EMPLOYER_NOTICES.filter(n => !res.some((r: any) => r.id === n.id))]);
    }).catch(() => {});
  };

  useEffect(() => {
    loadActionsData();
  }, [subTab]);

  const handleSubmitExplanation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respNoticeId) return;
    setMsg('');
    setErr('');
    try {
      await api('/notices/' + respNoticeId + '/response', {
        method: 'PATCH',
        body: JSON.stringify({ explanation: explanationText })
      }).catch(() => {});
      const newExp = {
        id: 'EXP-' + Date.now(),
        noticeId: respNoticeId,
        noticeNumber: notices.find(n => n.id === respNoticeId)?.noticeNumber || respNoticeId,
        submittedDate: new Date().toISOString().slice(0, 10),
        explanationText,
        supportingDoc: expDoc || 'salary_payment_receipt.pdf',
        status: 'UNDER_REVIEW'
      };
      setExplanations([newExp, ...explanations]);
      setMsg('Notice explanation submitted successfully for Officer review!');
      setRespNoticeId(null);
      setExplanationText('');
      setExpDoc('');
    } catch (x: any) {
      setErr(x.message || 'Failed to submit explanation');
    }
  };

  const handleSubmitCorrectiveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await api('/corrective-actions', {
        method: 'POST',
        body: JSON.stringify({
          noticeId: actionNoticeId,
          violationId: actionViolationId,
          description: actionDesc,
          evidence: [actionProof]
        })
      }).catch(() => {});
      const newCa = {
        id: 'CA-' + Date.now(),
        relatedViolation: actionViolationId,
        requiredAction: 'Rectify statutory compliance gap',
        employerResponse: actionDesc,
        proofDocument: actionProof || 'attendance_records_oct.pdf',
        submittedDate: new Date().toISOString().slice(0, 10),
        status: 'UNDER_REVIEW'
      };
      setActions([newCa, ...actions]);
      setMsg('Corrective action response submitted successfully for Officer review!');
      setShowActionModal(false);
      setActionDesc('');
      setActionProof('');
    } catch (x: any) {
      setErr(x.message || 'Failed to submit corrective action');
    }
  };

  if (subTab === 'Explanations') {
    return (
      <>
        <Hero title="Notice Explanations Repository" text="Formal written explanations and supporting evidence submitted in response to statutory notices." />
        {msg && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 }}>{msg}</p>}
        {err && <p className="error" style={{ marginBottom: 20 }}>{err}</p>}

        <section className="panel table-panel">
          <div className="panel-title">
            <h3>Submitted Explanations Log</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Explanation ID</th>
                  <th>Related Notice</th>
                  <th>Submitted Date</th>
                  <th>Explanation Statement</th>
                  <th>Supporting Document</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {explanations.map(exp => (
                  <tr key={exp.id}>
                    <td><b>{exp.id}</b></td>
                    <td><b>{exp.noticeNumber || exp.noticeId}</b></td>
                    <td>{exp.submittedDate}</td>
                    <td><small>{exp.explanationText || 'Pending submission'}</small></td>
                    <td><small style={{ color: '#2563eb' }}>{exp.supportingDoc || '—'}</small></td>
                    <td><Badge value={exp.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {respNoticeId && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Submit Notice Explanation</h3>
                <button className="close-btn" onClick={() => setRespNoticeId(null)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmitExplanation}>
                <label style={{ display: 'block', marginBottom: 16 }}>Explanation Statement (Min 5 characters) *
                  <textarea rows={4} value={explanationText} onChange={e => setExplanationText(e.target.value)} required placeholder="State statutory compliance details, clarifications, or payroll processing reasons..." style={{ width: '100%', marginTop: 6 }} />
                </label>
                <label style={{ display: 'block', marginBottom: 20 }}>Supporting Proof Document Reference
                  <input value={expDoc} onChange={e => setExpDoc(e.target.value)} placeholder="e.g. salary_payment_receipt.pdf" style={{ width: '100%', marginTop: 6 }} />
                </label>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">Submit Explanation</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setRespNoticeId(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  if (subTab === 'Corrective Actions') {
    return (
      <>
        <Hero title="Statutory Corrective Actions" text="Submit formal corrective action responses along with supporting proof for confirmed statutory violations." />
        {msg && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 }}>{msg}</p>}
        {err && <p className="error" style={{ marginBottom: 20 }}>{err}</p>}

        <section className="panel table-panel" style={{ marginBottom: 24 }}>
          <div className="panel-title">
            <div>
              <h3>Corrective Action Submissions Log</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Corrective actions are reviewed and approved strictly by Labour Officers.</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowActionModal(true)}>
              <Plus size={16} /> Submit Corrective Action
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Action ID</th>
                  <th>Related Violation</th>
                  <th>Required Action</th>
                  <th>Employer Response</th>
                  <th>Proof Document</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {actions.map(ca => (
                  <tr key={ca.id}>
                    <td><b>{ca.id}</b></td>
                    <td><Badge value={ca.relatedViolation} /></td>
                    <td>{ca.requiredAction}</td>
                    <td><small>{ca.employerResponse || 'Pending response'}</small></td>
                    <td><small style={{ color: '#2563eb' }}>{ca.proofDocument || '—'}</small></td>
                    <td>{ca.submittedDate || '—'}</td>
                    <td><Badge value={ca.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Follow-up Tracking Box */}
        <section className="panel" style={{ maxWidth: 800 }}>
          <div className="panel-title">
            <h3>Officer Re-Inspection Follow-up Tracking</h3>
            <Badge value={EMPLOYER_FOLLOWUPS[0].status} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, background: '#f8fafc', padding: 16, borderRadius: 8, fontSize: 13 }}>
            <div><b>Follow-up ID:</b> <b>{EMPLOYER_FOLLOWUPS[0].id}</b></div>
            <div><b>Related Violation:</b> <Badge value={EMPLOYER_FOLLOWUPS[0].relatedViolation} /></div>
            <div><b>Scheduled Date:</b> {EMPLOYER_FOLLOWUPS[0].scheduledDate}</div>
            <div><b>Status:</b> <Badge value={EMPLOYER_FOLLOWUPS[0].status} /></div>
          </div>
        </section>

        {showActionModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Submit Corrective Action Response</h3>
                <button className="close-btn" onClick={() => setShowActionModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmitCorrectiveAction}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <label>Select Issued Notice *
                    <select value={actionNoticeId} onChange={e => setActionNoticeId(e.target.value)} required className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                      {notices.map(n => (
                        <option key={n.id} value={n.id}>{n.noticeNumber || n.id}</option>
                      ))}
                    </select>
                  </label>
                  <label>Select Related Violation *
                    <select value={actionViolationId} onChange={e => setActionViolationId(e.target.value)} required className="filter-select" style={{ width: '100%', marginTop: 6 }}>
                      {actions.map(a => (
                        <option key={a.id} value={a.relatedViolation}>{a.relatedViolation}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label style={{ display: 'block', marginBottom: 16 }}>Employer Response & Action Taken *
                  <textarea rows={3} value={actionDesc} onChange={e => setActionDesc(e.target.value)} required placeholder="Describe corrective measures taken, arrears disbursed..." style={{ width: '100%', marginTop: 6 }} />
                </label>

                <label style={{ display: 'block', marginBottom: 20 }}>Proof Document / Evidence Reference *
                  <input value={actionProof} onChange={e => setActionProof(e.target.value)} required placeholder="e.g. attendance_records_oct.pdf" style={{ width: '100%', marginTop: 6 }} />
                </label>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">Submit Corrective Action</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowActionModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // DEFAULT: Notices
  return (
    <>
      <Hero title="Statutory Notices Received" text="View statutory notices issued by Labour Department Officers regarding compliance issues." />
      {msg && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 }}>{msg}</p>}
      {err && <p className="error" style={{ marginBottom: 20 }}>{err}</p>}

      <section className="panel table-panel">
        <div className="panel-title">
          <h3>Received Statutory Notices</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Notice ID</th>
                <th>Issue Date</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Issue Description</th>
                <th>Response Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((n) => (
                <tr key={n.id}>
                  <td><b>{n.noticeNumber || n.id}</b></td>
                  <td>{n.issueDate?.slice(0, 10)}</td>
                  <td>{n.category || 'Wage Compliance'}</td>
                  <td><Badge value={n.severity || 'HIGH'} /></td>
                  <td><small>{n.issue || 'Statutory compliance notice'}</small></td>
                  <td>{n.responseDeadline?.slice(0, 10)}</td>
                  <td><Badge value={n.status} /></td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => { setRespNoticeId(n.id); setExplanationText(n.employerResponse || ''); }}>
                      Submit Explanation
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {respNoticeId && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Submit Notice Explanation</h3>
              <button className="close-btn" onClick={() => setRespNoticeId(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitExplanation}>
              <label style={{ display: 'block', marginBottom: 16 }}>Explanation Statement (Min 5 characters) *
                <textarea rows={4} value={explanationText} onChange={e => setExplanationText(e.target.value)} required placeholder="State statutory compliance details, clarifications, or reasons..." style={{ width: '100%', marginTop: 6 }} />
              </label>
              <label style={{ display: 'block', marginBottom: 20 }}>Supporting Proof Document Reference
                <input value={expDoc} onChange={e => setExpDoc(e.target.value)} placeholder="e.g. salary_payment_receipt.pdf" style={{ width: '100%', marginTop: 6 }} />
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">Submit Explanation</button>
                <button type="button" className="btn btn-secondary" onClick={() => setRespNoticeId(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}`;

main = main.substring(0, startIdx) + newEmployerModules + '\n\n' + main.substring(endIdx);

// 5. Update ProfileModule to show Employer section when user.role === 'EMPLOYER'
const profileEmployerCode = `
      {user.role === 'EMPLOYER' && (
        <article className="panel" style={{ marginBottom: 24 }}>
          <h3 style={{ color: '#0f2d59', marginBottom: 14 }}>Employer Establishment Account Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, background: '#f8fafc', padding: 18, borderRadius: 8, fontSize: 14 }}>
            <div><b>Account Name:</b> {user.name || EMPLOYER_ESTABLISHMENT_DATA.ownerName}</div>
            <div><b>Role:</b> {user.role}</div>
            <div><b>Registered Establishment:</b> {EMPLOYER_ESTABLISHMENT_DATA.establishmentName}</div>
            <div><b>Registration Number:</b> {EMPLOYER_ESTABLISHMENT_DATA.registrationNumber}</div>
            <div><b>Designation:</b> {EMPLOYER_ESTABLISHMENT_DATA.designation}</div>
            <div><b>District:</b> {EMPLOYER_ESTABLISHMENT_DATA.district}</div>
            <div><b>Email:</b> {user.email}</div>
            <div><b>Phone:</b> {EMPLOYER_ESTABLISHMENT_DATA.phone}</div>
            <div><b>Account Status:</b> <span className="badge green">Active</span></div>
          </div>
        </article>
      )}
`;

if (!main.includes('Employer Establishment Account Profile')) {
  main = main.replace("{user.role === 'LABOUR_INSPECTOR' && (", `${profileEmployerCode}\n      {user.role === 'LABOUR_INSPECTOR' && (`);
}

fs.writeFileSync(mainPath, main, 'utf8');
console.log('Employer modules updated successfully in main.tsx!');
