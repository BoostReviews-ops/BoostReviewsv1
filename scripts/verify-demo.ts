import { getDemoDataset } from "@/lib/demo/seed";
import { avgRating, avgResponseHours, competitorInsights, isAnswered, monthlyReviewSeries, periodMetrics, responseRate, reviewsInWindow, tapsInWindow, themeStats } from "@/lib/demo/analytics";
import { computeProfileHealth } from "@/lib/scoring/profileHealth";
import { computeReputationScore } from "@/lib/scoring/reputation";

const d = getDemoDataset();
const reviews = d.reviews;
const last30 = reviewsInWindow(reviews, 30, 0), prev30 = reviewsInWindow(reviews, 60, 30);
const last90 = reviewsInWindow(reviews, 90, 0), prev90 = reviewsInWindow(reviews, 180, 90), prev90w = reviewsInWindow(reviews, 120, 30);
console.log("total generated", reviews.length, "windows", [0,1,2,3,4,5].map(w=>reviewsInWindow(reviews,(w+1)*30,w*30).length));
console.log("last30", last30.length, "prev30", prev30.length, "prior3avg", reviewsInWindow(reviews,120,30).length/3);
const m30 = periodMetrics(reviews, d.dailyTaps, "30d");
console.log("m30", m30);
console.log("rr90", responseRate(last90), "unanswered90", last90.filter(r=>!isAnswered(r)).length, "unanswered30", last30.filter(r=>!isAnswered(r)).length, "rr prev90w", responseRate(prev90w));
console.log("avgRating90", avgRating(last90), "prev", avgRating(prev90w), "respHours", avgResponseHours(last90), avgResponseHours(prev90w));
console.log("taps", [0,1,2,3,4].map(w=>tapsInWindow(d.dailyTaps,(w+1)*30,w*30)), "taps7", tapsInWindow(d.dailyTaps,7,0), tapsInWindow(d.dailyTaps,14,7), "total", d.dailyTaps.reduce((a,x)=>a+x.taps,0));
const monthly = monthlyReviewSeries(reviews, 6);
const you = { id: "you", name: "Royal", category: "", distanceMiles: 0, rating: 4.8, totalReviews: 426, reviewsThisMonth: last30.length, reviewsLastMonth: prev30.length, monthlyHistory: monthly.map(m=>m.count) };
const ci = competitorInsights(you, d.competitors);
const pci = competitorInsights({...you, reviewsThisMonth: prev30.length}, d.competitors.map(c=>({...c, reviewsThisMonth: c.reviewsLastMonth})));
console.log("comp", ci.rankByGrowth, ci.rankByRating, ci.headline, ci.bullets, "prev rank", pci.rankByGrowth);
const health = computeProfileHealth({ hoursComplete: true, phoneAndWebsite: true, servicesListed: true, descriptionPresent: true, categoriesSet: true, responseRate: responseRate(last90), unansweredCount: last90.filter(r=>!isAnswered(r)).length, avgMonthlyReviews90d: last90.length/3, ratingTrend: avgRating(last90)-avgRating(prev90), photosLastUpdatedDaysAgo: 47, lastPostDaysAgo: 12 });
console.log("health", health.score, health.checks.map(c=>`${c.key}:${c.points}/${c.maxPoints}:${c.status}`).join(" "));
const prior3 = reviewsInWindow(reviews,120,30).length/3, prevPrior3 = reviewsInWindow(reviews,150,60).length/3;
const score = computeReputationScore({
  googleRating: 4.8, avgMonthlyReviews90d: last90.length/3, reviewGrowth: last30.length/prior3-1, responseRate: responseRate(last90), avgResponseHours: avgResponseHours(last90), avgRecentRating: avgRating(last90), profileHealth: health.score, nfcTaps30d: tapsInWindow(d.dailyTaps,30,0), competitorGrowthRank: ci.rankByGrowth, ratingRank: ci.rankByRating, trackedCount: ci.total, topCompetitorName: ci.leader?.name, topCompetitorExtraReviews: ci.leaderExtra,
},{
  googleRating: 4.8, avgMonthlyReviews90d: prev90w.length/3, reviewGrowth: prev30.length/prevPrior3-1, responseRate: responseRate(prev90w), avgResponseHours: avgResponseHours(prev90w), avgRecentRating: avgRating(prev90w), profileHealth: 88, nfcTaps30d: tapsInWindow(d.dailyTaps,60,30), competitorGrowthRank: pci.rankByGrowth, ratingRank: pci.rankByRating, trackedCount: pci.total,
});
console.log("SCORE", score.score, "prev", score.previousScore, "change", score.change, score.category.label);
console.log(score.factors.map(f=>`${f.key}:${f.points}/${f.maxPoints}(${f.delta>=0?"+":""}${f.delta})`).join(" "));
console.log("reasons", score.changeReasons);
const themes = themeStats(reviews, 90);
console.log("themes", themes.map(t=>`${t.key}:${t.count}(${Math.round(t.share*100)}%, ${(t.change*100).toFixed(0)}%)`).join(" | "));
console.log("unanswered recent:", last30.filter(r=>!isAnswered(r)).map(r=>`${r.rating}★ ${r.reviewerName} ${r.date.slice(0,10)}: ${r.text.slice(0,50)}`));
console.log("first 3 reviews", reviews.slice(0,3).map(r=>`${r.rating}★ ${r.reviewerName} ${r.date}`));
console.log("dup texts in last 60:", 60 - new Set(reviews.slice(0,60).map(r=>r.text)).size);
console.log("tapEvents", d.tapEvents.length, d.tapEvents.slice(0,2));
