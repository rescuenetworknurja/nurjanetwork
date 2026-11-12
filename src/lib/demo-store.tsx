import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  seedCases, seedKyc, seedPosts, seedResponders, seedVolunteerApps, seedZones,
  type CaseRecord, type KycStatus, type KycSubmission, type Post, type Responder, type VolunteerApp, type Zone,
} from "./mock-data";
import { generateVolunteerId } from "./ids";

export type ResponderType = 1 | 2;
export type SosState = {
  id: string; startedAt: number; camera: "back" | "front"; victim: string; phone: string; area: string;
  acceptedBy: string[];
};
export type DemoState = {
  lang: "bn" | "en";
  appView: "onboarding" | "main";
  user: { name: string; phone: string; dob: string; adult: boolean; emergencyName: string; emergencyPhone: string; relation: string; pin: string };
  selfKycId: string;
  responderType: ResponderType;
  responderOnline: boolean;
  sos: SosState | null;
  kyc: KycSubmission[];
  volunteerApps: VolunteerApp[];
  responders: Responder[];
  zones: Zone[];
  posts: Post[];
  cases: CaseRecord[];
  apiKeys: Record<string, string>;
};

const initial: DemoState = {
  lang: "bn",
  appView: "main",
  user: { name: "Nadia Hossain", phone: "01712349876", dob: "1999-03-14", adult: true, emergencyName: "Rehana Hossain", emergencyPhone: "01819876543", relation: "Mother", pin: "123456" },
  selfKycId: "self",
  responderType: 2,
  responderOnline: true,
  sos: null,
  kyc: [{ id: "self", name: "Nadia Hossain", phone: "01712349876", dob: "1999-03-14", type: "adult", status: "approved", submittedAt: "Just now" }, ...seedKyc],
  volunteerApps: seedVolunteerApps,
  responders: seedResponders,
  zones: seedZones,
  posts: seedPosts,
  cases: seedCases,
  apiKeys: {},
};

const KEY = "nurja-demo-v1";

type Ctx = DemoState & {
  set: (patch: Partial<DemoState> | ((s: DemoState) => Partial<DemoState>)) => void;
  selfKyc: KycStatus;
  setSelfKyc: (s: KycStatus) => void;
  setAdult: (adult: boolean) => void;
  triggerSos: () => void;
  stopSos: (outcome?: string) => void;
  switchCamera: () => void;
  acceptSos: (code: string) => void;
  setKycStatus: (id: string, s: KycStatus) => void;
  submitVolunteer: (a: Omit<VolunteerApp, "id" | "status" | "submittedAt">) => void;
  approveVolunteer: (id: string) => string;
  rejectVolunteer: (id: string) => void;
  addResponder: (r: Omit<Responder, "id">) => void;
  reset: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(initial);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
    } catch { /* ignore */ }
    hydrated.current = true;
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) setState({ ...initial, ...JSON.parse(e.newValue) });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (hydrated.current) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const set: Ctx["set"] = useCallback((patch) => {
    setState((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));
  }, []);

  const setKycStatus = (id: string, status: KycStatus) =>
    set((s) => ({ kyc: s.kyc.map((k) => (k.id === id ? { ...k, status } : k)) }));

  const ctx: Ctx = {
    ...state,
    set,
    selfKyc: state.kyc.find((k) => k.id === state.selfKycId)?.status ?? "pending",
    setSelfKyc: (st) => setKycStatus(state.selfKycId, st),
    setAdult: (adult) =>
      set((s) => {
        const dob = adult ? "1999-03-14" : "2010-06-21";
        return {
          user: { ...s.user, adult, dob },
          kyc: s.kyc.map((k) => k.id === s.selfKycId ? { ...k, dob, type: adult ? "adult" : "minor",
            ...(adult ? {} : { birthReg: "20109876543210987", guardian: { name: s.user.emergencyName, phone: s.user.emergencyPhone, relation: s.user.relation } }) } : k),
        };
      }),
    triggerSos: () =>
      set((s) => ({
        sos: { id: `SOS-2611-${Math.floor(1000 + Math.random() * 8999)}`, startedAt: Date.now(), camera: "back",
          victim: s.user.name, phone: s.user.phone, area: "Toyenbee Circular Rd, Motijheel, Dhaka", acceptedBy: [] },
      })),
    stopSos: (outcome = "Rescued safely") =>
      set((s) => {
        if (!s.sos) return {};
        const secs = Math.max(1, Math.round((Date.now() - s.sos.startedAt) / 1000));
        const rec: CaseRecord = { id: s.sos.id, victim: s.sos.victim, area: "Motijheel", date: "Just now", outcome,
          duration: `${Math.floor(secs / 60)}m ${String(secs % 60).padStart(2, "0")}s` };
        return { sos: null, cases: [rec, ...s.cases] };
      }),
    switchCamera: () => set((s) => (s.sos ? { sos: { ...s.sos, camera: s.sos.camera === "back" ? "front" : "back" } } : {})),
    acceptSos: (code) => set((s) => (s.sos && !s.sos.acceptedBy.includes(code) ? { sos: { ...s.sos, acceptedBy: [...s.sos.acceptedBy, code] } } : {})),
    setKycStatus,
    submitVolunteer: (a) =>
      set((s) => ({ volunteerApps: [{ ...a, id: `a${Date.now()}`, status: "pending", submittedAt: "Just now" }, ...s.volunteerApps] })),
    approveVolunteer: (id) => {
      const vid = generateVolunteerId();
      set((s) => {
        const app = s.volunteerApps.find((a) => a.id === id);
        return {
          volunteerApps: s.volunteerApps.map((a) => (a.id === id ? { ...a, status: "approved", volunteerId: vid } : a)),
          responders: app ? [...s.responders, { id: `r${Date.now()}`, name: app.name, kind: "volunteer", code: vid, area: app.address, phone: app.phone, online: false }] : s.responders,
        };
      });
      return vid;
    },
    rejectVolunteer: (id) => set((s) => ({ volunteerApps: s.volunteerApps.map((a) => (a.id === id ? { ...a, status: "rejected" } : a)) })),
    addResponder: (r) => set((s) => ({ responders: [...s.responders, { ...r, id: `r${Date.now()}` }] })),
    reset: () => setState((s) => ({ ...initial, lang: s.lang })),
  };

  return <StoreCtx.Provider value={ctx}>{children}</StoreCtx.Provider>;
}

export function useDemo() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useDemo must be inside DemoStoreProvider");
  return c;
}
