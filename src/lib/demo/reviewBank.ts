/**
 * Realistic review text bank for the demo customer (Royal Massage & Spa).
 * Each entry declares its rating, sentiment, and the themes it expresses so
 * that sentiment/theme analytics are computed from the data, not hard-coded.
 */
import type { Sentiment } from "@/lib/types";

export interface BankEntry {
  rating: 1 | 2 | 3 | 4 | 5;
  sentiment: Sentiment;
  themes: string[];
  text: string;
}

export const THEME_LABELS: Record<string, { label: string; polarity: "positive" | "negative" }> = {
  staff: { label: "Staff friendliness", polarity: "positive" },
  quality: { label: "Massage quality", polarity: "positive" },
  clean: { label: "Cleanliness", polarity: "positive" },
  atmosphere: { label: "Atmosphere", polarity: "positive" },
  value: { label: "Value for money", polarity: "positive" },
  booking_easy: { label: "Easy booking", polarity: "positive" },
  wait: { label: "Wait times", polarity: "negative" },
  availability: { label: "Booking availability", polarity: "negative" },
  parking: { label: "Parking", polarity: "negative" },
  pricing: { label: "Pricing", polarity: "negative" },
  front_desk: { label: "Front desk experience", polarity: "negative" },
  inconsistent: { label: "Inconsistent service", polarity: "negative" },
};

export const THERAPISTS = ["Maria", "Jenna", "Luis", "Priya", "Daniel", "Sofia", "Andre", "Kim"];

