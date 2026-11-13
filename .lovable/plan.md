# NURJA — বাকি সব ডেমোকে বাস্তব সেবায় বদলানো

আপনার সংযুক্ত Supabase ব্যবহার করেই কাজ হবে। বর্তমান চারটি পর্দার ডিজাইন ও বাংলা/ইংরেজি ব্যবস্থা থাকবে; ডেমো লগইন, বানানো ঘটনা ও ভুয়া সাফল্যের বার্তা থাকবে না। প্রতিটি ধাপ যাচাই করে পরের ধাপে এগোনো হবে।

## ১. রেজিস্ট্রেশন ও অ্যাকাউন্ট সম্পূর্ণ করা
- BulkSMSBD দিয়ে রেজিস্ট্রেশন ও পাসওয়ার্ড রিসেটের OTP পৌঁছানো যাচাই; ব্যর্থ হলে স্পষ্ট বার্তা ও পুনরায় পাঠানোর সুযোগ। আগের IP whitelist সমস্যা যাচাই না করে SMS ঠিক হয়েছে বলা হবে না।
- জন্মতারিখ, জরুরি যোগাযোগ, অভিভাবকের তথ্য, SOS PIN ও আসল KYC ছবি Supabase-এ সংরক্ষণ। বর্তমানে রেজিস্ট্রেশনের এসব তথ্যের কিছু অংশ শুধু ব্রাউজারে থাকে।
- PIN গোপনভাবে যাচাই হবে; পর্দায় বা ব্রাউজারের স্থায়ী সংরক্ষণে PIN দেখানো/রাখা হবে না।
- KYC অনুমোদন এবং ব্যান/সাসপেনশনের নিয়ম আসল অ্যাকাউন্টে কার্যকর করা।

## ২. SOS, ডিসপ্যাচ ও রেসপন্ডার
- SOS চাপলে বাস্তব ঘটনা তৈরি, ফোনের প্রকৃত অবস্থান হালনাগাদ এবং rpanel-এ সব সক্রিয় ঘটনার তালিকা। একাধিক ব্যবহারকারীর SOS একসঙ্গে সামলানো।
- প্রকৃত দূরত্ব অনুযায়ী কাছের অনলাইন ইউনিট বাছাই: সর্বোচ্চ ২ পেট্রোল, ১ ফাঁড়ি, ১ থানা ও ১০ ভলান্টিয়ার/অফিসার। যতজন সত্যিই আছে ততজনই দেখানো; বানানো রেসপন্ডার বা চলন্ত মার্কার নয়।
- নির্বাচিত রেসপন্ডারের পর্দায় অ্যালার্ট, গ্রহণ, প্রকৃত গন্তব্যে নেভিগেশন ও Arrived আপডেট। শুধু rpanel-এর অনুমোদিত অ্যাডমিন Rescued করতে পারবেন; Arrived করলে SOS চালু থাকবে।
- অ্যাডমিন বাস্তব রেসপন্ডার অ্যাকাউন্ট তৈরি করবেন। ফোন/ইউনিট কোড/ভলান্টিয়ার ID দিয়ে আসল পাসওয়ার্ড যাচাই করে লগইন; ডেমো শর্টকাট ও অন্য অ্যাকাউন্টে ইচ্ছেমতো বদলানো সরানো।
- স্থায়ী ইউনিটের সঠিক অবস্থান এবং চলমান রেসপন্ডারের নিজস্ব ফোনের GPS ও অনলাইন/অফলাইন অবস্থা সংরক্ষণ। পুরোনো GPS হলে তা স্পষ্ট দেখানো।
- অ্যালার্টের সময় BulkSMSBD দিয়ে নির্বাচিত যোগাযোগে SMS পাঠানোর ফল আলাদা দেখানো; SMS ব্যর্থ হলেও তৈরি হওয়া SOS হারাবে না।

## ৩. ঝুঁকির এলাকা ও ব্যবহারকারী পরিচালনা
- অ্যাডমিনের যোগ করা/সম্পাদনা করা বাস্তব ঝুঁকির এলাকা সবাই পাবেন; ডেমো ঝুঁকির অঞ্চলকে সত্য তথ্য বলে প্রকাশ নয়। Safe Route এই তথ্য ব্যবহার করবে।
- rpanel-এর ব্যবহারকারী তালিকা, ব্যক্তিগত তথ্য, KYC, ঘটনা, ব্যান/আনব্যান এবং false-alarm চিহ্ন আসল রেকর্ড থেকে চলবে।
- পাসওয়ার্ড/PIN বদলানোর ক্ষেত্রে বাস্তব, যাচাইকৃত প্রক্রিয়া; “SMS পাঠানো হয়েছে” ধরনের নকল বার্তা বাদ।

## ৪. ওয়েবসাইট, Stories, Community ও CRM
- দ্বিভাষিক ওয়েবসাইট লেখা, টিম, মাইলফলক, যোগাযোগ ও ছবি Supabase-এ সংরক্ষণ; অন্য ফোনেও একই প্রকাশিত লেখা দেখা যাবে।
- Stories ও Community একই বাস্তব প্রকাশনা থেকে পড়বে। খসড়া শুধু অ্যাডমিন দেখবেন; Stories-এ প্রতি পাতায় ৪টি পোস্ট ও ভিডিও photocard-এর YouTube thumbnail অপরিবর্তিত থাকবে।
- Contact Us বার্তা ও ভলান্টিয়ার আবেদন আসল ইনবক্সে যাবে; স্ট্যাটাস, নোট, অনুমোদন/প্রত্যাখ্যান সংরক্ষিত থাকবে। ভলান্টিয়ার অনুমোদন বাস্তব অ্যাকাউন্টের সঙ্গে যুক্ত হবে।
- ডেমো পোস্ট/ঘটনা/ব্যক্তিকে বাস্তব হিসেবে আমদানি নয়। বর্তমান ওয়েবসাইটের ডিজাইন ও সাধারণ লেখা রাখা যাবে, কিন্তু বানানো পরিসংখ্যান, ঠিকানা, ফোন, ইতিহাস ও অংশীদারত্বের দাবি সরানো বা যাচাইয়ের জন্য আলাদা রাখা হবে।

