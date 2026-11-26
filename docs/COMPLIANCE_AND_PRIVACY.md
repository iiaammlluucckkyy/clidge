# CLIDGE Compliance, Privacy & Student Data Charter

The **CLIDGE** platform is engineered from the ground up to respect student privacy and uphold collegiate data governance standards.

---

## 1. Core Principles of Privacy-by-Design

1. **Voluntary Opt-In Only:**  
   Location verification is strictly voluntary. Students must check an explicit consent box before location sharing can initiate. Students can revoke permission at any moment via the Master Toggle on their dashboard or profile.
2. **Session-Bound Telemetry:**  
   Location telemetry is collected **only while an event is actively in progress**. The platform does not track students outside event schedules, during lunch breaks, after college hours, or over weekends.
3. **No Continuous Background Surveillance:**  
   When an event concludes or when a faculty coordinator clicks "End Event", location tracking instantly and automatically terminates (`sharingStatus: Ended`).
4. **Boundary Compliance Rather Than Pinpoint Surveillance:**  
   The primary tracking objective is binary perimeter compliance (*"Inside Venue"* vs *"Outside Bounds"*). Precise coordinates are processed strictly to calculate geodesic distance relative to the designated hall boundary.

---

## 2. Server-Controlled Non-Repudiation

To guarantee academic integrity while preventing manipulation:
- **Server-Authoritative Timestamps:** Client-submitted timestamps from mobile devices are systematically ignored. Check-in and check-out logs strictly use server-generated UTC timestamps.
- **Dynamic Expiring QR Codes:** Event QR codes expire after their validity period (default 60 minutes) to prevent unauthorized distribution or off-campus proxy scanning.
- **Duplicate Prevention:** Unique sync identifiers (`syncId`) prevent replay attacks or duplicate records from being submitted during offline synchronization.

---

## 3. Data Retention & Deletion Policy

- **Active Telemetry Records:** Coordinate pings are held in memory/cache for real-time radar rendering. Records older than 300 seconds are marked `OUTDATED` and never claimed as live.
- **Official Attendance Logs:** Event attendance summaries (student roll number, name, event, timestamp, compliance status) are archived in Cloud Firestore for institutional semester auditing.
- **Student Right to Erasure:** A student unregistering from an event immediately deletes active telemetry records associated with that session.

---

## 4. Institutional Compliance Checklist

| Standard | Implementation Status |
|---|---|
| **Explicit Consent** | Enforced prior to any location tracking initiation. |
| **Data Minimization** | Only collects latitude, longitude, and accuracy during active events. |
| **Role-Based Isolation** | Students cannot view other students' coordinates or events. |
| **Audit Trails** | All check-in, check-out, and edit events log timestamps and coordinator ID. |
| **Zero Secret Exposure** | All private keys and service accounts are isolated in environment variables. |
