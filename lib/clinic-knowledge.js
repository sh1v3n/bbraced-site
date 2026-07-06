// ─── Clinic Identity ──────────────────────────────────────────────────────────

export const CLINIC_INFO = {
  name: "b.Braced",
  doctor: "Pravin Shetty",
  address: "1st floor, Anand Vihar co.soc, 20th B Rd, corner, Ambedkar Colony, Khar West, Mumbai, Maharashtra 400052",
  phone: "+91 93217 39096",
  whatsapp: "919321739096",
  mapUrl: "https://maps.google.com/?q=b.Braced+Mumbai",
  website: "https://bbraced.in",
  hours: "Mon–Sat, 10am–7pm"
}

export const WHATSAPP_NUMBER = "919321739096"

// ─── Treatment Stages (used for patient onboarding + prompt context) ──────────

export const TREATMENT_STAGES = {
  new_patient: {
    label: "New Patient",
    expectations: "You are considering or just beginning your clear aligner journey. Common questions are about cost, process, duration, and what to expect.",
    tip: "Most patients need 6–18 months depending on complexity."
  },
  early: {
    label: "Early Treatment (Tray 1–10)",
    trays: "1–10",
    expectations: "You have just started treatment. Expect mild soreness for the first 2–3 days of each new tray. Aligners should be worn 20–22 hours per day.",
    tip: "The tightness you feel means the aligners are working."
  },
  mid: {
    label: "Mid Treatment (Tray 11–20)",
    trays: "11–20",
    expectations: "You are making great progress. Attachments (small tooth-coloured bumps) may have been added. Changes in tooth position should be visible.",
    tip: "If you're falling behind on wearing time, try to catch up — skipping hours slows treatment."
  },
  advanced: {
    label: "Advanced Treatment (Tray 21+)",
    trays: "21+",
    expectations: "You are in the final stretch. Refinements (additional trays to perfect the result) may be planned. The end is in sight.",
    tip: "Don't stop early — the last trays are often the most important for final positioning."
  },
  completed: {
    label: "Retainer Phase",
    trays: "completed",
    expectations: "Treatment is complete. You are now wearing retainers to maintain your result. Retainers must be worn as directed — teeth will shift without them.",
    tip: "Most patients wear retainers every night long-term to protect their investment."
  }
}

// ─── Symptom Triage (safety-critical — keep as structured lists for hard injection) ─

export const SYMPTOM_TRIAGE = {
  normal: [
    "mild soreness or pressure in the first 2–3 days of a new tray",
    "slight lisp or speech change",
    "minor tightness when seating a new tray",
    "slight gum redness in the first day or two",
    "aligners feel slightly loose near the end of a tray cycle"
  ],
  monitor: [
    "soreness lasting more than 5 days",
    "persistent pressure on one specific tooth",
    "minor irritation or small ulcer from aligner edge",
    "difficulty fully seating a tray",
    "slight gap between aligner and a single tooth"
  ],
  call_today: [
    "tray cracked or broken",
    "tray lost or misplaced",
    "tray does not fit at all or changed shape",
    "sharp edge cutting gum or cheek",
    "noticeable gap between aligner and multiple teeth",
    "attachment (bump) fell off",
    "pain not relieved by paracetamol after 3 days"
  ],
  emergency: [
    "severe or rapidly worsening pain",
    "visible tooth movement that looks wrong or sudden",
    "trauma to the mouth or jaw",
    "gum bleeding that does not stop",
    "difficulty breathing or swallowing",
    "severe swelling of the face or jaw"
  ]
}

// ─── Suggested Questions (stage-aware, shown in chat UI) ─────────────────────

export const SUGGESTED_QUESTIONS_BY_STAGE = {
  new_patient: [
    "How much do clear aligners cost?",
    "How long does treatment take?",
    "What is the first step to getting started?",
    "Are clear aligners as effective as braces?"
  ],
  early: [
    "My aligners feel tight — is that normal?",
    "How do I clean my aligners?",
    "Can I drink tea or coffee with aligners in?",
    "What do I do if I lose my aligner?"
  ],
  mid: [
    "When will I start seeing results?",
    "What are refinements and will I need them?",
    "My attachment fell off — what should I do?",
    "How do I know if my treatment is on track?"
  ],
  advanced: [
    "How do I know when I am done?",
    "What are retainers and when do I get them?",
    "Can I stop a few trays early if my teeth look good?",
    "What happens at my last appointment?"
  ],
  completed: [
    "How long do I need to wear retainers?",
    "What happens if I stop wearing my retainer?",
    "Can my teeth still shift after treatment?",
    "How do I care for my retainer?"
  ]
}

