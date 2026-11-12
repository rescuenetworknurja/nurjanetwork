import { ageFromDob } from "./ids";
import type { KycStatus } from "./mock-data";

export type AccountStatus = "active" | "suspended" | "banned";

export type AppUser = {
  id: string; name: string; phone: string; dob: string; address: string;
  /** NID number for adults, birth registration number for minors. */
  idNumber: string;
  kyc: KycStatus; status: AccountStatus; banReason?: string | undefined;
  sosCount: number; falseCount: number;
  lat: number; lng: number; registeredAt: string;
  emergency: { name: string; relation: string; phone: string };
  guardian?: { name: string; phone: string; relation: string; consentAt: string } | undefined;
};

export const BAN_REASONS = [
  "Repeated False / Prank SOS Alerts",
  "Fake / Forged KYC Documents",
  "Abuse of Rescue Network",
  "Custom Admin Note",
] as const;

export type UserFilter = "all" | "active" | "pending" | "minor" | "adult" | "banned" | "false";

export const isMinor = (u: AppUser) => ageFromDob(u.dob) < 18;

export function filterUsers(users: AppUser[], query: string, filter: UserFilter): AppUser[] {
  const q = query.trim().toLowerCase();
  return users.filter((u) => {
    if (filter === "active" && u.status !== "active") return false;
    if (filter === "pending" && u.kyc !== "pending") return false;
    if (filter === "minor" && !isMinor(u)) return false;
    if (filter === "adult" && isMinor(u)) return false;
    if (filter === "banned" && u.status === "active") return false;
    if (filter === "false" && u.falseCount === 0) return false;
    if (!q) return true;
    return [u.name, u.phone, u.idNumber, u.id].some((v) => v.toLowerCase().includes(q));
  });
}

const csvCell = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;

