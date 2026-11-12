import volunteers from "@/assets/story-volunteers.jpg";
import patrol from "@/assets/story-patrol.jpg";
import workshop from "@/assets/story-workshop.jpg";
import hero from "@/assets/hero-night-street.jpg";

export type KycStatus = "pending" | "approved" | "rejected";
export type Post = {
  id: string; title: string; excerpt: string; body: string; image?: string; youtube?: string;
  tag: string; date: string; author: string; targets: { app: boolean; rescue: boolean; blog: boolean };
};
export type Zone = { id: string; name: string; x: number; y: number; r: number; rating: 1 | 2 | 3 | 4 | 5 };
export type KycSubmission = {
  id: string; name: string; phone: string; dob: string; type: "adult" | "minor"; status: KycStatus; submittedAt: string;
  birthReg?: string; guardian?: { name: string; phone: string; relation: string };
};
export type VolunteerApp = {
  id: string; name: string; phone: string; email: string; address: string; nid: string; occupation: string;
  motivation: string; status: "pending" | "approved" | "rejected"; volunteerId?: string; submittedAt: string; hasPhoto: boolean;
};
export type Responder = {
  id: string; name: string; kind: "patrol" | "fari" | "station" | "volunteer" | "officer";
  code: string; area: string; phone: string; online: boolean;
};
export type CaseRecord = { id: string; victim: string; area: string; date: string; outcome: string; duration: string };

export const IMAGES = { volunteers, patrol, workshop, hero };

export const seedPosts: Post[] = [
  { id: "p1", title: "How a 3-second SOS stopped an assault in Mirpur-10", tag: "Incident Story", date: "2026-11-08", author: "NURJA Control",
    excerpt: "A patrol unit reached Shirin within 4 minutes after her SOS was triggered near the metro station.",
    body: "At 10:42 PM, Shirin (name changed) triggered NURJA SOS when she was followed out of Mirpur-10 metro. Two patrol units, a Fari, and seven volunteers were alerted at once. Patrol Unit DMP-07 reached her in 4 minutes. The live video evidence was archived and helped identify the suspect.",
    image: patrol, targets: { app: true, rescue: true, blog: true } },
  { id: "p2", title: "Narayanganj volunteers complete rapid-response training", tag: "Community", date: "2026-11-02", author: "Rescue Network",
    excerpt: "142 new verified volunteers joined the Rescue Network after a two-day field training.",
    body: "The training covered safe approach, first aid, evidence handling and coordination with police teams.",
    image: volunteers, targets: { app: true, rescue: true, blog: true } },
  { id: "p3", title: "Know your rights: what to do when harassed in public transport", tag: "Awareness", date: "2026-10-27", author: "Legal Aid Cell",
    excerpt: "A short guide on your legal protections and how NURJA evidence can support a complaint.",
    body: "Bangladeshi law protects you from harassment in public spaces. Record, report, and use your NURJA archive as evidence.",
    youtube: "https://www.youtube.com/embed/KuRxu4Ncsmc", targets: { app: true, rescue: false, blog: true } },
  { id: "p4", title: "Self-defense workshop at Dhaka University", tag: "Awareness", date: "2026-10-18", author: "NURJA Team",
    excerpt: "Over 300 students learned practical self-defense and how to set up NURJA in under 3 minutes.",
    body: "The workshop paired self-defense coaches with a NURJA onboarding desk.",
    image: workshop, targets: { app: true, rescue: true, blog: true } },
];

export const seedZones: Zone[] = [
  { id: "z1", name: "Gulistan underpass", x: 58, y: 42, r: 9, rating: 5 },
  { id: "z2", name: "Sadarghat back lanes", x: 46, y: 70, r: 8, rating: 4 },
  { id: "z3", name: "Kamalapur rail yard", x: 70, y: 52, r: 7, rating: 3 },
  { id: "z4", name: "Tejgaon industrial", x: 52, y: 22, r: 8, rating: 2 },
  { id: "z5", name: "Chashara bus stand", x: 80, y: 80, r: 6, rating: 4 },
  { id: "z6", name: "Dhanmondi lake east", x: 34, y: 36, r: 5, rating: 1 },
];