// ─── Rich Clinical Knowledge (AI reasons from these — not a lookup table) ─────

export const CLINICAL_OVERVIEW = `
WHAT CLEAR ALIGNERS ARE AND HOW THEY WORK

Clear aligners are a series of custom-made, removable plastic trays that gradually shift teeth into their correct positions. Each tray is worn for a set period (typically 1–2 weeks as directed by Dr. Pravin) and moves specific teeth by small, controlled increments — usually 0.25mm per stage. The sequence of trays is precision-planned from a 3D scan of the patient's mouth.

How tooth movement works: Aligners apply gentle, consistent pressure to specific teeth. This pressure stimulates the bone around the tooth root — bone dissolves slightly on the pressure side and rebuilds on the tension side, allowing the tooth to move. This is why consistent wear (20–22 hours/day) is non-negotiable: the bone remodelling cycle is biological and cannot be rushed. Skipping hours does not just slow things down — it can cause the aligner to no longer fit correctly, requiring additional trays.

b.Braced's process:
1. Consultation with Dr. Pravin — examination of teeth, bite, gums; discussion of goals
2. Digital scan (no messy moulds) — a precise 3D model of the patient's teeth is captured
3. Treatment planning — Dr. Pravin designs the movement sequence; the patient sees a simulation of the predicted result
4. Aligner fabrication — custom trays are manufactured
5. First handoff — patient receives their first set of trays, receives full instructions
6. Progress visits every 6–8 weeks — Dr. Pravin checks movement, hands over next trays, makes adjustments
7. Refinements (if needed) — additional scan and new trays to perfect final positions
8. Retainer fitting — custom retainers to hold the result long-term

Clear aligners are highly effective for the cases Dr. Pravin treats. Some very complex orthodontic cases are better suited to fixed braces, which is determined at consultation.
`

export const PROCEDURE_GUIDE = `
DETAILED PROCEDURE EXPLANATIONS

── IPR (Interproximal Reduction) ──
IPR is a simple, painless procedure where Dr. Pravin gently reduces the width of specific teeth by a fraction of a millimetre using a thin disc or strip. It creates the space needed for teeth to move into correct alignment. It does not damage teeth — the amount removed is well within safe enamel limits. Patients feel a brief vibration; there is no injection, no pain, no recovery time. IPR is only done when the treatment plan requires it.

── Attachments ──
Attachments are small, tooth-coloured composite bumps (similar to the material used in white fillings) that Dr. Pravin bonds to specific teeth. They act as handles that give the aligner extra grip and allow more complex movements (rotations, extrusions) that smooth plastic alone cannot achieve. Patients may notice them visually at close range — they are the same colour as the tooth but can be slightly visible. They are completely removed at the end of treatment, leaving no mark on the tooth. When attachments are first placed, the tray may feel tighter and more difficult to seat — this is normal. When an attachment falls off, contact the clinic: it won't cause harm immediately but can affect tooth movement if the tray runs without it.

── Refinements ──
Refinements are additional aligners made after the main series is complete, to fine-tune and perfect the result. They are extremely common — not a sign that something went wrong. As teeth move, the jaw adapts and some teeth may not end up precisely where predicted. A refinement scan captures the current tooth position and a new, short series of trays completes the job. Most patients have 1–2 rounds of refinements. Dr. Pravin plans for this and it is considered part of the full treatment.

── Retainers ──
Once active alignment is complete, retainers maintain the result. Without retainers, teeth will shift — this is an unavoidable biological fact because the bone and periodontal fibres have memory. b.Braced typically provides clear retainers (similar to the aligners) that are worn every night long-term. Some patients also receive fixed (bonded) retainers on the back of the front teeth for added stability. The retainer phase is not optional — it is what protects the patient's investment in treatment. Most patients wear retainers nightly indefinitely; the longer treatment was, the more important this is.
`