export const POSITIVE_5: BankEntry[] = [
  { rating: 5, sentiment: "positive", themes: ["staff", "quality"], text: "Absolutely wonderful experience. {T} listened to exactly what I needed and worked on my shoulders until the knots were gone. The whole team is so welcoming." },
  { rating: 5, sentiment: "positive", themes: ["staff"], text: "The front desk staff greeted me by name on my second visit. Small things like that make a huge difference. Already booked my next appointment." },
  { rating: 5, sentiment: "positive", themes: ["quality", "atmosphere"], text: "Best deep tissue massage I've had in years. The room was quiet, the lighting was soft, and I walked out feeling like a new person." },
  { rating: 5, sentiment: "positive", themes: ["clean", "atmosphere"], text: "Spotless facility. Everything from the lobby to the treatment rooms was immaculate and smelled amazing. Very relaxing atmosphere." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "I've been dealing with lower back pain for months and {T} found the exact spot that was causing it. Two sessions in and I'm already feeling better." },
  { rating: 5, sentiment: "positive", themes: ["staff", "atmosphere"], text: "Everyone here is kind and professional. They never rush you, and the calm music and warm towels make it feel like a real retreat." },
  { rating: 5, sentiment: "positive", themes: ["quality", "value"], text: "Worth every penny. The 90-minute hot stone massage was pure bliss and the pricing is very fair for the quality you get." },
  { rating: 5, sentiment: "positive", themes: ["staff", "quality"], text: "{T} is incredible. Great pressure, checked in with me throughout, and gave me stretches to do at home. Highly recommend." },
  { rating: 5, sentiment: "positive", themes: ["booking_easy", "staff"], text: "Booking online was easy and they confirmed by text right away. Friendly staff, on time, and a fantastic Swedish massage." },
  { rating: 5, sentiment: "positive", themes: ["atmosphere"], text: "From the moment you walk in it's peaceful. The waiting lounge with the tea and the dim lighting sets the tone perfectly." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "Prenatal massage was exactly what I needed at 32 weeks. Comfortable positioning, gentle but effective. Thank you!" },
  { rating: 5, sentiment: "positive", themes: ["staff", "clean"], text: "Very clean, very professional. The therapist explained everything before starting and the linens were fresh and warm." },
  { rating: 5, sentiment: "positive", themes: ["quality", "staff"], text: "Couples massage for our anniversary and it was perfect. Both therapists were attentive and the pressure was spot on for each of us." },
  { rating: 5, sentiment: "positive", themes: ["value"], text: "Got the membership and it's honestly the best decision I've made for my health this year. Great value for monthly massages." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "Sports massage before my half marathon. {T} knew exactly how to work my calves and hips. Ran a personal best." },
  { rating: 5, sentiment: "positive", themes: ["staff", "atmosphere"], text: "Such a warm, welcoming place. I came in stressed from work and left completely relaxed. The staff are genuinely caring people." },
  { rating: 5, sentiment: "positive", themes: ["clean"], text: "I'm picky about cleanliness and this place passes with flying colors. Sanitized rooms, fresh sheets, clean restrooms." },
  { rating: 5, sentiment: "positive", themes: ["quality", "atmosphere"], text: "The aromatherapy add-on was lovely. Deeply relaxing hour and the heated table was a nice touch on a cold day." },
  { rating: 5, sentiment: "positive", themes: ["staff"], text: "My mom has mobility issues and the staff went above and beyond to make her comfortable. So grateful for their patience." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "Tension headaches gone after one session focused on my neck and scalp. {T} is a magician." },
  { rating: 5, sentiment: "positive", themes: ["booking_easy"], text: "Tapped the card at the front desk to leave this review — super easy. Great massage, great people, will be back." },
  { rating: 5, sentiment: "positive", themes: ["staff", "quality"], text: "Five stars all around. Professional, friendly, and the deep tissue work on my shoulders was exactly what I asked for." },
  { rating: 5, sentiment: "positive", themes: ["atmosphere", "clean"], text: "Beautiful, calm space. Everything is thoughtfully done — the robes, the tea, the quiet rooms. My new go-to spa." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "The reflexology session was amazing. I didn't realize how much tension I was holding in my feet." },
  { rating: 5, sentiment: "positive", themes: ["staff"], text: "Kind, attentive, and never pushy about add-ons. You can tell they care about their clients." },
  { rating: 5, sentiment: "positive", themes: ["quality", "value"], text: "Better than the chain spa I used to go to, and about the same price. The therapists here are clearly more experienced." },
  { rating: 5, sentiment: "positive", themes: ["staff", "quality"], text: "{T} asked great questions about my injury history and adjusted the whole session around it. That's the kind of care you want." },
  { rating: 5, sentiment: "positive", themes: ["atmosphere"], text: "Quiet, dim, warm, and calm. Exactly what a spa should feel like. I fell asleep halfway through." },
  { rating: 5, sentiment: "positive", themes: ["clean", "staff"], text: "Clean, punctual, and friendly. Appointment started right on time and the room was ready and warm." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "Lymphatic drainage massage post-surgery — gentle, knowledgeable, and my swelling went down noticeably." },
  { rating: 5, sentiment: "positive", themes: ["staff", "value"], text: "Gift card for my wife and she hasn't stopped talking about it. Staff were lovely on the phone and in person." },
  { rating: 5, sentiment: "positive", themes: ["quality", "staff"], text: "I've tried a lot of places. This is the one. Consistent quality every single visit." },
  { rating: 5, sentiment: "positive", themes: ["atmosphere", "quality"], text: "The hot stone massage on a rainy afternoon was heavenly. Perfect pressure and a wonderfully peaceful room." },
  { rating: 5, sentiment: "positive", themes: ["staff"], text: "The receptionist helped me pick the right service for my dad's 70th birthday. He loved it. Thank you!" },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "Finally found a therapist who does real deep tissue work. {T} doesn't hold back and my back thanks her." },
  { rating: 5, sentiment: "positive", themes: ["clean", "atmosphere"], text: "Pristine and peaceful. Fresh flowers in the lobby, clean rooms, and the whole place feels well cared for." },
  { rating: 5, sentiment: "positive", themes: ["staff", "booking_easy"], text: "They squeezed me in same-day after I tweaked my neck. Friendly, fast, and the massage fixed it." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "Deep tissue with cupping was intense in the best way. Range of motion in my shoulder is back." },
  { rating: 5, sentiment: "positive", themes: ["value", "atmosphere"], text: "Monthly membership is a steal for the quality. Beautiful space and I never feel rushed." },
  { rating: 5, sentiment: "positive", themes: ["staff", "quality", "clean"], text: "Professional, clean, friendly, skilled. Not much else to say — this is how a spa should run." },
];