export const seedKyc: KycSubmission[] = [
  { id: "k1", name: "Farzana Akter", phone: "01712345678", dob: "1998-04-12", type: "adult", status: "pending", submittedAt: "12 min ago" },
  { id: "k2", name: "Nusrat Jahan", phone: "01987654321", dob: "2010-09-03", type: "minor", status: "pending", submittedAt: "34 min ago",
    birthReg: "20101234567890123", guardian: { name: "Abdul Karim", phone: "01811223344", relation: "Father" } },
  { id: "k3", name: "Tahmina Rahman", phone: "01556677889", dob: "1993-01-25", type: "adult", status: "pending", submittedAt: "1 h ago" },
  { id: "k4", name: "Sadia Islam", phone: "01399887766", dob: "2001-07-19", type: "adult", status: "approved", submittedAt: "Yesterday" },
];

export const seedVolunteerApps: VolunteerApp[] = [
  { id: "a1", name: "Rakib Hasan", phone: "01722334455", email: "rakib@mail.com", address: "Fatullah, Narayanganj", nid: "1995123456789",
    occupation: "Pharmacist", motivation: "My sister was harassed on her way home. I want to help.", status: "pending", submittedAt: "2 h ago", hasPhoto: true },
  { id: "a2", name: "Mim Chowdhury", phone: "01633445566", email: "mim@mail.com", address: "Mohammadpur, Dhaka", nid: "1999456123789",
    occupation: "University student", motivation: "I want my campus area to be safer at night.", status: "pending", submittedAt: "5 h ago", hasPhoto: true },
];

export const seedResponders: Responder[] = [
  { id: "r1", name: "Patrol Unit DMP-07", kind: "patrol", code: "PU-07", area: "Motijheel", phone: "01320000007", online: true },
  { id: "r2", name: "Patrol Unit DMP-12", kind: "patrol", code: "PU-12", area: "Paltan", phone: "01320000012", online: true },
  { id: "r3", name: "Police Fari — Wari", kind: "fari", code: "PF-03", area: "Wari", phone: "01320000103", online: true },
  { id: "r4", name: "Motijheel Police Station", kind: "station", code: "PS-MTJ", area: "Motijheel", phone: "01320000200", online: true },
  { id: "r5", name: "Rakibul Islam", kind: "volunteer", code: "V-J75UN2", area: "Shantinagar", phone: "01711000001", online: true },
  { id: "r6", name: "SI Tanvir Ahmed", kind: "officer", code: "TF-902", area: "Ramna", phone: "01711000902", online: true },
  { id: "r7", name: "Ayesha Siddika", kind: "volunteer", code: "V-K28PQ4", area: "Kakrail", phone: "01711000002", online: false },
];

export const seedCases: CaseRecord[] = [
  { id: "SOS-2611-0412", victim: "R. Begum", area: "Paltan", date: "Nov 11, 22:14", outcome: "Rescued safely", duration: "6m 12s" },
  { id: "SOS-2611-0398", victim: "M. Akter", area: "Kakrail", date: "Nov 09, 19:47", outcome: "False alarm — PIN cancelled", duration: "1m 40s" },
  { id: "SOS-2611-0371", victim: "S. Khatun", area: "Wari", date: "Nov 06, 23:02", outcome: "Suspect detained", duration: "9m 05s" },
];

// Map positions (0–100 percentage coordinates) used by the stylised SVG maps.
export const VICTIM_POS = { x: 50, y: 50 };
export const DISPATCH_UNITS = [
  { id: "u1", label: "Patrol DMP-07", kind: "patrol" as const, x: 30, y: 34, eta: 3, dist: 1.1 },
  { id: "u2", label: "Patrol DMP-12", kind: "patrol" as const, x: 70, y: 30, eta: 4, dist: 1.4 },
  { id: "u3", label: "Police Fari — Wari", kind: "fari" as const, x: 74, y: 70, eta: 6, dist: 2.2 },
  { id: "u4", label: "Motijheel PS", kind: "station" as const, x: 24, y: 72, eta: 8, dist: 2.9 },
];
export const VOLUNTEER_POS = [
  [42, 40], [58, 38], [60, 60], [40, 62], [36, 50], [64, 48], [52, 30], [48, 70], [30, 56], [68, 58],
].map(([x, y], i) => ({ id: `v${i}`, label: i === 0 ? "V-J75UN2" : `V-${(i * 7919).toString(36).toUpperCase().padStart(6, "Q").slice(0, 6)}`, x, y, eta: 2 + (i % 5), dist: +(0.4 + i * 0.17).toFixed(1) }));
