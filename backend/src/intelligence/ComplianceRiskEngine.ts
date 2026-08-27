export type Factor = { name:string; score:number; maximum:number; reason:string };
export type RiskInput = { unresolvedViolations?: {severity:string; createdAt?:string}[]; wageConcerns?:number; overdueNotices?:number; missingRecords?:number; lateSubmissions?:number; daysSinceInspection?:number; anomalies?:number };
const weights = { violations:25, wage:25, notices:15, records:10, late:10, inspection:10, anomalies:5 } as const;
export const riskLevel = (score:number) => score <= 30 ? 'LOW' : score <= 60 ? 'MEDIUM' : score <= 80 ? 'HIGH' : 'CRITICAL';
export function calculateRisk(input:RiskInput) {
 const v = input.unresolvedViolations ?? []; const severity = {CRITICAL:12,HIGH:8,MEDIUM:5,LOW:2} as Record<string,number>;
 const violation = Math.min(weights.violations, v.reduce((sum,x)=>sum+(severity[x.severity] ?? 2),0));
 const scores = [
  ['Previous Violations',violation,weights.violations, violation ? `${v.length} unresolved confirmed finding(s), weighted by severity` : 'No unresolved confirmed findings'],
  ['Wage Compliance Concerns',Math.min(weights.wage,(input.wageConcerns??0)*5),weights.wage,(input.wageConcerns??0)?'Reported wage information needs review':'No reported wage concerns'],
  ['Pending Notices',Math.min(weights.notices,(input.overdueNotices??0)*8),weights.notices,(input.overdueNotices??0)?'One or more notice deadlines have passed':'No overdue notices'],
  ['Missing Statutory Records',Math.min(weights.records,(input.missingRecords??0)*3),weights.records,(input.missingRecords??0)?'Required records were marked unavailable':'Required records reported available'],
  ['Delayed Submissions',Math.min(weights.late,(input.lateSubmissions??0)*3),weights.late,(input.lateSubmissions??0)?'Compliance submissions have been late':'No repeated late submissions'],
  ['Time Since Last Inspection', Math.min(weights.inspection, Math.max(0,Math.floor(((input.daysSinceInspection??0)-180)/36))),weights.inspection,(input.daysSinceInspection??0)>180?'Longer interval since the last inspection':'Inspection is reasonably recent'],
  ['Reporting Anomalies',Math.min(weights.anomalies,(input.anomalies??0)*2),weights.anomalies,(input.anomalies??0)?'Inconsistent reporting patterns require review':'No reporting anomalies identified']
 ] as [string,number,number,string][];
 const factors:Factor[] = scores.map(([name,score,maximum,reason])=>({name,score,maximum,reason})); const riskScore=factors.reduce((s,x)=>s+x.score,0);
 return {riskScore,riskLevel:riskLevel(riskScore),factors,recommendation:riskScore>60?'Priority inspection may be considered':'Continue routine monitoring',engineVersion:'1.0.0'};
}