/** Short, casual reviews — most real Google reviews are one or two lines. */
export const POSITIVE_5_SHORT: BankEntry[] = [
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "Best massage in Austin. Period." },
  { rating: 5, sentiment: "positive", themes: ["staff"], text: "Super friendly staff and a great experience from start to finish." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "{T} worked out a knot I've had for months. Incredible." },
  { rating: 5, sentiment: "positive", themes: ["atmosphere"], text: "So relaxing. Exactly what I needed after a long week." },
  { rating: 5, sentiment: "positive", themes: ["clean"], text: "Clean, quiet, professional. Highly recommend." },
  { rating: 5, sentiment: "positive", themes: ["quality", "staff"], text: "Amazing deep tissue massage and a very welcoming team." },
  { rating: 5, sentiment: "positive", themes: ["value"], text: "Great value for a 90-minute session. Will be back." },
  { rating: 5, sentiment: "positive", themes: ["staff"], text: "Everyone was kind and attentive. Five stars." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "Hot stone massage was perfect. Fell asleep twice." },
  { rating: 5, sentiment: "positive", themes: ["atmosphere", "quality"], text: "Beautiful space and a wonderful therapist. 10/10." },
  { rating: 5, sentiment: "positive", themes: ["booking_easy"], text: "Easy to book, on time, great massage. Simple as that." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "My neck finally feels normal again. Thank you {T}!" },
  { rating: 5, sentiment: "positive", themes: ["staff", "clean"], text: "Friendly, clean, and professional. My go-to spa now." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "Excellent prenatal massage. Gentle and so helpful." },
  { rating: 5, sentiment: "positive", themes: ["atmosphere"], text: "Peaceful, calm, and beautifully kept. Love this place." },
  { rating: 5, sentiment: "positive", themes: ["quality", "value"], text: "Better than the chains and worth every dollar." },
  { rating: 5, sentiment: "positive", themes: ["staff"], text: "The team here genuinely cares. You can feel it." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "Sports massage before my race — legs felt brand new." },
  { rating: 5, sentiment: "positive", themes: ["quality", "atmosphere"], text: "Relaxing, skilled, and never rushed. Perfect hour." },
  { rating: 5, sentiment: "positive", themes: ["staff"], text: "Booked for my wife's birthday. She loved it. Staff were great." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "Deep tissue done right. {T} is the best." },
  { rating: 5, sentiment: "positive", themes: ["clean", "atmosphere"], text: "Immaculate rooms and a calming vibe throughout." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "Couples massage was fantastic. Both therapists were excellent." },
  { rating: 5, sentiment: "positive", themes: ["staff", "quality"], text: "Warm welcome, great massage, easy checkout. Perfect." },
  { rating: 5, sentiment: "positive", themes: ["value"], text: "The membership pays for itself. Highly recommend." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "Shoulder pain gone after two visits. Amazing work." },
  { rating: 5, sentiment: "positive", themes: ["atmosphere"], text: "Such a calm, lovely space. Left feeling completely reset." },
  { rating: 5, sentiment: "positive", themes: ["staff"], text: "Professional and friendly every single time." },
  { rating: 5, sentiment: "positive", themes: ["quality"], text: "Reflexology was incredible. Didn't want it to end." },
  { rating: 5, sentiment: "positive", themes: ["quality", "staff"], text: "Skilled hands and kind people. What more can you ask for?" },
];

