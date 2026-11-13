/** Editable public-website content (bilingual). Managed from /rpanel → Website CMS & CRM. */
export type Bi = { en: string; bn: string };
export type IconKey = "siren" | "zap" | "video" | "archive" | "target" | "shield" | "scale" | "heart" | "users" | "map" | "radio" | "phone";
export type CardItem = { id: string; icon: IconKey; title: Bi; text: Bi };
export type Milestone = { id: string; year: string; title: Bi; text: Bi };
export type TeamMember = { id: string; name: Bi; role: Bi };

export type WebsiteContent = {
  hero: { badge: Bi; slogan: Bi; headline: Bi; sub: Bi; cta: Bi; installCta?: Bi; installHelp?: Bi; image: string };
  stats: { users: number; volunteers: number; police: number; response: string };
  sections: { howEyebrow: Bi; howTitle: Bi; featuresEyebrow: Bi; featuresTitle: Bi; storiesEyebrow: Bi; storiesTitle: Bi; bandTitle: Bi; bandText: Bi };
  steps: CardItem[];
  features: CardItem[];
  story: { title: Bi; intro: Bi; mission: Bi; vision: Bi; sectionTitle: Bi; paragraphs: Bi[]; milestones: Milestone[]; team: TeamMember[]; org: Bi };
  contact: { intro: Bi; address: Bi; hotline: string; phone: string; email: string; supportEmail: string; hours: Bi; facebook: string; youtube: string; linkedin: string; footerAbout: Bi };
};

export type Inquiry = {
  id: string; name: string; contact: string; subject: string; message: string; at: string;
  status: "new" | "progress" | "resolved"; notes: string;
};

const b = (en: string, bn: string): Bi => ({ en, bn });

