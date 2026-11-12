import { Slogan } from "@/lib/i18n";
import { AuthSheet } from "@/components/nurja/AuthSheet";
import { useMemo, useState } from "react";
import { ArrowLeft, Baby, Eye, EyeOff, KeyRound, Loader2, Lock, Phone, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOGOS } from "../Brand";
import { PinInput, UploadCard } from "./ui";
import { useDemo } from "@/lib/demo-store";
import { ageFromDob, isValidBdPhone } from "@/lib/ids";
import { signUpWithPhone } from "@/lib/auth";
import { cn } from "@/lib/utils";

const RELATIONS = ["Mother", "Father", "Sister", "Brother", "Husband", "Guardian", "Friend"];

export function SignedOutSplash() {
  const d = useDemo();
  const [auth, setAuth] = useState<"signin" | null>(null);
  return (
    <div className="relative flex flex-1 flex-col items-center justify-between overflow-hidden bg-hero px-8 pb-12 pt-24 text-center">
      <div className="relative mt-10">
        <span className="absolute inset-0 rounded-full bg-crimson/20 animate-ripple" />
        <span className="absolute inset-0 rounded-full bg-crimson/20 animate-ripple [animation-delay:1.2s]" />
        <img src={LOGOS.icon} alt="NURJA" className="relative h-40 w-40 rounded-full bg-paper object-contain p-4 shadow-sos animate-breathe" />
      </div>
      <div className="space-y-3 animate-rise">
        <img src={LOGOS.lettering} alt="NURJA" className="mx-auto h-12 object-contain" />
        <p className="font-display text-base font-bold text-crimson"><Slogan /></p>
        <p className="text-muted-foreground">Your safety, one tap away. Police and verified volunteers nearby, always ready.</p>
      </div>
      <div className="w-full space-y-3">
        <Button size="lg" className="h-14 w-full rounded-lg text-base shadow-sos" onClick={() => setAuth("signin")}>Login</Button>
        <Button size="lg" variant="outline" className="h-14 w-full rounded-lg text-base" onClick={() => d.set({ appView: "onboarding" })}>Create account</Button>
      </div>
      <AuthSheet
        open={auth !== null}
        initialMode="signin"
        onClose={() => setAuth(null)}
      />
    </div>
  );
}