export function usersToCsv(users: AppUser[]): string {
  const head = ["User ID", "Name", "Phone", "DOB", "Age", "Category", "NID/Birth Reg", "Address", "KYC", "Account Status", "Ban Reason", "SOS Count", "False Alarms", "Last Latitude", "Last Longitude", "Registered", "Emergency Contact", "Emergency Relation", "Emergency Phone"];
  const rows = users.map((u) => [
    u.id, u.name, u.phone, u.dob, ageFromDob(u.dob), isMinor(u) ? "Under-18 Minor" : "18+ Adult",
    u.idNumber, u.address, u.kyc, u.status, u.banReason ?? "", u.sosCount, u.falseCount,
    u.lat, u.lng, u.registeredAt, u.emergency.name, u.emergency.relation, u.emergency.phone,
  ]);
  return [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
}

/** Single-user dossier (profile + incident history) as CSV text. */
export function userDossierCsv(u: AppUser, cases: { id: string; date: string; area: string; outcome: string; duration: string }[]): string {
  const lines = [
    ["NURJA User Dossier", ""],
    ["User ID", u.id], ["Name", u.name], ["Phone", u.phone], ["DOB", u.dob], ["Age", ageFromDob(u.dob)],
    ["Category", isMinor(u) ? "Under-18 Minor" : "18+ Adult"], ["NID/Birth Reg", u.idNumber], ["Address", u.address],
    ["KYC", u.kyc], ["Account Status", u.status], ["Ban Reason", u.banReason ?? ""],
    ["Last Known GPS", `${u.lat}, ${u.lng}`], ["Registered", u.registeredAt],
    ["Emergency Contact", `${u.emergency.name} (${u.emergency.relation}) ${u.emergency.phone}`],
    ...(u.guardian ? [["Guardian NOC", `${u.guardian.name} (${u.guardian.relation}) ${u.guardian.phone} — consent ${u.guardian.consentAt}`]] : []),
    ["", ""],
    ["SOS History", ""],
    ["Case ID", "Date", "Area", "Outcome", "Duration"],
    ...cases.map((c) => [c.id, c.date, c.area, c.outcome, c.duration]),
  ];
  return lines.map((r) => r.map(csvCell).join(",")).join("\n");
}

export const seedUsers: AppUser[] = [
  { id: "self", name: "Nadia Hossain", phone: "01712349876", dob: "1999-03-14", address: "Shantinagar, Dhaka", idNumber: "1999261234567",
    kyc: "approved", status: "active", sosCount: 2, falseCount: 0, lat: 23.7306040, lng: 90.4125210, registeredAt: "2026-09-14",
    emergency: { name: "Rehana Hossain", relation: "Mother", phone: "01819876543" } },
  { id: "u2", name: "R. Begum", phone: "01712001122", dob: "1995-07-02", address: "Paltan, Dhaka", idNumber: "1995261987654",
    kyc: "approved", status: "active", sosCount: 3, falseCount: 0, lat: 23.7352210, lng: 90.4143950, registeredAt: "2026-08-30",
    emergency: { name: "Karim Begum", relation: "Husband", phone: "01712001123" } },
  { id: "u3", name: "M. Akter", phone: "01813002233", dob: "2000-11-19", address: "Kakrail, Dhaka", idNumber: "2000261444555",
    kyc: "approved", status: "active", sosCount: 1, falseCount: 1, lat: 23.7389010, lng: 90.4077120, registeredAt: "2026-10-02",
    emergency: { name: "Selina Akter", relation: "Sister", phone: "01813002234" } },
  { id: "u4", name: "S. Khatun", phone: "01914003344", dob: "1997-02-25", address: "Wari, Dhaka", idNumber: "1997261777888",
    kyc: "approved", status: "active", sosCount: 2, falseCount: 0, lat: 23.7180330, lng: 90.4210440, registeredAt: "2026-07-21",
    emergency: { name: "Abul Khatun", relation: "Father", phone: "01914003345" } },
  { id: "u5", name: "Lamia Chowdhury", phone: "01615004455", dob: "2011-05-20", address: "Mohammadpur, Dhaka", idNumber: "20115566778899001",
    kyc: "pending", status: "active", sosCount: 0, falseCount: 0, lat: 23.7658440, lng: 90.3589760, registeredAt: "2026-11-01",
    emergency: { name: "Farhana Chowdhury", relation: "Mother", phone: "01615004456" },
    guardian: { name: "Farhana Chowdhury", phone: "01615004456", relation: "Mother", consentAt: "2026-11-01 18:42" } },
  { id: "u6", name: "Priya Das", phone: "01516005566", dob: "2010-09-03", address: "Narayanganj Sadar", idNumber: "20103344556677002",
    kyc: "approved", status: "active", sosCount: 1, falseCount: 0, lat: 23.6238100, lng: 90.5011300, registeredAt: "2026-09-27",
    emergency: { name: "Anita Das", relation: "Mother", phone: "01516005567" },
    guardian: { name: "Anita Das", phone: "01516005567", relation: "Mother", consentAt: "2026-09-27 12:10" } },
  { id: "u7", name: "Sumaiya Akter", phone: "01417006677", dob: "1998-12-08", address: "Gulistan, Dhaka", idNumber: "1998261333222",
    kyc: "rejected", status: "suspended", banReason: "Repeated False / Prank SOS Alerts", sosCount: 6, falseCount: 4, lat: 23.7254120, lng: 90.4198200, registeredAt: "2026-06-15",
    emergency: { name: "Rina Akter", relation: "Sister", phone: "01417006678" } },
  { id: "u8", name: "Nusrat Jahan", phone: "01987654321", dob: "2010-09-03", address: "Demra, Dhaka", idNumber: "20101234567890123",
    kyc: "pending", status: "active", sosCount: 0, falseCount: 0, lat: 23.7102330, lng: 90.4843950, registeredAt: "2026-11-10",
    emergency: { name: "Abdul Karim", relation: "Father", phone: "01811223344" },
    guardian: { name: "Abdul Karim", phone: "01811223344", relation: "Father", consentAt: "2026-11-10 09:15" } },
];