export const POSITIVE_4: BankEntry[] = [
  { rating: 4, sentiment: "positive", themes: ["quality", "wait"], text: "Great massage as always. Only knock is I waited about 15 minutes past my appointment time before being taken back." },
  { rating: 4, sentiment: "positive", themes: ["quality", "parking"], text: "Excellent deep tissue work. Parking in the lot was tough on a Saturday, so give yourself a few extra minutes." },
  { rating: 4, sentiment: "positive", themes: ["staff", "availability"], text: "Lovely staff and a really good massage. Wish it were easier to get a weekend slot — had to book two weeks out." },
  { rating: 4, sentiment: "positive", themes: ["atmosphere", "wait"], text: "Beautiful, calming space. The wait in the lobby was a bit long but the massage itself was worth it." },
  { rating: 4, sentiment: "positive", themes: ["quality", "pricing"], text: "Very good therapist and a clean room. A little on the pricier side compared to nearby places, but the quality is there." },
  { rating: 4, sentiment: "positive", themes: ["quality"], text: "Solid Swedish massage. Pressure could have been a touch firmer but overall very relaxing." },
  { rating: 4, sentiment: "positive", themes: ["staff", "clean"], text: "Friendly team and a spotless facility. Knocking one star because the room was a bit chilly at the start." },
  { rating: 4, sentiment: "positive", themes: ["quality", "wait"], text: "The massage was fantastic. Check-in took longer than it should have — seemed like only one person at the desk." },
  { rating: 4, sentiment: "positive", themes: ["value", "availability"], text: "Good value with the package deal. It's popular though, so book early — evening slots fill up fast." },
  { rating: 4, sentiment: "positive", themes: ["atmosphere", "parking"], text: "Peaceful spot with a great vibe. Street parking only when the lot is full, which happened both times I went." },
  { rating: 4, sentiment: "positive", themes: ["quality", "staff"], text: "Really enjoyed my session with {T}. Would have been five stars if the music hadn't cut out halfway through." },
  { rating: 4, sentiment: "positive", themes: ["quality", "wait"], text: "Top-notch therapist. Started about ten minutes late, which cut into my hour a little. Otherwise excellent." },
  { rating: 4, sentiment: "positive", themes: ["clean", "atmosphere"], text: "Clean and cozy. A nice little escape from the day. Would love if they offered later evening appointments." },
  { rating: 4, sentiment: "positive", themes: ["quality"], text: "Great hot stone massage. The stones could have been a bit warmer, but the technique was excellent." },
];

export const MIXED_3: BankEntry[] = [
  { rating: 3, sentiment: "neutral", themes: ["quality", "wait"], text: "The massage itself was good, but I waited 25 minutes past my scheduled time with no explanation. Frustrating when you plan your day around it." },
  { rating: 3, sentiment: "neutral", themes: ["availability"], text: "Decent experience. Hard to get an appointment when you actually want one — the earliest available was almost three weeks out." },
  { rating: 3, sentiment: "neutral", themes: ["inconsistent"], text: "My first visit was amazing, the second was just okay. Different therapist, very different pressure. Wish it were more consistent." },
  { rating: 3, sentiment: "neutral", themes: ["wait", "front_desk"], text: "Massage was fine. The front desk seemed overwhelmed and I stood there for a while before anyone checked me in." },
  { rating: 3, sentiment: "neutral", themes: ["pricing", "quality"], text: "It was relaxing but I'm not sure it was worth the price. I've had better for less elsewhere." },
  { rating: 3, sentiment: "neutral", themes: ["parking", "atmosphere"], text: "Nice interior, but the parking situation stressed me out before I even got inside. Kind of defeats the purpose of a spa visit." },
  { rating: 3, sentiment: "neutral", themes: ["wait"], text: "Average. Long wait in the lobby and the session felt a little rushed as a result." },
  { rating: 3, sentiment: "neutral", themes: ["availability", "staff"], text: "Staff were nice but they double-booked my slot and I had to reschedule. They did offer a discount, which I appreciated." },
];