export function Onboarding() {
  const d = useDemo();
  const [step, setStep] = useState(1);
  const [sub, setSub] = useState(0);
  const [f, setF] = useState({
    phone: "", otp: "", password: "", confirm: "", pin: "", pin2: "", name: "", dob: "", eName: "", ePhone: "", eRel: "",
    nidFront: null as string | null, nidBack: null as string | null, selfie: null as string | null,
    birthReg: "", gName: "", gPhone: "", gRel: "", consent: false, gNid: null as string | null,
  });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const age = useMemo(() => (f.dob ? ageFromDob(f.dob) : null), [f.dob]);
  const adult = age !== null && age >= 18;
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));

  const back = () => (step === 7 && sub > 0 ? setSub(sub - 1) : step > 1 ? setStep(step - 1) : d.set({ appView: "main" }));
  const next = () => {
    const err = validate();
    if (err) return toast.error(err);
    if (step === 7) {
      if (sub < 2) return setSub(sub + 1);
      finish(); return;
    }
    setStep(step + 1);
  };

  const validate = (): string | null => {
    switch (step) {
      case 1: return isValidBdPhone(f.phone) ? null : "Enter a valid number like 01XXXXXXXXX";
      case 2: return f.otp.length === 6 ? null : "Enter the 6-digit code";
      case 3: return f.password.length < 8 ? "Password must be at least 8 characters" : f.password !== f.confirm ? "Passwords do not match" : null;
      case 4: return f.pin.length !== 6 ? "PIN must be 6 digits" : f.pin !== f.pin2 ? "PINs do not match" : null;
      case 5: return !f.name.trim() ? "Enter your full name" : !f.dob ? "Pick your date of birth" : (age ?? -1) < 5 ? "Please check your date of birth" : null;
      case 6: return !isValidBdPhone(f.ePhone) ? "Enter a valid emergency number" : !f.eRel ? "Choose a relationship" : null;
      case 7:
        if (adult) return [f.nidFront, f.nidBack, f.selfie][sub] ? null : "Please capture this photo";
        if (sub === 0) return /^\d{17}$/.test(f.birthReg) ? null : "Birth registration number must be 17 digits";
        if (sub === 1) return !f.gName || !isValidBdPhone(f.gPhone) || !f.gRel ? "Fill in all guardian details" : !f.consent ? "Guardian consent is required" : null;
        return f.gNid ? null : "Please capture guardian's NID";
    }
    return null;
  };

  const finish = async () => {
    setBusy(true);
    try {
      // Create the real account first; only then enter the app.
      const data = await signUpWithPhone({ phone: f.phone, password: f.password, fullName: f.name.trim() });
      if (!data.session) {
        // No session (email confirmation on): back to the splash so they can log in.
        toast.success("Account created! Now log in with your phone and password.");
        d.set({ appView: "main" });
        return;
      }
      d.set((s) => ({
        appView: "main",
        user: { name: f.name, phone: f.phone, dob: f.dob, adult, emergencyName: f.gName || "Family contact", emergencyPhone: f.ePhone, relation: f.eRel, pin: f.pin },
        kyc: s.kyc.map((k) => k.id === s.selfKycId ? {
          ...k, name: f.name, phone: f.phone, dob: f.dob, type: adult ? "adult" : "minor", status: "pending", submittedAt: "Just now",
          ...(adult ? {} : { birthReg: f.birthReg, guardian: { name: f.gName, phone: f.gPhone, relation: f.gRel } }),
        } : k),
      }));
      toast.success("KYC submitted for review", { description: "SOS unlocks as soon as the Control Panel approves you." });
      setStep(1); setSub(0);
    } catch (err) {
      const msg = err instanceof Error && /already registered|already exists/i.test(err.message)
        ? "This number already has an account. Log in instead."
        : "Account could not be created. Check your connection and try again.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const totalSteps = 9; // 1..6 + 3 KYC sub-steps
  const progress = step < 7 ? step : 6 + sub + 1;

  return (
    <div className="flex flex-1 flex-col px-6 pb-8 pt-12">
      <div className="flex items-center gap-3">
        <button onClick={back} className="grid h-10 w-10 place-items-center rounded-lg bg-muted" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-crimson transition-all duration-500" style={{ width: `${(progress / totalSteps) * 100}%` }} />
        </div>
        <span className="text-xs font-bold text-muted-foreground">{step < 7 ? `${step}/7` : `7.${sub + 1}`}</span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <img src={LOGOS.icon} alt="NURJA" className="h-7 w-7 rounded-md bg-paper object-contain" />
        <span className="font-display text-sm font-extrabold text-plum">NURJA</span>
        <Slogan className="text-[11px] font-semibold text-muted-foreground" />
      </div>

      <div key={`${step}-${sub}`} className="mt-8 flex-1 space-y-6 animate-rise">
        {step === 1 && <Head icon={Phone} title="Your phone number" text="We'll send a 6-digit code to verify it." />}
        {step === 1 && (
          <div className="flex items-center gap-2 rounded-lg border bg-card px-4">
            <span className="font-semibold text-muted-foreground">🇧🇩 +88</span>
            <Input className="h-14 border-0 text-lg shadow-none focus-visible:ring-0" placeholder="01XXXXXXXXX" inputMode="numeric" maxLength={11} value={f.phone} onChange={(e) => set({ phone: e.target.value.replace(/\D/g, "") })} autoFocus />
          </div>
        )}

        {step === 2 && <Head icon={ShieldCheck} title="Enter the code" text={`Sent to ${f.phone || "your phone"}. Demo: any 6 digits work.`} />}
        {step === 2 && <><PinInput value={f.otp} onChange={(v) => set({ otp: v })} autoFocus /><p className="text-center text-sm text-muted-foreground">Didn't get it? <button className="font-semibold text-crimson" onClick={() => toast("New code sent")}>Resend in 0:45</button></p></>}

        {step === 3 && <Head icon={Lock} title="Create a password" text="You'll use this to log in on a new device." />}
        {step === 3 && (
          <div className="space-y-3">
            <div className="relative">
              <Input type={show ? "text" : "password"} className="h-14 rounded-lg pr-12" placeholder="At least 8 characters" value={f.password} onChange={(e) => set({ password: e.target.value })} />
              <button className="absolute right-4 top-4 text-muted-foreground" onClick={() => setShow(!show)}>{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
            </div>
            <Input type={show ? "text" : "password"} className="h-14 rounded-lg" placeholder="Confirm password" value={f.confirm} onChange={(e) => set({ confirm: e.target.value })} />
            <div className="flex gap-1">{[0, 1, 2, 3].map((i) => <div key={i} className={cn("h-1 flex-1 rounded-full", f.password.length > i * 3 + 2 ? (f.password.length >= 10 ? "bg-emerald" : "bg-amber") : "bg-muted")} />)}</div>
          </div>
        )}

        {step === 4 && <Head icon={KeyRound} title="Set your Security PIN" text="This 6-digit PIN is required to turn OFF an active SOS. An attacker can't silence your alert without it." />}
        {step === 4 && (
          <div className="space-y-5">
            <div className="space-y-2"><Label className="block text-center">Enter PIN</Label><PinInput value={f.pin} onChange={(v) => set({ pin: v })} autoFocus /></div>
            <div className="space-y-2"><Label className="block text-center">Confirm PIN</Label><PinInput value={f.pin2} onChange={(v) => set({ pin2: v })} /></div>
            <p className="rounded-2xl bg-amber-soft p-3 text-xs font-medium text-foreground">Don't use your birthday or 123456. Only you should know this PIN.</p>
          </div>
        )}

        {step === 5 && <Head icon={UserRound} title="About you" text="Your age decides which verification you'll need." />}
        {step === 5 && (
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Full name</Label><Input className="h-14 rounded-lg" placeholder="As on your NID / birth certificate" value={f.name} onChange={(e) => set({ name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Date of birth</Label><Input type="date" className="h-14 rounded-lg" max={new Date().toISOString().slice(0, 10)} value={f.dob} onChange={(e) => set({ dob: e.target.value })} /></div>
            {age !== null && (
              <div className={cn("flex items-center gap-3 rounded-2xl p-4 animate-rise", adult ? "bg-emerald-soft" : "bg-amber-soft")}>
                <div className={cn("grid h-11 w-11 place-items-center rounded-full text-paper", adult ? "bg-emerald" : "bg-amber")}>{adult ? <ShieldCheck className="h-5 w-5" /> : <Baby className="h-5 w-5" />}</div>
                <div>
                  <p className="font-display font-bold">{adult ? "Adult 18+ Profile" : "Under 18 Minor Profile"}</p>
                  <p className="text-xs text-muted-foreground">Age {age} · {adult ? "NID + selfie verification" : "Birth registration + guardian consent"}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 6 && <Head icon={Phone} title="Emergency family contact" text="They'll get an SMS with your live location when you trigger SOS." />}
        {step === 6 && (
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Contact number</Label><Input className="h-14 rounded-lg" placeholder="01XXXXXXXXX" inputMode="numeric" maxLength={11} value={f.ePhone} onChange={(e) => set({ ePhone: e.target.value.replace(/\D/g, "") })} /></div>
            <div className="space-y-1.5"><Label>Relationship</Label>
              <div className="flex flex-wrap gap-2">{RELATIONS.map((r) => <button key={r} onClick={() => set({ eRel: r })} className={cn("rounded-lg border px-4 py-2 text-sm font-semibold", f.eRel === r ? "border-primary bg-primary text-primary-foreground" : "bg-card")}>{r}</button>)}</div>
            </div>
          </div>
        )}

        {step === 7 && (
          <>
            <div className="flex items-center gap-2">
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", adult ? "bg-emerald-soft text-emerald" : "bg-amber-soft text-amber")}>{adult ? "Adult 18+ KYC" : "Under 18 KYC"}</span>
              <span className="text-xs text-muted-foreground">Step 7.{sub + 1} of 7.3</span>
            </div>
            {adult ? (
              <>
                {sub === 0 && <><Head title="NID front page" text="Place your NID on a flat surface, all corners visible." /><UploadCard title="NID — Front" hint="Name, photo and NID number must be readable" value={f.nidFront} onChange={(v) => set({ nidFront: v })} /></>}
                {sub === 1 && <><Head title="NID back page" text="Flip your card and capture the back side." /><UploadCard title="NID — Back" hint="Address and barcode visible" value={f.nidBack} onChange={(v) => set({ nidBack: v })} /></>}
                {sub === 2 && <><Head title="Live selfie" text="Look straight at the camera in good light." /><UploadCard selfie title="Live selfie" hint="We match it with your NID photo" value={f.selfie} onChange={(v) => set({ selfie: v })} /></>}
              </>
            ) : (
              <>
                {sub === 0 && (<><Head title="Birth registration" text="Enter the 17-digit number from your birth certificate." />
                  <Input className="h-14 rounded-lg text-lg tracking-widest" inputMode="numeric" maxLength={17} placeholder="17-digit number" value={f.birthReg} onChange={(e) => set({ birthReg: e.target.value.replace(/\D/g, "") })} />
                  <p className="text-right text-xs text-muted-foreground">{f.birthReg.length}/17</p></>)}
                {sub === 1 && (<><Head title="Guardian NOC form" text="A parent or legal guardian must give consent." />
                  <div className="space-y-3">
                    <Input className="h-12 rounded-lg" placeholder="Guardian full name" value={f.gName} onChange={(e) => set({ gName: e.target.value })} />
                    <Input className="h-12 rounded-lg" placeholder="Guardian phone 01XXXXXXXXX" inputMode="numeric" maxLength={11} value={f.gPhone} onChange={(e) => set({ gPhone: e.target.value.replace(/\D/g, "") })} />
                    <Select value={f.gRel} onValueChange={(v) => set({ gRel: v })}>
                      <SelectTrigger className="h-12 rounded-lg"><SelectValue placeholder="Relationship to you" /></SelectTrigger>
                      <SelectContent>{["Mother", "Father", "Legal guardian", "Grandparent", "Elder sibling"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                    <label className="flex gap-3 rounded-2xl border bg-muted/50 p-4 text-xs leading-relaxed">
                      <Checkbox checked={f.consent} onCheckedChange={(v) => set({ consent: !!v })} className="mt-0.5" />
                      <span>I, the guardian named above, give legal consent for this minor to use NURJA, to share live location and camera with authorised responders during SOS, and confirm the details are true. <span className="font-bold text-crimson">*Required</span></span>
                    </label>
                  </div></>)}
                {sub === 2 && <><Head title="Guardian's NID" text="Capture the front of your guardian's NID." /><UploadCard title="Guardian NID — Front" hint="Must match the guardian name above" value={f.gNid} onChange={(v) => set({ gNid: v })} /></>}
              </>
            )}
          </>
        )}
      </div>

      <Button size="lg" className="mt-6 h-14 w-full rounded-lg text-base" onClick={next} disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {step === 7 && sub === 2 ? "Submit for verification" : "Continue"}
      </Button>
    </div>
  );
}

function Head({ icon: I, title, text }: { icon?: React.ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <div className="space-y-2">
      {I && <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-crimson"><I className="h-6 w-6" /></div>}
      <h1 className="text-[26px] font-extrabold leading-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