export const STAGE_DEEP_DIVE = `
WHAT PATIENTS EXPERIENCE AT EACH STAGE

── New Patient ──
The patient is considering treatment or has just had a consultation. Their main concerns are: cost (is it worth it?), duration (how long will this take?), visibility (will anyone notice?), pain (will it hurt?), and whether it actually works. They need reassurance that clear aligners are a mature, proven technology; that b.Braced is experienced; and that the process starts with a no-pressure consultation. They do not yet have trays, so care/maintenance questions are premature.

── Early Treatment (Trays 1–10) ──
Physical experience: The patient has just received their first aligners. The first 2–3 days of each new tray bring noticeable pressure and soreness — this is normal and means the aligner is working. Speech may have a slight lisp as the tongue adapts. Removing and reinserting the tray can feel awkward at first. Common anxieties: "Is this pain normal?", "My tray doesn't seem to fit right", "I forgot to wear them for a few hours", "Can I eat normally?". At this stage, reinforce compliance (20–22 hours), correct cleaning habits, and normalise the sensations.

── Mid Treatment (Trays 11–20) ──
Physical experience: The patient has established a routine. Attachments are often added in this phase. Visible changes in tooth position should be apparent. Soreness on new tray days is usually less intense than early treatment. Common anxieties: "I'm not sure my teeth are moving", "My attachment fell off", "I've been skipping some hours — am I behind?", "What are refinements?". Reinforce that progress may look slow in the middle phase but is accumulating. If wearing time has been inconsistent, now is the time to correct it — encourage catching up.

── Advanced Treatment (Trays 21+) ──
Physical experience: The patient can see significant improvement. They are in the final stretch. Refinement planning may be discussed. Soreness is usually minimal. Common anxieties: "Can I stop a few trays early?", "How do I know I'm done?", "What if my result isn't perfect?". Strongly discourage stopping early — the last trays handle fine positioning that is often the most visible. The end is near; encourage them to complete every tray.

── Retainer Phase ──
Physical experience: Active treatment is complete. The patient now wears retainers as instructed. The teeth may feel "settled" and stable. Common anxieties: "Do I really have to wear them every night forever?", "I skipped a few nights — are my teeth shifting?", "My retainer feels tight — is that okay?". A tight retainer after missing a few nights means slight shifting has occurred — wearing it consistently will pull the teeth back. If the retainer no longer fits at all, contact the clinic. The importance of long-term retention cannot be overstated.
`

export const SYMPTOM_REASONING = `
UNDERSTANDING SYMPTOMS — CLINICAL REASONING

── Why New Tray Soreness Is Normal ──
When a patient first seats a new aligner, it is designed to be slightly ahead of where the teeth currently are — that gap is what creates the force that moves the teeth. The pressure on the periodontal ligament (the tissue connecting tooth to bone) triggers an inflammatory response that causes soreness. This is not damage — it is the mechanism of tooth movement. The discomfort peaks at 12–48 hours and subsides as the tray "settles" and the tooth begins to move. Paracetamol (not aspirin or ibuprofen if the patient is sensitive) helps. Cold water can soothe gum irritation.

── Why a Slight Lisp Happens ──
Aligners add a thin layer of plastic over the teeth, which changes how the tongue contacts them during speech. The tongue adapts within days to a week. Patients can speed this up by reading aloud, singing, or just talking normally. The lisp resolves completely for virtually all patients.

── Why Aligners Feel Loose Near End of Cycle ──
As teeth move toward their target position, the aligner fits more loosely — it has done its job. This is normal and does not mean the tray is defective. Moving to the next tray on schedule is correct.

── When Pressure on One Tooth Is Concerning ──
Mild pressure across multiple teeth on a new tray day is normal. Persistent, localised pressure on one specific tooth after day 3 may indicate that tooth is not tracking correctly — it is not moving as planned. This should be monitored and reported to Dr. Pravin at the next visit, or sooner if it worsens. It does not automatically mean something is wrong, but Dr. Pravin should be aware.

── Aligner Gaps and Tracking Issues ──
A small gap between the aligner and one tooth near the end of a tray cycle can be normal. A gap affecting multiple teeth, or a gap that appears mid-cycle, suggests the tray is not fitting correctly — possibly due to underwearing. If the patient has been compliant and the tray genuinely doesn't fit, contact the clinic.

── What to Do About a Sharp Edge ──
If an aligner edge is irritating the gum or cheek, the patient can temporarily smooth it with a clean nail file or emery board. If this doesn't resolve the irritation, contact the clinic — the tray may need to be trimmed.
`

