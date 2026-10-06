const fs = require('fs');

let mainPath = 'c:/Folders/Projects/Wage_Compliance/frontend/src/main.tsx';
let main = fs.readFileSync(mainPath, 'utf8');

// Replace InspectorDashboard and InspectorReportsModule
const startMarker = `function InspectorDashboard({ onNavigate }: { onNavigate: (main: string, sub: string) => void }) {`;
const endMarker = `// ----------------------------------------------------\nfunction EmployerDashboard`;

const startIdx = main.indexOf(startMarker);
const endIdx = main.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Failed to locate start/end markers in main.tsx', startIdx, endIdx);
  process.exit(1);
}

const replacement = `function InspectorDashboard({ onNavigate }: { onNavigate: (main: string, sub: string) => void }) {
  const [d, setD] = useState<ApiData>({});

  useEffect(() => {
    api('/dashboard/inspector').then(setD).catch(() => {});
  }, []);

  return (
    <>
      <Hero
        title="Labour Inspector Field Workspace"
        text="Digital inspection management, statutory wage checklists, site observations, evidence uploads, and follow-up verification."
      />

      {/* 6 KPI Cards for Inspector */}
      <div className="metrics" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <Card name="Assigned Inspections" value={d.totals?.assigned || INSPECTOR_KPI_STATS.assignedInspections} Icon={ClipboardCheck} colorClass="blue" />
        <Card name="Upcoming Inspections" value={d.totals?.upcoming || INSPECTOR_KPI_STATS.upcomingInspections} Icon={Clock} colorClass="purple" />
        <Card name="In Progress" value={INSPECTOR_KPI_STATS.inProgress} Icon={Activity} colorClass="orange" />
        <Card name="Submitted Reports" value={d.totals?.completed || INSPECTOR_KPI_STATS.submittedReports} Icon={FileText} colorClass="green" />
        <Card name="Follow-ups Required" value={d.totals?.followUps || INSPECTOR_KPI_STATS.followUpInspections} Icon={AlertTriangle} colorClass="red" />
        <Card name="Completed History" value={INSPECTOR_KPI_STATS.completedInspections} Icon={ShieldCheck} colorClass="teal" />
      </div>

      <div className="grid" style={{ marginBottom: 24 }}>
        {/* Assigned Field Inspections Table */}
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Active Assigned Field Inspections</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Inspections currently assigned to you for site execution.</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('My Inspections', 'Assigned')}>View All Assigned</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Inspection ID</th>
                  <th>Establishment</th>
                  <th>District</th>
                  <th>Scheduled Date</th>
                  <th>Risk Level</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_ASSIGNED_INSPECTIONS.map((row: any) => (
                  <tr key={row.id}>
                    <td><b>{row.id}</b></td>
                    <td><b>{row.establishmentName}</b><br/><small>{row.industry}</small></td>
                    <td>{row.district}</td>
                    <td>{row.scheduledDate}</td>
                    <td><Badge value={row.riskLevel} /></td>
                    <td><Badge value={row.status} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('My Inspections', 'Assigned')}>
                        {row.status === 'IN_PROGRESS' ? 'Continue' : 'Start'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Follow-up Tasks Table */}
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Follow-up Verification Tasks</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Re-inspections assigned to verify employer violation corrections.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('My Inspections', 'Follow-up')}>View Follow-ups</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Follow-up ID</th>
                  <th>Establishment</th>
                  <th>Related Violation</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_FOLLOWUP_INSPECTIONS.map((fu: any) => (
                  <tr key={fu.id}>
                    <td><b>{fu.id}</b></td>
                    <td><b>{fu.establishmentName}</b></td>
                    <td><Badge value={fu.relatedViolation || 'VIO-1025'} /></td>
                    <td>{fu.scheduledDate}</td>
                    <td><Badge value={fu.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Recent Submitted Reports Table */}
      <section className="panel table-panel">
        <div className="panel-title">
          <div>
            <h3>Recent Submitted Inspection Reports</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Reports submitted for Labour Officer review and violation confirmation.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('Inspection Reports', 'Submitted Reports')}>View Submitted Reports</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Establishment Name</th>
                <th>District</th>
                <th>Inspection Date</th>
                <th>Risk Level</th>
                <th>Submission Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_SUBMITTED_REPORTS.map((rpt: any) => (
                <tr key={rpt.id}>
                  <td><b>{rpt.id}</b></td>
                  <td><b>{rpt.establishmentName}</b></td>
                  <td>{rpt.district}</td>
                  <td>{rpt.inspectionDate}</td>
                  <td><Badge value={rpt.riskLevel} /></td>
                  <td>{rpt.submittedDate}</td>
                  <td><Badge value={rpt.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function InspectorReportsModule({ subTab }: { subTab: string }) {
  const [apiInspections, setApiInspections] = useState<any[]>([]);
  const [selectedInsp, setSelectedInsp] = useState<any | null>(null);
  const [activeFormTab, setActiveFormTab] = useState('Overview');
  const [checklist, setChecklist] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [inspectorRemarks, setInspectorRemarks] = useState('');
  const [verificationResult, setVerificationResult] = useState<'CORRECTED' | 'PARTIALLY_CORRECTED' | 'NOT_CORRECTED'>('CORRECTED');
  const [verificationRemarks, setVerificationRemarks] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const load = () => {
    api('/inspections').then(res => {
      setApiInspections(Array.isArray(res) ? res : []);
    }).catch(() => {});
  };

  useEffect(() => {
    load();
  }, [subTab]);

  // Distinct datasets for each subTab (NO DUPLICATIONS)
  const assignedList = [...DUMMY_ASSIGNED_INSPECTIONS, ...apiInspections.filter(a => a.status !== 'COMPLETED' && !a.followUpFor && !DUMMY_ASSIGNED_INSPECTIONS.some(d => d.id === a.id))];
  const upcomingList = [...DUMMY_UPCOMING_INSPECTIONS];
  const followupList = [...DUMMY_FOLLOWUP_INSPECTIONS];
  const draftList = [...DUMMY_DRAFT_REPORTS];
  const submittedList = [...DUMMY_SUBMITTED_REPORTS];
  const historyList = [...DUMMY_INSPECTION_HISTORY];

  const openInspection = (i: any) => {
    const fullInsp = DUMMY_ASSIGNED_INSPECTIONS.find(x => x.id === i.id || x.id === i.inspectionId) ||
                     DUMMY_UPCOMING_INSPECTIONS.find(x => x.id === i.id || x.id === i.inspectionId) ||
                     DUMMY_FOLLOWUP_INSPECTIONS.find(x => x.id === i.id || x.id === i.inspectionId) ||
                     DUMMY_DRAFT_REPORTS.find(x => x.id === i.id || x.id === i.inspectionId) ||
                     DUMMY_SUBMITTED_REPORTS.find(x => x.id === i.id || x.id === i.inspectionId) ||
                     i;
    setSelectedInsp(fullInsp);
    setChecklist(fullInsp.checklist || DUMMY_ASSIGNED_INSPECTIONS[0].checklist);
    setObservations(fullInsp.observations || []);
    setFindings(fullInsp.findings || []);
    setEvidence(fullInsp.evidence || []);
    setInspectorRemarks(fullInsp.inspectorRemarks || '');
    setVerificationResult(fullInsp.verificationResult || 'CORRECTED');
    setVerificationRemarks(fullInsp.verificationObservation || '');
    setActiveFormTab('Overview');
  };

  const handleStart = async () => {
    try {
      await api('/inspections/' + selectedInsp.id + '/start', { method: 'PATCH' }).catch(() => {});
      const updated = { ...selectedInsp, status: 'IN_PROGRESS' };
      setSelectedInsp(updated);
      setToast('Inspection started. Digital checklist & observation workspace unlocked.');
      load();
    } catch (err: any) { alert(err.message); }
  };

  const saveDraft = async (dataOverride?: any) => {
    try {
      const payload = dataOverride || { checklist, observations, findings, evidence, inspectorRemarks };
      await api('/inspections/' + selectedInsp.id + '/draft', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }).catch(() => {});
      const updated = { ...selectedInsp, ...payload, status: 'IN_PROGRESS' };
      setSelectedInsp(updated);
      setToast('Draft inspection report saved successfully.');
      load();
    } catch (err: any) { alert(err.message); }
  };

  const handleSubmitReport = async () => {
    if (!window.confirm('Submit Inspection Report to Labour Department Officer? Once submitted, the report cannot be modified.')) return;
    try {
      await api('/inspections/' + selectedInsp.id + '/report', {
        method: 'PATCH',
        body: JSON.stringify({ checklist, observations, findings, inspectorRemarks })
      }).catch(() => {});
      setToast(\`Inspection report for \${selectedInsp.establishmentName} submitted successfully to Labour Officer.\`);
      setSelectedInsp(null);
      load();
    } catch (err: any) { alert(err.message); }
  };

  const handleVerifySubmit = async () => {
    if (!window.confirm(\`Submit follow-up verification result: \${verificationResult}?\`)) return;
    try {
      await api('/violations/' + (selectedInsp.followUpFor || selectedInsp.relatedViolation || 'VIO-1025') + '/verification', {
        method: 'PATCH',
        body: JSON.stringify({ result: verificationResult })
      }).catch(() => {});
      setToast(\`Follow-up verification result (\${verificationResult}) submitted to Labour Officer for final review.\`);
      setSelectedInsp(null);
      load();
    } catch (err: any) { alert(err.message); }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only PDF, JPG, and PNG evidence files are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must not exceed 5MB.');
      return;
    }
    try {
      const res = await api('/inspections/' + selectedInsp.id + '/evidence', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, fileType: file.type || 'application/pdf', fileSize: file.size })
      }).catch(() => ({ id: 'EVD-' + Date.now(), fileName: file.name, fileType: file.type || 'PDF', uploadDate: new Date().toISOString().slice(0, 10), relatedTo: 'General Finding' }));
      const newEv = [...evidence, res];
      setEvidence(newEv);
      saveDraft({ evidence: newEv });
    } catch (err: any) { alert(err.message); }
  };

  if (selectedInsp) {
    const isFollowUp = !!selectedInsp.followUpFor || selectedInsp.inspectionType === 'Follow-up';
    const isReadOnly = selectedInsp.status === 'SUBMITTED' || selectedInsp.status === 'COMPLETED';

    return (
      <>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedInsp(null)}>
            ← Back to {subTab} List
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            {selectedInsp.status === 'IN_PROGRESS' && !isFollowUp && (
              <button className="btn btn-secondary btn-sm" onClick={() => saveDraft()}>Save Draft</button>
            )}
            {selectedInsp.status === 'IN_PROGRESS' && !isFollowUp && (
              <button className="btn btn-primary btn-sm" onClick={handleSubmitReport}>Submit Report to Officer</button>
            )}
          </div>
        </div>

        {toast && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 18 }}>{toast}</p>}

        {/* Detailed Inspection Header Card */}
        <section className="panel" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="badge blue" style={{ marginBottom: 6, display: 'inline-block' }}>{selectedInsp.id}</span>
              <h2 style={{ margin: '4px 0 6px', color: '#0f2d59', fontSize: 22 }}>{selectedInsp.establishmentName}</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
                <b>Reg No:</b> {selectedInsp.registrationNumber || 'TN-ERD-2024-00125'} | <b>District:</b> {selectedInsp.district || 'Erode'} | <b>Industry:</b> {selectedInsp.industry || 'Manufacturing'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Risk Score</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: (selectedInsp.riskScore || 70) > 75 ? '#dc2626' : '#2563eb' }}>
                  {selectedInsp.riskScore || 75}/100
                </span>
              </div>
              <Badge value={selectedInsp.riskLevel || 'HIGH'} />
              <Badge value={selectedInsp.status} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 18, background: '#f8fafc', padding: 16, borderRadius: 8, fontSize: 13 }}>
            <div><b>Workers Covered:</b> {selectedInsp.totalEmployees || 250}</div>
            <div><b>Employer Representative:</b> {selectedInsp.ownerName || 'R. Sakthivel'}</div>
            <div><b>Inspection Type:</b> {selectedInsp.inspectionType || 'Risk-Based'}</div>
            <div><b>Priority:</b> <Badge value={selectedInsp.priority || 'HIGH'} /></div>
            <div><b>Scheduled Date:</b> {selectedInsp.scheduledDate || selectedInsp.inspectionDate}</div>
            <div><b>Assigned Inspector:</b> {INSPECTOR_PROFILE_DATA.name} ({INSPECTOR_PROFILE_DATA.employeeId})</div>
          </div>

          {selectedInsp.instructions && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: 4, fontSize: 13, color: '#1e40af' }}>
              <b>Officer Instructions:</b> {selectedInsp.instructions}
            </div>
          )}

          {/* Legal disclaimer banner regarding Inspector authority */}
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: 4, fontSize: 12, color: '#92400e' }}>
            <b>Statutory Notice:</b> Inspector findings represent field observations. Final confirmation of violations, issuing notices, and approving corrective actions rest strictly with the Labour Department Officer.
          </div>
        </section>

        {/* If Inspection is ASSIGNED / SCHEDULED, display Start Action */}
        {['ASSIGNED', 'SCHEDULED'].includes(selectedInsp.status) && !isFollowUp && (
          <section className="panel" style={{ textAlign: 'center', padding: 36, marginBottom: 20 }}>
            <h3 style={{ color: '#0f2d59', marginBottom: 8 }}>Ready to Conduct Site Inspection?</h3>
            <p style={{ color: '#64748b', maxWidth: 540, margin: '0 auto 20px', fontSize: 14 }}>
              Clicking "Start Field Inspection" unlocks the digital statutory wage checklist, observation logging, evidence attachment, and report submission workspace.
            </p>
            <button className="btn btn-primary btn-lg" onClick={handleStart}>
              <ClipboardCheck size={18} style={{ marginRight: 8 }} /> Start Field Inspection
            </button>
          </section>
        )}

        {/* Follow-up Verification Specific View */}
        {isFollowUp && (
          <section className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-title">
              <h3>Follow-up Inspection Verification</h3>
            </div>
            <div style={{ display: 'grid', gap: 16, background: '#f8fafc', padding: 18, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
              <div><b>Related Statutory Violation:</b> <Badge value={selectedInsp.relatedViolation || selectedInsp.followUpFor || 'VIO-1025'} /></div>
              <div><b>Required Corrective Action:</b> {selectedInsp.requiredAction || 'Maintain complete attendance records and update statutory registers.'}</div>
              <div><b>Employer Submitted Proof:</b> <span style={{ color: '#2563eb', fontWeight: 600 }}>{selectedInsp.employerProof || 'attendance_records_sep_oct.pdf'}</span></div>
            </div>

            <div style={{ display: 'grid', gap: 16, maxWidth: 640 }}>
              <label style={{ fontWeight: 600, fontSize: 14 }}>
                Inspector Verification Result *
                <select className="filter-select" value={verificationResult} onChange={(e: any) => setVerificationResult(e.target.value)} style={{ width: '100%', marginTop: 8 }} disabled={isReadOnly}>
                  <option value="CORRECTED">CORRECTED — Violation has been fully rectified by employer</option>
                  <option value="PARTIALLY_CORRECTED">PARTIALLY_CORRECTED — Partial compliance verified; further action needed</option>
                  <option value="NOT_CORRECTED">NOT_CORRECTED — Violation remains unrectified upon site inspection</option>
                </select>
              </label>

              <label style={{ fontWeight: 600, fontSize: 14 }}>
                Inspector Verification Remarks & Site Observations *
                <textarea rows={4} className="input" value={verificationRemarks} onChange={e => setVerificationRemarks(e.target.value)} placeholder="Record exact site findings regarding employer's corrective proof..." style={{ width: '100%', marginTop: 8 }} disabled={isReadOnly} />
              </label>

              {!isReadOnly && (
                <div>
                  <button className="btn btn-primary" onClick={handleVerifySubmit}>
                    Submit Verification Result
                  </button>
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b' }}>
                    Result will be sent to the Labour Department Officer for final violation closure or notice issuance decision.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Regular Inspection Workspace */}
        {!isFollowUp && (selectedInsp.status === 'IN_PROGRESS' || selectedInsp.status === 'COMPLETED' || selectedInsp.status === 'SUBMITTED' || selectedInsp.status === 'DRAFT') && (
          <section className="panel">
            <div className="tabs" style={{ marginBottom: 20 }}>
              {['Overview', 'Checklist', 'Observations', 'Findings', 'Evidence', 'Submit Report'].map(tab => (
                <button key={tab} className={'tab ' + (activeFormTab === tab ? 'active' : '')} onClick={() => setActiveFormTab(tab)}>
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeFormTab === 'Overview' && (
              <div style={{ display: 'grid', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8 }}>
                    <h4 style={{ margin: '0 0 10px', color: '#0f2d59' }}>Previous Inspection History</h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                      {selectedInsp.previousInspectionSummary || 'Inspected on 15 Oct 2025; minor delays in overtime wage disbursement noted and warning issued.'}
                    </p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8 }}>
                    <h4 style={{ margin: '0 0 10px', color: '#0f2d59' }}>Statutory Wage & Return Summary</h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                      {selectedInsp.complianceSummary || 'Submitted Q2 2026 wage returns. 32 overtime entries flagged for verification.'}
                    </p>
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8 }}>
                  <h4 style={{ margin: '0 0 10px', color: '#0f2d59' }}>Applicable Wage Rates & Structure</h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                    {selectedInsp.wageInfoSummary || 'Minimum wage rate: ₹520/day. Overtime rate: double statutory rate (₹130/hr). 250 workers covered.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: CHECKLIST */}
            {activeFormTab === 'Checklist' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#0f2d59' }}>Statutory Labour & Wage Compliance Checklist</h4>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Evaluate compliance for mandatory statutory requirements.</p>
                  </div>
                  {!isReadOnly && (
                    <button className="btn btn-secondary btn-sm" onClick={() => {
                      const newC = [...checklist, { id: Date.now(), item: 'New Statutory Requirement', result: 'PASS', remarks: '' }];
                      setChecklist(newC);
                      saveDraft({ checklist: newC });
                    }}>
                      <Plus size={14} /> Add Item
                    </button>
                  )}
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Compliance Item</th>
                        <th>Result Status</th>
                        <th>Inspector Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checklist.map((c, idx) => (
                        <tr key={c.id || idx}>
                          <td><b>{c.item}</b></td>
                          <td style={{ width: 180 }}>
                            {!isReadOnly ? (
                              <select className="filter-select" value={c.result} onChange={e => { const nc = [...checklist]; nc[idx].result = e.target.value as any; setChecklist(nc); }}>
                                <option value="PASS">PASS</option>
                                <option value="FAIL">FAIL</option>
                                <option value="NOT_APPLICABLE">NOT_APPLICABLE</option>
                              </select>
                            ) : (
                              <Badge value={c.result} />
                            )}
                          </td>
                          <td>
                            {!isReadOnly ? (
                              <input className="input" style={{ width: '100%' }} value={c.remarks || ''} onChange={e => { const nc = [...checklist]; nc[idx].remarks = e.target.value; setChecklist(nc); }} placeholder="Enter remarks..." />
                            ) : (
                              <span>{c.remarks || '—'}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!isReadOnly && (
                  <div style={{ marginTop: 16 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => saveDraft()}>Save Checklist Draft</button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: OBSERVATIONS */}
            {activeFormTab === 'Observations' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#0f2d59' }}>Site Inspection Observations</h4>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Record statutory observations categorized by area and severity.</p>
                  </div>
                  {!isReadOnly && (
                    <button className="btn btn-secondary btn-sm" onClick={() => {
                      const newO = [...observations, { id: 'OBS-' + (301 + observations.length), category: 'WAGES', description: '', severity: 'MEDIUM', status: 'RECORDED' }];
                      setObservations(newO);
                      saveDraft({ observations: newO });
                    }}>
                      <Plus size={14} /> Add Observation
                    </button>
                  )}
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Severity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {observations.map((o, idx) => (
                        <tr key={o.id || idx}>
                          <td><b>{o.id}</b></td>
                          <td style={{ width: 160 }}>
                            {!isReadOnly ? (
                              <select className="filter-select" value={o.category} onChange={e => { const no = [...observations]; no[idx].category = e.target.value as any; setObservations(no); }}>
                                <option value="WAGES">WAGES</option>
                                <option value="ATTENDANCE">ATTENDANCE</option>
                                <option value="OVERTIME">OVERTIME</option>
                                <option value="STATUTORY_RECORDS">STATUTORY_RECORDS</option>
                                <option value="OTHER">OTHER</option>
                              </select>
                            ) : (
                              <span>{o.category}</span>
                            )}
                          </td>
                          <td>
                            {!isReadOnly ? (
                              <input className="input" style={{ width: '100%' }} value={o.description} onChange={e => { const no = [...observations]; no[idx].description = e.target.value; setObservations(no); }} placeholder="Enter observation details..." />
                            ) : (
                              <span>{o.description}</span>
                            )}
                          </td>
                          <td style={{ width: 120 }}>
                            {!isReadOnly ? (
                              <select className="filter-select" value={o.severity} onChange={e => { const no = [...observations]; no[idx].severity = e.target.value as any; setObservations(no); }}>
                                <option value="LOW">LOW</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HIGH">HIGH</option>
                              </select>
                            ) : (
                              <Badge value={o.severity} />
                            )}
                          </td>
                          <td><Badge value={o.status || 'RECORDED'} /></td>
                        </tr>
                      ))}
                      {!observations.length && <tr><td colSpan={5}>No observations recorded yet.</td></tr>}
                    </tbody>
                  </table>
                </div>

                {!isReadOnly && (
                  <div style={{ marginTop: 16 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => saveDraft()}>Save Observations</button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: FINDINGS */}
            {activeFormTab === 'Findings' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#0f2d59' }}>Inspector Recommendations & Findings</h4>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Findings are recommendations submitted for Officer review and decision.</p>
                  </div>
                  {!isReadOnly && (
                    <button className="btn btn-secondary btn-sm" onClick={() => {
                      const newF = [...findings, { id: 'FND-' + (401 + findings.length), category: 'Wage Compliance', description: '', severity: 'HIGH', inspectorRemarks: '' }];
                      setFindings(newF);
                      saveDraft({ findings: newF });
                    }}>
                      <Plus size={14} /> Add Finding
                    </button>
                  )}
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Category</th>
                        <th>Finding Description</th>
                        <th>Severity</th>
                        <th>Inspector Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {findings.map((f, idx) => (
                        <tr key={f.id || idx}>
                          <td><b>{f.id}</b></td>
                          <td>{f.category}</td>
                          <td>
                            {!isReadOnly ? (
                              <input className="input" style={{ width: '100%' }} value={f.description} onChange={e => { const nf = [...findings]; nf[idx].description = e.target.value; setFindings(nf); }} placeholder="Finding description..." />
                            ) : (
                              <span>{f.description}</span>
                            )}
                          </td>
                          <td><Badge value={f.severity} /></td>
                          <td>
                            {!isReadOnly ? (
                              <input className="input" style={{ width: '100%' }} value={f.inspectorRemarks} onChange={e => { const nf = [...findings]; nf[idx].inspectorRemarks = e.target.value; setFindings(nf); }} placeholder="Recommendation for Officer..." />
                            ) : (
                              <span>{f.inspectorRemarks}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {!findings.length && <tr><td colSpan={5}>No findings recorded yet.</td></tr>}
                    </tbody>
                  </table>
                </div>

                {!isReadOnly && (
                  <div style={{ marginTop: 16 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => saveDraft()}>Save Findings</button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: EVIDENCE */}
            {activeFormTab === 'Evidence' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#0f2d59' }}>Inspection Evidence & Attached Documents</h4>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Attach PDF documents, register scans, or site photographs (Max 5MB each; PDF, JPG, PNG).</p>
                  </div>
                  {!isReadOnly && (
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                      <Plus size={14} /> Upload Evidence File
                      <input type="file" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Type</th>
                        <th>Uploaded Date</th>
                        <th>Related Requirement / Observation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evidence.map((ev, idx) => (
                        <tr key={ev.id || idx}>
                          <td><b>{ev.fileName}</b></td>
                          <td><Badge value={ev.fileType.includes('pdf') ? 'PDF' : 'JPG'} /></td>
                          <td>{ev.uploadDate}</td>
                          <td>{ev.relatedTo}</td>
                        </tr>
                      ))}
                      {!evidence.length && <tr><td colSpan={4}>No evidence attached yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: SUBMIT REPORT */}
            {activeFormTab === 'Submit Report' && (
              <div style={{ maxWidth: 680 }}>
                <h4 style={{ margin: '0 0 8px', color: '#0f2d59' }}>Final Overall Inspector Report Summary</h4>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                  Provide overall conclusions and recommendations. Upon submission, the report will be locked and routed to the Labour Officer.
                </p>

                {!isReadOnly ? (
                  <>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>
                      Overall Inspection Remarks & Recommendation *
                      <textarea rows={5} className="input" value={inspectorRemarks} onChange={e => setInspectorRemarks(e.target.value)} placeholder="Summarize site findings, register anomalies, and follow-up recommendations..." style={{ width: '100%', marginTop: 8 }} />
                    </label>

                    <button className="btn btn-primary btn-lg" onClick={handleSubmitReport}>
                      Submit Official Inspection Report
                    </button>
                  </>
                ) : (
                  <div style={{ background: '#f8fafc', padding: 18, borderRadius: 8 }}>
                    <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#059669' }}>✓ Report Submitted to Labour Department Officer</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                      <b>Inspector Remarks:</b> {inspectorRemarks || selectedInsp.inspectorRemarks || 'Site inspection completed. Statutory register failures recorded for Officer review.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </>
    );
  }

  // LIST VIEWS BY SUBTAB
  return (
    <>
      <Hero
        title={\`Inspector Workspace — \${subTab}\`}
        text="Manage assigned inspections, digital checklists, observations, findings, and follow-up verifications."
      />

      {toast && <p className="toast" style={{ background: '#059669', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 18 }}>{toast}</p>}

      {/* SUBTAB 1: ASSIGNED (Active work assigned to me) */}
      {subTab === 'Assigned' && (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Assigned Field Inspections</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                Inspections currently assigned to you awaiting site inspection execution.
              </p>
            </div>
            <div className="search">
              <Search size={16} />
              <input placeholder="Search establishment or district..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Inspection ID</th>
                  <th>Establishment Name</th>
                  <th>District</th>
                  <th>Workers</th>
                  <th>Risk Level</th>
                  <th>Priority</th>
                  <th>Type</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedList
                  .filter(i => (i.establishmentName + i.district + i.id).toLowerCase().includes(search.toLowerCase()))
                  .map(i => (
                    <tr key={i.id}>
                      <td><b>{i.id}</b></td>
                      <td><b>{i.establishmentName}</b><br/><small>{i.industry}</small></td>
                      <td>{i.district}</td>
                      <td>{i.totalEmployees}</td>
                      <td><Badge value={i.riskLevel} /></td>
                      <td><Badge value={i.priority} /></td>
                      <td><Badge value={i.inspectionType} /></td>
                      <td>{i.scheduledDate}</td>
                      <td><Badge value={i.status} /></td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => openInspection(i)}>
                          {i.status === 'IN_PROGRESS' ? 'Continue Inspection' : 'View / Start'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SUBTAB 2: UPCOMING (Future scheduled inspections) */}
      {subTab === 'Upcoming' && (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Upcoming Scheduled Inspections</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                Inspections assigned to you scheduled for future dates.
              </p>
            </div>
            <div className="search">
              <Search size={16} />
              <input placeholder="Search establishment or district..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Inspection ID</th>
                  <th>Establishment Name</th>
                  <th>District</th>
                  <th>Workers</th>
                  <th>Risk Level</th>
                  <th>Priority</th>
                  <th>Type</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcomingList
                  .filter(i => (i.establishmentName + i.district + i.id).toLowerCase().includes(search.toLowerCase()))
                  .map(i => (
                    <tr key={i.id}>
                      <td><b>{i.id}</b></td>
                      <td><b>{i.establishmentName}</b><br/><small>{i.industry}</small></td>
                      <td>{i.district}</td>
                      <td>{i.totalEmployees}</td>
                      <td><Badge value={i.riskLevel} /></td>
                      <td><Badge value={i.priority} /></td>
                      <td><Badge value={i.inspectionType} /></td>
                      <td>{i.scheduledDate}</td>
                      <td><Badge value={i.status} /></td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => openInspection(i)}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SUBTAB 3: FOLLOW-UP (Re-inspections for violation verification) */}
      {subTab === 'Follow-up' && (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Follow-up Re-Inspections</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Verify whether statutory violations identified in past inspections have been rectified by employer.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Follow-up ID</th>
                  <th>Establishment Name</th>
                  <th>Related Violation</th>
                  <th>Scheduled Date</th>
                  <th>Required Action</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {followupList.map(fu => (
                  <tr key={fu.id}>
                    <td><b>{fu.id}</b></td>
                    <td><b>{fu.establishmentName}</b><br/><small>{fu.district}</small></td>
                    <td><Badge value={fu.relatedViolation || 'VIO-1025'} /></td>
                    <td>{fu.scheduledDate}</td>
                    <td><small>{fu.requiredAction}</small></td>
                    <td><Badge value={fu.status} /></td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => openInspection(fu)}>
                        Perform Verification
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SUBTAB 4: DRAFT REPORTS (In-progress unsubmitted reports) */}
      {subTab === 'Draft Reports' && (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Draft Inspection Reports</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>In-progress reports awaiting complete checklist and observation entry.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Inspection ID</th>
                  <th>Establishment Name</th>
                  <th>District</th>
                  <th>Inspection Date</th>
                  <th>Completion Progress</th>
                  <th>Risk Level</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {draftList.map(d => (
                  <tr key={d.id}>
                    <td><b>{d.id}</b></td>
                    <td>{d.inspectionId}</td>
                    <td><b>{d.establishmentName}</b></td>
                    <td>{d.district}</td>
                    <td>{d.inspectionDate}</td>
                    <td><small style={{ color: '#2563eb', fontWeight: 600 }}>{d.progressSummary}</small></td>
                    <td><Badge value={d.riskLevel} /></td>
                    <td><Badge value={d.status} /></td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => openInspection(d)}>
                        Continue Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SUBTAB 5: SUBMITTED REPORTS (Reports sent to Officer) */}
      {subTab === 'Submitted Reports' && (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Submitted Inspection Reports</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Official reports submitted to Labour Officer for violation confirmation & enforcement.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Establishment Name</th>
                  <th>District</th>
                  <th>Inspection Date</th>
                  <th>Submission Date</th>
                  <th>Risk Level</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {submittedList.map(s => (
                  <tr key={s.id}>
                    <td><b>{s.id}</b></td>
                    <td><b>{s.establishmentName}</b></td>
                    <td>{s.district}</td>
                    <td>{s.inspectionDate}</td>
                    <td>{s.submittedDate}</td>
                    <td><Badge value={s.riskLevel} /></td>
                    <td><Badge value={s.status} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openInspection(s)}>
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SUBTAB 6: INSPECTION HISTORY (Older historical completed inspections) */}
      {subTab === 'Inspection History' && (
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Completed Inspection History</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Historical record of past completed inspections.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Inspection ID</th>
                  <th>Establishment Name</th>
                  <th>District</th>
                  <th>Inspection Date</th>
                  <th>Inspection Type</th>
                  <th>Findings Summary</th>
                  <th>Follow-up Status</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map(h => (
                  <tr key={h.id}>
                    <td><b>{h.id}</b></td>
                    <td><b>{h.establishmentName}</b></td>
                    <td>{h.district}</td>
                    <td>{h.inspectionDate}</td>
                    <td><Badge value={h.inspectionType} /></td>
                    <td><small>{h.findingsSummary}</small></td>
                    <td><Badge value={h.followUpStatus} /></td>
                    <td><Badge value={h.result} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openInspection({ ...h, status: 'COMPLETED' })}>
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
`;

main = main.substring(0, startIdx) + replacement + '\n\n' + main.substring(endIdx);
fs.writeFileSync(mainPath, main, 'utf8');
console.log('main.tsx updated successfully!');
