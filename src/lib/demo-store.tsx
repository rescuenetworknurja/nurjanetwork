import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  type CaseRecord, type KycStatus, type KycSubmission, type Post, type Responder, type VolunteerApp, type Zone,
} from "./mock-data";
import { type AccountStatus, type AppUser } from "./users";
import { seedWebsite, type Inquiry, type WebsiteContent } from "./website-content";
import { type IncidentEvidence } from "./evidence";
import { supabase } from "@/integrations/supabase/client";
import { useSession, normalizePhone } from "./auth";
import { getPublicRecords, getLiveSnapshot, saveRecord, submitPublicInquiry, submitVolunteerApplication, createResponder, updateResponder, approveLiveVolunteer, startLiveSos, completeLiveSos, respondToLiveSos, cancelLiveSos, setLiveCamera, setDutyStatus, updateLiveLocation, saveLiveEvidence, editLiveEvidenceTags } from "./live.functions";
import { setAccountStatus, setKycStatus as saveKycStatus } from "./profile.functions";
import { toXY } from "./geo-map";
import { toast } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { publicRecordsOptions } from "./public-records";
import { ageFromDob } from "./ids";

export type ResponderType = 1 | 2;
export type SosState = {
  id: string; startedAt: number; camera: "back" | "front"; victim: string; phone: string; area: string;
  acceptedBy: string[]; assignedIds?: string[]; emergencyName?: string; emergencyPhone?: string; userId?: string; lat?: number; lng?: number; smsStatus?: string;
  arrivedBy?: { code: string; arrivedAt: string }[];
};
export type DemoState = {
  lang: "bn" | "en";
  appView: "onboarding" | "main";
  user: { name: string; phone: string; dob: string; adult: boolean; emergencyName: string; emergencyPhone: string; relation: string; pin: string };
  selfKycId: string;
  responderType: ResponderType;
  responderId: string;
  responderOnline: boolean;
  rescueAuth: "splash" | "login" | "app";
  sos: SosState | null;
  incidents: SosState[];
  kycDocuments: Record<string, Record<string, string>>;
  liveLoading: boolean;
  liveError: string | null;
  kyc: KycSubmission[];
  volunteerApps: VolunteerApp[];
  responders: Responder[];
  zones: Zone[];
  posts: Post[];
  cases: CaseRecord[];
  evidence: IncidentEvidence[];
  apiKeys: Record<string, string>;
  websiteContent: WebsiteContent;
  inquiries: Inquiry[];
  users: AppUser[];
};

const initial: DemoState = {
  lang: "bn",
  appView: "main",
  user: { name: "", phone: "", dob: "", adult: true, emergencyName: "", emergencyPhone: "", relation: "", pin: "" },
  selfKycId: "self",
  responderType: 2,
  responderId: "",
  responderOnline: false,
  rescueAuth: "splash",
  sos: null, incidents: [], kycDocuments: {}, liveLoading: true, liveError: null,
  kyc: [], volunteerApps: [], responders: [], zones: [], posts: [], cases: [],
  evidence: [],
  apiKeys: {},
  websiteContent: seedWebsite,
  inquiries: [],
  users: [],
};

const KEY = "nurja-preferences-v2";