export const CARE_DEEP_DIVE = `
COMPREHENSIVE CARE AND MAINTENANCE

── Daily Wearing Routine ──
Aligners must be worn 20–22 hours per day, every day. They should only be removed to eat, drink (anything except plain cold water), and to brush and floss teeth before reinserting. Even drinking tea, coffee, fruit juice, or hot water with aligners in can stain or warp the plastic — these must always be removed first. Patients who consistently wear their aligners less than 20 hours risk slowing treatment, causing tracking failure, or needing extra trays.

── Cleaning Aligners ──
Rinse aligners under lukewarm (never hot) water every time they are removed. Clean once daily using a soft-bristled toothbrush and a small amount of mild, clear dish soap or a dedicated aligner cleaning tablet/solution. Gently scrub all surfaces inside and out. Rinse thoroughly. Never use toothpaste — it contains abrasives that micro-scratch the clear plastic, making aligners cloudy and more visible. Never use mouthwash with colour — it stains. Never soak in hot water — it warps the plastic permanently. A warped tray will not fit correctly and must be replaced.

── Oral Hygiene During Treatment ──
Brush teeth after every meal and before reinserting aligners. Food particles trapped under the aligner create an environment for bacteria and acid, increasing cavity risk. Floss at least once daily. Gum health is important — unhealthy gums can slow tooth movement. If the patient's gums bleed regularly during treatment, they should mention it to Dr. Pravin.

── Eating and Drinking ──
Always remove aligners before eating. Any food can damage aligners (hard foods can crack them; coloured foods stain them). The patient should carry their aligner case at all times to store trays safely during meals. Drinking plain water is fine with aligners in. Chilled still water can even help with soreness.

── Travelling and Away from Home ──
Always travel with the current tray AND the previous tray. If the current tray is lost while travelling, the previous tray holds tooth position until a replacement is arranged. Contact the clinic as soon as possible to arrange a replacement. Do not skip to the next tray — this can cause misalignment.

── Lost Tray Protocol ──
1. Immediately put in the previous tray to hold tooth position.
2. Contact b.Braced as soon as possible: +91 93217 39096
3. The clinic will advise whether to order a replacement or move to the next tray depending on how far through the current tray cycle the patient was.
4. Do not go without a tray — even a few days without any tray can allow teeth to shift back.

── Broken Tray Protocol ──
If the tray is cracked but still seats fully and doesn't have a sharp edge, continue wearing it and contact the clinic. If it no longer seats correctly or has a sharp edge that cannot be smoothed, switch to the previous tray and contact the clinic today. Do not move to the next tray without Dr. Pravin's instruction.

── Advancing Trays ──
Only advance to the next tray when Dr. Pravin has instructed, or on the schedule provided. Never skip trays. The sequence is designed so each tray builds on the previous one — skipping can cause the next tray not to fit, which means reverting to an earlier tray or needing new trays made.

── Sports and Physical Activity ──
Aligners can be worn during most physical activities. For contact sports (cricket, football, martial arts, boxing), remove aligners and wear a mouthguard. Do not wear aligners under a mouthguard as it can crack them. Discuss with Dr. Pravin if you play contact sports regularly.
`

export const APPOINTMENT_GUIDE = `
WHAT HAPPENS AT EACH CLINIC VISIT

── First Consultation ──
Dr. Pravin examines the teeth, gums, and bite. He discusses the patient's concerns and aesthetic goals. He explains whether clear aligners are suitable (most mild-to-moderate cases are). No commitment required at this visit. The patient can ask about cost, duration, and what to expect. If proceeding, a digital scan is scheduled.

── Digital Scan Appointment ──
A handheld intraoral scanner takes a precise 3D model of all teeth. No impressions or messy moulds. The scan takes about 15–20 minutes. This data is used to plan the treatment digitally.

── Treatment Review and Approval ──
Dr. Pravin presents the digital treatment simulation — the patient sees a predicted before/after. Dr. Pravin explains the number of trays, duration, whether IPR or attachments are planned, and the cost. The patient approves the treatment plan before anything is fabricated.

── First Tray Handoff ──
The patient receives their first set of aligners. Dr. Pravin or his team explains how to insert and remove them, care instructions, the wear schedule, and what to expect in the first week. Questions are answered. The patient leaves with a physical instruction sheet or WhatsApp contact for follow-up.

── Progress Checks (every 6–8 weeks) ──
Dr. Pravin checks that teeth are tracking correctly (moving as planned). He examines whether attachments need adjustment. He hands over the next batch of trays. He may perform IPR at this visit if planned. These are relatively quick appointments (15–30 minutes). Patients should raise any concerns — soreness, gaps, unusual sensations — at these visits.

── Refinement Scan ──
After the main series is complete, Dr. Pravin takes a new scan of the current tooth positions. He designs any additional trays needed to perfect the result. A new set of trays is fabricated. This is a standard part of treatment for most patients.

── Retainer Fitting ──
Once treatment is complete and Dr. Pravin is satisfied with the result, retainers are made. A scan or impression is taken. Clear retainers are fabricated and fitted. Dr. Pravin instructs on how long to wear them (typically full-time initially, then nightly long-term). Follow-up retainer checks are scheduled.

── What to Ask at Progress Visits ──
Patients should feel free to ask: "Are my teeth tracking correctly?", "When do I move to the next tray?", "Are refinements likely?", "Is my gum health okay?", "Can I see my current vs. planned position?".
`

