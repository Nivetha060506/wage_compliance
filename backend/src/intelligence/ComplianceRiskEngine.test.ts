import test from 'node:test'; import assert from 'node:assert/strict'; import {calculateRisk,riskLevel} from './ComplianceRiskEngine.js';
test('clean establishment is low risk',()=>assert.equal(calculateRisk({}).riskScore,0));
test('combined factors are deterministic and capped',()=>{const data={unresolvedViolations:[{severity:'CRITICAL'},{severity:'CRITICAL'},{severity:'CRITICAL'}],wageConcerns:10,overdueNotices:5,missingRecords:4,lateSubmissions:6,daysSinceInspection:1000,anomalies:4}; const r=calculateRisk(data);assert.equal(r.riskScore,100);assert.deepEqual(r,calculateRisk(data));});
test('risk level boundaries',()=>{assert.equal(riskLevel(30),'LOW');assert.equal(riskLevel(31),'MEDIUM');assert.equal(riskLevel(61),'HIGH');assert.equal(riskLevel(81),'CRITICAL');});