export const NEGATIVE_12: BankEntry[] = [
  { rating: 2, sentiment: "negative", themes: ["wait"], text: "Waited over 30 minutes for a 60-minute appointment and only got 45 minutes on the table. Not okay for what they charge." },
  { rating: 2, sentiment: "negative", themes: ["front_desk", "availability"], text: "Called three times to book and never got a call back. Finally got in and the massage was okay, but the communication needs work." },
  { rating: 2, sentiment: "negative", themes: ["inconsistent", "quality"], text: "The therapist I got this time barely applied any pressure even after I asked twice. Very different from my previous visit." },
  { rating: 1, sentiment: "negative", themes: ["front_desk", "pricing"], text: "Charged a cancellation fee when I cancelled with more than 24 hours notice. Front desk was not helpful about it." },
  { rating: 1, sentiment: "negative", themes: ["wait", "front_desk"], text: "Arrived on time, sat in the lobby for 35 minutes, and nobody told me what was going on. Ended up leaving." },
  { rating: 2, sentiment: "negative", themes: ["parking", "wait"], text: "Couldn't find parking, arrived 5 minutes late, and then still had to wait 20 more minutes. Session was cut short." },
  { rating: 1, sentiment: "negative", themes: ["availability"], text: "Booked online, got a confirmation, then received a text the morning of saying the slot wasn't actually available. Very disappointing." },
  { rating: 2, sentiment: "negative", themes: ["pricing"], text: "Prices went up again. The massage is good but it's getting hard to justify at these rates." },
];

export const RESPONSE_TEMPLATES_POSITIVE = [
  "Thank you so much, {N}! We're thrilled you enjoyed your session. {T} will be so happy to hear this. We look forward to seeing you again soon.",
  "{N}, thank you for the kind words! Making our guests feel cared for is what we're all about. See you at your next visit!",
  "We really appreciate you taking the time to share this, {N}. It means a lot to our whole team. Welcome to the Royal family!",
  "Thank you, {N}! We're so glad the session helped. Don't hesitate to let us know how we can make your next visit even better.",
  "This made our day, {N}. Thank you for trusting us with your care — we can't wait to welcome you back.",
  "Thank you for the wonderful review, {N}! We'll pass your compliments along to the team. See you soon!",
];

export const RESPONSE_TEMPLATES_MIXED = [
  "Thank you for the honest feedback, {N}. You're right that the wait wasn't acceptable, and we've since added a second team member at the front desk during peak hours. We'd love the chance to make it right — please reach out to us directly.",
  "{N}, thanks for sharing this. We've been working on opening up more weekend and evening availability, and we're adding a waitlist so you'll be first to know when slots open. We hope to see you again.",
  "We appreciate you letting us know, {N}. Consistency matters to us and we've shared your notes with our team. Please ask for your preferred therapist when booking — we'll make sure you get the pressure you want.",
];

export const RESPONSE_TEMPLATES_NEGATIVE = [
  "{N}, we're truly sorry about your experience. This isn't the standard we hold ourselves to. Our manager would like to speak with you personally — please call us so we can make this right.",
  "We sincerely apologize, {N}. A delay like that is not acceptable, and we've made scheduling changes so it doesn't happen again. Please reach out — your next session is on us.",
  "Thank you for bringing this to our attention, {N}. We've reviewed what happened and addressed it with our team. We'd welcome the chance to earn back your trust.",
];

export const FIRST_NAMES = [
  "Jessica", "Michael", "Amanda", "David", "Sarah", "Chris", "Emily", "Brian", "Ashley", "Kevin",
  "Nicole", "Jason", "Lauren", "Ryan", "Megan", "Josh", "Rachel", "Tyler", "Stephanie", "Andrew",
  "Melissa", "Matt", "Danielle", "Justin", "Heather", "Brandon", "Kayla", "Eric", "Samantha", "Adam",
  "Brittany", "Nathan", "Courtney", "Zach", "Erin", "Derek", "Alyssa", "Sean", "Vanessa", "Marcus",
  "Priya", "Carlos", "Mei", "Omar", "Elena", "Jamal", "Hannah", "Diego", "Aisha", "Tom",
  "Grace", "Victor", "Olivia", "Ben", "Natalie", "Luis", "Chloe", "Isaac", "Sophia", "Ravi",
  "Renee", "Patrick", "Tanya", "Greg", "Monica", "Aaron", "Dana", "Phil", "Kristen", "Leo",
];

export const LAST_INITIALS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "V", "W", "Y"];