export const seedWebsite: WebsiteContent = {
  hero: {
    badge: b("Live across Dhaka & Narayanganj", "ঢাকা ও নারায়ণগঞ্জ জুড়ে চালু"),
    slogan: b("Safety • Confidence • Freedom", "নিরাপত্তা • আত্মবিশ্বাস • স্বাধীনতা"),
    headline: b("Help reaches her [in minutes,] not hours.", "সাহায্য পৌঁছে যায় [মিনিটের মধ্যে,] ঘণ্টায় নয়।"),
    sub: b("NURJA is a women safety and rapid rescue network. One SOS alerts the nearest police and verified volunteers, streams live video, and keeps the evidence safe.",
      "নুর্জা নারীর নিরাপত্তা ও দ্রুত উদ্ধার নেটওয়ার্ক। একটি SOS কাছের পুলিশ ও যাচাইকৃত ভলান্টিয়ারদের সতর্ক করে, লাইভ ভিডিও পাঠায় এবং প্রমাণ সুরক্ষিত রাখে।"),
    cta: b("Become a Volunteer", "ভলান্টিয়ার হোন"),
    installCta: b("Install App", "অ্যাপ ইনস্টল করুন"),
    installHelp: b("Open NURJASOS in Chrome outside this preview, then choose Install app or Add to Home screen from Chrome's menu. On iPhone, use Safari → Share → Add to Home Screen. Installation is available from the published website; this does not enable offline SOS.", "এই প্রিভিউয়ের বাইরে Chrome-এ NURJASOS খুলুন, তারপর Chrome-এর মেনু থেকে Install app বা Add to Home screen বেছে নিন। iPhone-এ Safari → Share → Add to Home Screen ব্যবহার করুন। প্রকাশিত ওয়েবসাইট থেকে ইনস্টল করা যাবে; এতে ইন্টারনেট ছাড়া SOS চালু হয় না।"),
    image: "",
  },
  stats: { users: 12847, volunteers: 4312, police: 186, response: "4m 12s" },
  sections: {
    howEyebrow: b("How this system works", "কীভাবে কাজ করে"),
    howTitle: b("From one tap to a safe rescue", "এক ট্যাপ থেকে নিরাপদ উদ্ধার"),
    featuresEyebrow: b("Key features", "মূল বৈশিষ্ট্য"),
    featuresTitle: b("Built for real emergencies", "সত্যিকারের জরুরি অবস্থার জন্য তৈরি"),
    storiesEyebrow: b("Stories & awareness", "ঘটনা ও সচেতনতা"),
    storiesTitle: b("Incident stories from the network", "নেটওয়ার্কের সত্য ঘটনা"),
    bandTitle: b("Be the nearest help.", "হয়ে উঠুন সবচেয়ে কাছের সাহায্য।"),
    bandText: b("Verified volunteers get alerts when someone nearby needs help. Training and verification are free.", "কাছে কেউ বিপদে পড়লে যাচাইকৃত ভলান্টিয়াররা অ্যালার্ট পান। প্রশিক্ষণ ও যাচাই সম্পূর্ণ বিনামূল্যে।"),
  },
  steps: [
    { id: "s1", icon: "siren", title: b("Trigger SOS", "SOS চালু করুন"), text: b("Tap the SOS button. A 3-second countdown prevents accidental alerts.", "SOS বাটনে চাপ দিন। ৩ সেকেন্ডের কাউন্টডাউন ভুলবশত অ্যালার্ট ঠেকায়।") },
    { id: "s2", icon: "zap", title: b("Instant nearest dispatch", "তাৎক্ষণিক নিকটতম ডিসপ্যাচ"), text: b("Nearest patrol units, police fari, station and volunteers are alerted at once.", "নিকটস্থ পেট্রোল ইউনিট, পুলিশ ফাঁড়ি, থানা ও ভলান্টিয়াররা একসাথে অ্যালার্ট পান।") },
    { id: "s3", icon: "video", title: b("Live camera & GPS stream", "লাইভ ক্যামেরা ও জিপিএস"), text: b("Responders and control room see live video and your location as you move.", "আপনি চলার সময় রেসপন্ডার ও কন্ট্রোল রুম লাইভ ভিডিও ও লোকেশন দেখতে পান।") },
    { id: "s4", icon: "archive", title: b("Safe rescue & evidence", "নিরাপদ উদ্ধার ও প্রমাণ"), text: b("Video and route are archived securely as legal evidence.", "ভিডিও ও রুট আইনি প্রমাণ হিসেবে নিরাপদে সংরক্ষিত হয়।") },
  ],
  features: [
    { id: "f1", icon: "target", title: b("Speed first", "গতি সবার আগে"), text: b("Every second matters. Our dispatch picks the nearest help automatically.", "প্রতিটি সেকেন্ড মূল্যবান। আমাদের ডিসপ্যাচ স্বয়ংক্রিয়ভাবে নিকটতম সাহায্য বেছে নেয়।") },
    { id: "f2", icon: "shield", title: b("Verified trust", "যাচাইকৃত আস্থা"), text: b("Every user and volunteer is checked before joining the network.", "নেটওয়ার্কে যোগ দেওয়ার আগে প্রত্যেক ব্যবহারকারী ও ভলান্টিয়ার যাচাই করা হয়।") },
    { id: "f3", icon: "scale", title: b("Evidence that counts", "কার্যকর প্রমাণ"), text: b("Live video and routes are archived to support justice.", "ন্যায়বিচারে সহায়তায় লাইভ ভিডিও ও রুট সংরক্ষণ করা হয়।") },
    { id: "f4", icon: "heart", title: b("Community power", "কমিউনিটির শক্তি"), text: b("Police and neighbours working together, not alone.", "পুলিশ ও প্রতিবেশী একসাথে কাজ করে, কেউ একা নয়।") },
  ],
  story: {
    title: b("Built so no woman has to wait alone for help.", "যাতে কোনো নারীকে একা সাহায্যের অপেক্ষায় থাকতে না হয়।"),
    intro: b("NURJA started in 2024 after a group of students in Narayanganj saw how long it took for help to arrive when a classmate was attacked near a bus stand. We brought together police units, community volunteers and technology into one rescue network.",
      "২০২৪ সালে নারায়ণগঞ্জের একদল শিক্ষার্থী দেখেছিল, বাসস্ট্যান্ডের কাছে এক সহপাঠী আক্রান্ত হলে সাহায্য পৌঁছাতে কত দেরি হয়। সেখান থেকেই নুর্জার শুরু। আমরা পুলিশ ইউনিট, কমিউনিটি ভলান্টিয়ার ও প্রযুক্তিকে একটি উদ্ধার নেটওয়ার্কে যুক্ত করেছি।"),
    mission: b("Get verified help to any woman in danger within minutes, anywhere in Bangladesh.", "বাংলাদেশের যেকোনো স্থানে বিপদে পড়া নারীর কাছে কয়েক মিনিটের মধ্যে যাচাইকৃত সাহায্য পৌঁছে দেওয়া।"),
    vision: b("A country where every woman moves with safety, confidence and freedom.", "এমন একটি দেশ, যেখানে প্রতিটি নারী নিরাপত্তা, আত্মবিশ্বাস ও স্বাধীনতা নিয়ে চলাফেরা করেন।"),
    sectionTitle: b("Police and people, one network", "পুলিশ ও জনগণ, এক নেটওয়ার্ক"),
    paragraphs: [
      b("Police stations, patrol units and fari vehicles are dispatched automatically. Trained volunteers nearby can accept the alert and reach her first.", "থানা, পেট্রোল ইউনিট ও ফাঁড়ির গাড়ি স্বয়ংক্রিয়ভাবে পাঠানো হয়। কাছের প্রশিক্ষিত ভলান্টিয়াররা অ্যালার্ট গ্রহণ করে সবার আগে পৌঁছাতে পারেন।"),
      b("Our control room watches every live SOS, can switch the victim's camera remotely, and keeps evidence secure for legal action.", "আমাদের কন্ট্রোল রুম প্রতিটি লাইভ SOS পর্যবেক্ষণ করে, দূর থেকে ভুক্তভোগীর ক্যামেরা বদলাতে পারে এবং আইনি পদক্ষেপের জন্য প্রমাণ সুরক্ষিত রাখে।"),
    ],
    milestones: [
      { id: "m1", year: "2024", title: b("The idea", "ভাবনার শুরু"), text: b("Students in Narayanganj sketch the first SOS network.", "নারায়ণগঞ্জের শিক্ষার্থীরা প্রথম SOS নেটওয়ার্কের নকশা করেন।") },
      { id: "m2", year: "2025", title: b("Police partnership", "পুলিশের সাথে অংশীদারত্ব"), text: b("First patrol units and stations join the pilot.", "প্রথম পেট্রোল ইউনিট ও থানা পাইলটে যুক্ত হয়।") },
      { id: "m3", year: "2026", title: b("City-wide launch", "শহরজুড়ে চালু"), text: b("Live across Dhaka and Narayanganj with thousands of volunteers.", "হাজারো ভলান্টিয়ার নিয়ে ঢাকা ও নারায়ণগঞ্জ জুড়ে চালু।") },
    ],
    team: [
      { id: "t1", name: b("Founding team", "প্রতিষ্ঠাতা দল"), role: b("Students & community organisers", "শিক্ষার্থী ও কমিউনিটি সংগঠক") },
      { id: "t2", name: b("Control room", "কন্ট্রোল রুম"), role: b("24/7 dispatch operators", "২৪/৭ ডিসপ্যাচ অপারেটর") },
    ],
    org: b("NURJA is a non-profit safety initiative working with local police and community volunteers.", "নুর্জা একটি অলাভজনক নিরাপত্তা উদ্যোগ, যা স্থানীয় পুলিশ ও কমিউনিটি ভলান্টিয়ারদের সাথে কাজ করে।"),
  },
  contact: {
    intro: b("For emergencies, always use the NURJA SOS or call 999. For everything else, write to us.", "জরুরি অবস্থায় সবসময় নুর্জা SOS ব্যবহার করুন বা ৯৯৯-এ কল করুন। অন্য যেকোনো প্রয়োজনে আমাদের লিখুন।"),
    address: b("Level 4, Toyenbee Circular Rd, Motijheel, Dhaka 1000", "লেভেল ৪, টয়েনবি সার্কুলার রোড, মতিঝিল, ঢাকা ১০০০"),
    hotline: "999", phone: "+880 1700-NURJA0", email: "hello@nurja.org", supportEmail: "support@nurja.org",
    hours: b("Sun–Thu, 9am–6pm (SOS control room 24/7)", "রবি–বৃহস্পতি, সকাল ৯টা–সন্ধ্যা ৬টা (SOS কন্ট্রোল রুম ২৪/৭)"),
    facebook: "https://facebook.com/nurja", youtube: "https://youtube.com/@nurja", linkedin: "https://linkedin.com/company/nurja",
    footerAbout: b("Women safety and rapid rescue network for Bangladesh. One tap connects you with police and verified volunteers nearby.", "বাংলাদেশের নারীর নিরাপত্তা ও দ্রুত উদ্ধার নেটওয়ার্ক। এক ট্যাপে আপনি যুক্ত হবেন কাছের পুলিশ ও যাচাইকৃত ভলান্টিয়ারদের সাথে।"),
  },
};

export const seedInquiries: Inquiry[] = [
  { id: "q1", name: "Farzana Akter", contact: "farzana@example.com", subject: "Campus safety workshop", message: "Can your team run a safety session at our university next month?", at: "2026-11-11 14:20", status: "new", notes: "" },
  { id: "q2", name: "Shafiq Rahman", contact: "01811223344", subject: "Partnership with ride-share drivers", message: "We'd like our drivers to join as volunteers.", at: "2026-11-10 09:05", status: "progress", notes: "Call scheduled for Thursday." },
];