export const PRICING_CONTEXT = `
HOW TO HANDLE PRICING QUESTIONS

Clear aligner pricing at b.Braced depends on the complexity and duration of the individual case — it is not a flat fee. The number of trays required, whether refinements are anticipated, and the total treatment duration all affect cost. This is why a consultation and digital scan are required before a quote can be given.

What is typically included: the full series of aligners, all progress visits, and one round of refinements if needed. Retainers are usually provided or quoted separately at end of treatment.

When patients ask about cost, be honest that a specific number cannot be given without a consultation — this is not evasion, it is accuracy. Providing a number before seeing the case would be misleading. Direct them to contact the clinic for a consultation, which is the only way to get an accurate, personalised quote.

If patients ask about payment options or EMIs: direct them to ask the clinic directly, as financing arrangements are discussed at the consultation. Do not speculate about specific plans or amounts.

If patients are comparing clear aligners to traditional braces on cost: clear aligners in the same complexity range are often comparable to braces, with the added benefit of aesthetics and removability. Again, the specific comparison depends on the case.
`

export const ANXIETY_GUIDE = `
ADDRESSING COMMON PATIENT FEARS AND ANXIETIES

── "Will anyone be able to see them?" ──
Clear aligners are designed to be nearly invisible. Up close in bright light, a thin plastic edge may be visible. Most people — colleagues, friends, family — will not notice unless told. If attachments are placed, they are tooth-coloured and visible mainly at very close range. Many patients wear aligners through work presentations, social events, and dates without anyone noticing.

── "Will it hurt?" ──
The honest answer: there is mild discomfort for 1–3 days at the start of each new tray. Most patients describe it as "pressure" or "tightness" rather than pain. It is significantly less uncomfortable than traditional braces, which apply continuous force and have metal components that can irritate the mouth. The soreness reduces as treatment progresses. Paracetamol and cold water help if needed.

── "What if it doesn't work?" ──
Dr. Pravin only takes on cases he is confident treating with aligners. Before fabrication, the patient sees a digital simulation of the predicted result. Aligners are a proven technology used by millions of patients globally. If teeth do not track as planned, refinements correct this — the system is designed to handle variation.

── "I'm worried about losing them" ──
This is a common concern. The practical answer: most patients develop a routine (case always in a pocket or bag) and rarely lose trays. The previous tray is always kept as a backup. If a tray is lost, it is replaceable — it delays treatment by a small amount but does not restart it. The clinic handles lost tray situations regularly.

── "Will my speech be permanently affected?" ──
No. The lisp from aligners is temporary — typically gone within 1–2 weeks as the tongue adapts. There is no long-term speech impact.

── "What about work/professional life?" ──
Many of Dr. Pravin's patients are professionals who chose clear aligners specifically because they are discreet. Aligners can be removed for important meetings or presentations if desired (though this reduces wear time). Most patients simply wear them through work without issue.

── "I'm worried about the commitment" ──
20–22 hours a day sounds demanding but quickly becomes routine — most patients forget they are wearing them. The removability is actually one of the biggest advantages over braces: no food restrictions, easy cleaning, and the ability to take them out for special occasions (within reason).

── "What if my teeth go back after?" ──
This is why retainers exist. With consistent retainer use, the result is permanent. Without retainers, some relapse is almost certain — this is biology, not a flaw in the treatment. Dr. Pravin's team emphasises retainer compliance from the start precisely because retention is what makes the investment last.
`