type Ctx = DemoState & {
  set: (patch: Partial<DemoState> | ((s: DemoState) => Partial<DemoState>)) => Promise<void>;
  refresh: () => Promise<void>;
  selectIncident: (id: string) => void;
  selfKyc: KycStatus;
  setSelfKyc: (s: KycStatus) => void;
  setAdult: (adult: boolean) => void;
  triggerSos: () => Promise<void>;
  stopSos: (outcome?: string, pin?: string) => Promise<void>;
  markArrived: (code: string) => Promise<void>;
  markRescued: () => Promise<void>;
  saveEvidence: (record: IncidentEvidence) => Promise<"saved" | "incident" | "storage">;
  setEvidenceTags: (id: string, tags: string[]) => Promise<boolean>;
  switchCamera: () => Promise<void>;
  acceptSos: (code: string) => Promise<void>;
  setKycStatus: (id: string, s: KycStatus) => void;
  submitVolunteer: (a: Omit<VolunteerApp, "id" | "status" | "submittedAt"> & { photo: string }) => Promise<void>;
  approveVolunteer: (id: string) => Promise<string>;
  rejectVolunteer: (id: string) => void;
  addResponder: (r: Omit<Responder, "id">) => Promise<void>;
  updateResponder: (id: string, r: Omit<Responder, "id">) => Promise<void>;
  submitInquiry: (q: Pick<Inquiry, "name" | "contact" | "subject" | "message">) => Promise<void>;
  selfStatus: AccountStatus;
  selfBanReason: string | undefined;
  setUserStatus: (id: string, status: AccountStatus, reason?: string) => Promise<void>;
  setUserKyc: (id: string, kyc: KycStatus) => Promise<void>;
  markUserFalseSos: (id: string) => void;
  reset: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const {data:publicRecords}=useSuspenseQuery(publicRecordsOptions);
  const [state, setState] = useState<DemoState>(() => ({...initial,
    websiteContent:publicRecords.find(r=>r.collection==="website")?.content as unknown as WebsiteContent ?? initial.websiteContent,
    posts:publicRecords.filter(r=>r.collection==="posts").map(r=>r.content as unknown as Post),
    zones:publicRecords.filter(r=>r.collection==="zones").map(r=>r.content as unknown as Zone),
  }));
  const stateRef = useRef(state); stateRef.current = state;
  const session = useSession();
  const selectedIncident = useRef<string | null>(null);
  const generation = useRef(0);
  const local = useCallback((patch: Partial<DemoState>) => setState(s => ({ ...s, ...patch })), []);
  const refresh = useCallback(async () => {
    const version = generation.current;
    try {
      const rows = session.user ? (await getLiveSnapshot()) : null;
      const records = rows?.records ?? await getPublicRecords();
      if (version !== generation.current) return;
      const read = <T,>(collection: string): T[] => records.filter(r => r.collection === collection).map(r => r.content as unknown as T);
      const patch: Partial<DemoState> = { posts: read<Post>("posts"), zones: read<Zone>("zones"), inquiries: read<Inquiry>("inquiries"), volunteerApps: read<VolunteerApp>("volunteerApps"), liveLoading: false, liveError: null };
      const website = read<WebsiteContent>("website")[0]; if (website) patch.websiteContent = website;
      if (rows) {
        const units: Responder[] = rows.responders.map(r => ({ ...(r.details as object), id:r.id, name:r.name, code:r.code, phone:r.phone, area:r.area, kind:r.kind as Responder["kind"], fixed:r.fixed, online:r.online, ...(r.lat !== null && r.lng !== null ? {lat:r.lat,lng:r.lng,...toXY(r.lat,r.lng)} : {}) }));
        const incidents = rows.incidents.filter(i => i.status === "active").map(i => ({ id:i.id, userId:i.user_id, assignedIds:rows.assignments.filter(a=>a.incident_id===i.id && a.state!=="declined").map(a=>a.responder_id), emergencyName:i.emergency_name??"", emergencyPhone:i.emergency_phone??"", startedAt:new Date(i.created_at).getTime(), camera:i.camera as "back"|"front", victim:i.victim, phone:i.phone, area:i.area || (i.lat !== null && i.lng !== null ? `${i.lat.toFixed(5)}, ${i.lng.toFixed(5)}` : ""), ...(i.lat !== null && i.lng !== null ? {lat:i.lat,lng:i.lng} : {}), smsStatus:i.sms_status, acceptedBy:rows.assignments.filter(a=>a.incident_id===i.id && ["accepted","arrived"].includes(a.state)).map(a=>units.find(r=>r.id===a.responder_id)?.code ?? ""), arrivedBy: rows.assignments.filter(a=>a.incident_id===i.id && a.arrived_at).map(a=>({code:units.find(r=>r.id===a.responder_id)?.code ?? "",arrivedAt:a.arrived_at ?? ""})) }));
        const p=rows.profile; const mine=rows.responders.find(r=>r.user_id===session.user?.id);
        patch.responders=units; patch.incidents=incidents;
        patch.sos=incidents.find(i=>i.id===selectedIncident.current) ?? incidents.find(i=>i.userId===session.user?.id) ?? (rows.roles.some(r=>r==="admin"||r==="responder") ? incidents[0] ?? null : null);
        patch.responderId=mine?.id ?? ""; patch.responderOnline=mine?.online ?? false; patch.responderType=mine && ["patrol","fari","station"].includes(mine.kind) ? 1:2;
        patch.cases=rows.incidents.filter(i=>i.status!=="active").map(i=>({id:i.id,userId:i.user_id,victim:i.victim,area:i.area,date:i.created_at,outcome:i.outcome ?? i.status,duration:`${Math.max(0,Math.round((new Date(i.ended_at ?? i.updated_at).getTime()-new Date(i.created_at).getTime())/60000))}m`}));
        patch.users=rows.profiles.map(u=>({id:u.id,name:u.full_name,phone:u.phone??"",dob:u.dob??"",address:"",idNumber:u.nid_number??rows.submissions.find(s=>s.user_id===u.id)?.birth_reg??"",kyc:u.kyc_status as KycStatus,status:u.account_status as AccountStatus,banReason:u.status_reason??undefined,sosCount:rows.incidents.filter(i=>i.user_id===u.id).length,falseCount:u.false_count,lat:u.last_lat??NaN,lng:u.last_lng??NaN,registeredAt:u.created_at,emergency:{name:u.emergency_contact_name??"",phone:u.emergency_contact_phone??"",relation:u.emergency_relation??""}}));
        patch.kyc=rows.profiles.map(u=>({id:u.id,name:u.full_name,phone:u.phone??"",dob:u.dob??"",type:u.dob && ageFromDob(u.dob)<18?"minor":"adult",status:u.kyc_status as KycStatus,submittedAt:u.created_at}));
        patch.kycDocuments=Object.fromEntries(rows.submissions.map(s=>[s.user_id,s.documents])); patch.evidence=rows.evidence;
        if(p) { patch.selfKycId=p.id; patch.user={name:p.full_name,phone:p.phone??"",dob:p.dob??"",adult:!p.dob || ageFromDob(p.dob)>=18,emergencyName:p.emergency_contact_name??"",emergencyPhone:p.emergency_contact_phone??"",relation:p.emergency_relation??"",pin:""}; }
      }
      local(patch);
    } catch { if(version===generation.current) local({liveLoading:false,liveError:"Live data unavailable"}); }
  }, [session.user?.id, local]);
  useEffect(()=>{ generation.current++; local({...initial,websiteContent:stateRef.current.websiteContent,posts:stateRef.current.posts.filter(p=>p.published!==false),zones:stateRef.current.zones,lang:stateRef.current.lang,appView:stateRef.current.appView}); void refresh(); },[session.user?.id,refresh,local]);
  useEffect(()=>{
    const timer=setInterval(()=>void refresh(),10000);
    const channel=supabase.channel(`nurja-live-${crypto.randomUUID()}`);
    for(const table of ["incidents","dispatch_assignments","responders","live_records","incident_evidence"]) channel.on("postgres_changes",{event:"*",schema:"public",table},()=>void refresh());
    channel.subscribe(status=>{if(status==="SUBSCRIBED") void refresh();});
    return()=>{clearInterval(timer);void supabase.removeChannel(channel);};
  },[refresh]);
  useEffect(()=>{try {const p=JSON.parse(localStorage.getItem(KEY)??"{}");if(p.lang==="en"||p.lang==="bn")local({lang:p.lang}); localStorage.removeItem("nurja-demo-v1");}catch{}},[local]);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify({lang:state.lang}));}catch{}},[state.lang]);
  useEffect(()=>{
    const id=state.sos?.userId===session.user?.id?state.sos?.id:undefined;
    const mine=state.responders.find(r=>r.id===state.responderId);
    if(!id && (!mine || mine.fixed || !state.responderOnline))return;
    let last=0;
    const watch=navigator.geolocation.watchPosition(p=>{if(Date.now()-last<10000)return;last=Date.now();void updateLiveLocation({data:{...(id?{incidentId:id}:{}),lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy}}).catch(()=>local({liveError:"Location update failed"}));},()=>local({liveError:"Location permission required"}),{enableHighAccuracy:true,maximumAge:5000});
    return()=>navigator.geolocation.clearWatch(watch);
  },[state.sos?.id,state.responderId,state.responderOnline,session.user?.id]);
  const run=async(task:()=>Promise<unknown>)=>{try{await task();await refresh();}catch(e){const msg=e instanceof Error&&e.message&&!e.message.startsWith("[")?e.message:"";toast.error(stateRef.current.lang==="bn"?"সংরক্ষণ করা যায়নি; আবার চেষ্টা করুন।":"Could not save; try again.",msg?{description:msg}:undefined);throw e;}};
  const set:Ctx["set"]=async input=>{
    const current=stateRef.current; const patch=typeof input==="function"?input(current):input;
    const localPatch={...patch};
    for(const key of ["websiteContent","posts","zones","inquiries","volunteerApps"] as const) {
      const value=patch[key]; if(!value)continue; delete localPatch[key];
      if(key==="websiteContent") {await run(()=>saveRecord({data:{collection:"website",id:"main",content:value as unknown as Record<string,unknown>}}));continue;}
      const previous=current[key]; const next=value as {id:string}[];
      for(const item of next)if(JSON.stringify(item)!==JSON.stringify(previous.find(p=>p.id===item.id))) await run(()=>saveRecord({data:{collection:key,id:item.id,content:item as unknown as Record<string,unknown>}}));
      for(const item of previous)if(!next.some(n=>n.id===item.id))await run(()=>saveRecord({data:{collection:key,id:item.id,content:null}}));
    }
    if(patch.responderOnline!==undefined){delete localPatch.responderOnline;await run(()=>setDutyStatus({data:{online:patch.responderOnline ?? false}}));}
    local(localPatch);
  };
  const ctx:Ctx={...state,set,refresh,selectIncident:id=>{selectedIncident.current=id;local({sos:state.incidents.find(i=>i.id===id)??null});},
    selfKyc:state.kyc.find(k=>k.id===state.selfKycId)?.status??"pending",setSelfKyc:status=>local({kyc:state.kyc.map(k=>k.id===state.selfKycId?{...k,status}:k)}),setAdult:()=>{},
    selfStatus:state.users.find(u=>u.id===state.selfKycId)?.status??"active",selfBanReason:state.users.find(u=>u.id===state.selfKycId)?.banReason,
    triggerSos:async()=>{const {getSosPosition}=await import("./device-location");const p=await getSosPosition();await run(()=>startLiveSos({data:{lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy}}));},
    stopSos:async(outcome,pin)=>{if(!state.sos)return;await run(()=>pin?cancelLiveSos({data:{id:state.sos?.id??"",pin}}):completeLiveSos({data:{id:state.sos?.id??"",status:"closed",outcome:outcome??"Closed by control room"}}));},
    markRescued:async()=>{if(state.sos)await run(()=>completeLiveSos({data:{id:state.sos?.id??"",status:"rescued",outcome:"Rescued safely — confirmed by control room"}}));},
    markArrived:async()=>{if(state.sos)await run(()=>respondToLiveSos({data:{id:state.sos?.id??"",state:"arrived"}}));},
    acceptSos:async()=>{if(state.sos)await run(()=>respondToLiveSos({data:{id:state.sos?.id??"",state:"accepted"}}));},
    switchCamera:async()=>{if(state.sos)await run(()=>setLiveCamera({data:{id:state.sos?.id??"",camera:state.sos?.camera==="back"?"front":"back"}}));},
    saveEvidence:async record=>{try{await saveLiveEvidence({data:{id:record.id,incidentId:record.incidentId,src:record.src,capturedAt:record.capturedAt,camera:record.camera,tags:record.tags??[]}});await refresh();return "saved";}catch{return "storage";}},
    setEvidenceTags:async(id,tags)=>{try{await editLiveEvidenceTags({data:{id,tags}});await refresh();return true;}catch{return false;}},
    setKycStatus:(id,status)=>{void run(()=>saveKycStatus({data:{userId:id,status}}));},
    submitInquiry:async q=>{await run(()=>submitPublicInquiry({data:q}));},
    submitVolunteer:async a=>{await run(()=>submitVolunteerApplication({data:{name:a.name,phone:normalizePhone(a.phone),email:a.email,address:a.address,nid:a.nid,occupation:a.occupation,motivation:a.motivation,photo:a.photo}}));},
    approveVolunteer:async id=>{const result=await approveLiveVolunteer({data:{id}});await refresh();return result.code;},
    rejectVolunteer:id=>{const a=state.volunteerApps.find(a=>a.id===id);if(a)void set({volunteerApps:state.volunteerApps.map(v=>v.id===id?{...v,status:"rejected"}:v)});},
    updateResponder:async (id,r)=>{const {password,online:_o,x:_x,y:_y,...details}=r as Responder;await run(()=>updateResponder({data:{id,name:r.name,phone:normalizePhone(r.phone),code:r.code,kind:r.kind,area:r.area,...(password?{password}:{}),...(r.lat!==undefined?{lat:r.lat}:{}),...(r.lng!==undefined?{lng:r.lng}:{}),details:{...details,id:undefined}}}));},
    addResponder:async r=>{if(!r.password)throw new Error("Password required"); const {password,...details}=r;await run(()=>createResponder({data:{name:r.name,phone:normalizePhone(r.phone),password,code:r.code,kind:r.kind,area:r.area,...(r.lat!==undefined?{lat:r.lat}:{}),...(r.lng!==undefined?{lng:r.lng}:{}),details}}));},
    setUserStatus:async(id,status,reason)=>{await run(()=>setAccountStatus({data:{userId:id,status,...(reason?{reason}:{})}}));},
    setUserKyc:async(id,status)=>{await run(()=>saveKycStatus({data:{userId:id,status}}));},
    markUserFalseSos:()=>{},reset:()=>local({...initial,lang:state.lang}),
  };
  return <StoreCtx.Provider value={ctx}>{children}</StoreCtx.Provider>;
}

export function useDemo() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useDemo must be inside DemoStoreProvider");
  return c;
}