## ৫. আসল ক্যামেরা ও ব্যক্তিগত প্রমাণ
- ব্যবহারকারীর অনুমতি নিয়ে প্রকৃত ক্যামেরা/অডিও সম্প্রচার; শুধু সংশ্লিষ্ট ঘটনার অনুমোদিত রেসপন্ডার ও অ্যাডমিন দেখতে পারবেন।
- নির্ভরযোগ্য লাইভ ভিডিওর জন্য পরিচালিত ভিডিও/relay সেবা যুক্ত করা। এর সংযোগ ও প্রয়োজনীয় খরচের অনুমোদন আলাদা করে নেওয়া হবে; অনুমতি না পাওয়া পর্যন্ত নকল ছবিকে Live বলা হবে না।
- ক্যামেরা বন্ধ/অনুমতি নেই/সংযোগ নেই—প্রতিটি অবস্থা সঠিক দেখানো; ক্যামেরা ব্যর্থ হলেও SOS সচল থাকবে।
- আসল ভিডিও থেকে ফ্রেম ক্যাপচার, ব্যক্তিগত ফাইল সংরক্ষণ, ঘটনার সঙ্গে সময়/ট্যাগ/রেসপন্ডার তথ্য যুক্ত করা। গ্যালারি, অনুসন্ধান ও PDF রিপোর্ট আগের মতো থাকবে।
- ঘটনা শেষ হলেও প্রমাণ থাকবে; অনুমতি ছাড়া কোনো ব্যবহারকারী অন্য ঘটনার ছবি বা KYC নথি দেখতে পারবেন না।

## যাচাই ও সীমা
- ব্যবহারকারী → SOS → নির্বাচিত রেসপন্ডার → Arrived → অ্যাডমিনের Rescued এবং প্রমাণ পুনরায় খোলার সম্পূর্ণ প্রবাহ একাধিক সেশনে পরীক্ষা।
- Contact Us জমা → অ্যাডমিনের ইনবক্স, CMS প্রকাশ → অন্য ব্রাউজারে পড়া, রেসপন্ডার তৈরি → লগইন, KYC অনুমোদন ও ব্যান প্রয়োগ যাচাই।
- অনুমতি, PIN, OTP, ডিসপ্যাচ সংখ্যা ও ঘটনার অবস্থার নিয়মের পরীক্ষা; মোবাইল ও ডেস্কটপে দৃশ্যমান ফল যাচাই।
- বাইরের Supabase হওয়ায় স্বয়ংক্রিয়ভাবে আপনার সাইন-ইন সেশন পাওয়া যায় না; অনুমোদিত পরীক্ষার অ্যাকাউন্টের ব্যবস্থা না হলে লগইন-পরবর্তী পরীক্ষাকে অসম্পূর্ণ বলে জানানো হবে। চ্যাটে পাসওয়ার্ড চাওয়া হবে না।
- ইন্টারনেট না থাকলে SOS পৌঁছানোর নিশ্চয়তা নেই। অ্যাপ বন্ধ থাকলে সতর্কতার জন্য push delivery আলাদাভাবে যাচাই করতে হবে; শুধু অ্যাপ খোলা অবস্থার অ্যালার্টকে সবসময় পৌঁছানো বলে দাবি করা হবে না।
- পুলিশ/ভলান্টিয়ার সত্যিই সেবায় যুক্ত না থাকলে সফটওয়্যার উদ্ধারসেবা নিশ্চিত করতে পারে না; জরুরি ৯৯৯ কলের ব্যবস্থা থাকবে।

## Technical implementation
- Replace operational localStorage state with domain-specific TanStack server functions and Query caches; retain local state only for language and unsaved UI inputs. Remove fallback to seeded operational records.
- Add explicit grants, scoped RLS, indexes and validation triggers for responders, volunteer applications, incidents, assignments, location history, events, risk zones, posts, website content, inquiries, KYC submissions and evidence. All schema changes use the migration tool.
- Gate privileged mutations by authenticated `has_role()` checks. Enforce account/KYC eligibility and incident transitions in database functions/triggers, including owner cancellation and admin-only completion. Restrict profile self-updates so users cannot approve their own KYC or remove bans.
- Persist dispatch assignments atomically; only assigned responders may read incident location/video/evidence. Use Realtime with per-effect subscription cleanup and reconnect refetch. Store GPS timestamps and accuracy; calculate distance rather than animate fabricated positions.
- Keep public reads limited to published CMS/posts/risk zones; validate and rate-limit public inquiry/application submissions. Include admin draft reads in the same implementation.
- Use Storage API-created private KYC/evidence buckets and authorized short-lived links; store CMS media separately. Never put credentials, PINs or OTP plaintext into public tables or client bundles.
- Managed WebRTC video requires verified session tokens scoped to incident, camera permissions, stream cleanup and relay connectivity checks. Do not label placeholders or disconnected feeds as live.
- Preserve route-specific head metadata, existing Bengali digit fonts, report rendering and shared desktop/mobile camera presentation. Add tests beside existing Vitest tests and run relevant suites after each phase.