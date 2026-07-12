import { getDb } from "@/db";
import { feedback } from "@/db/schema";
import { notifyEventAdmins } from "@/lib/admin-notifications";
import { getEventUser } from "@/lib/event-auth";

const ratingFields = [
  "registrationRating", "communicationsRating", "programmeRating", "technicalRelevanceRating", "speakerRating",
  "programmeBalanceRating", "networkingRating", "exhibitionRating", "venueRating", "hospitalityRating",
  "travelInfoRating", "digitalRating", "conciergeRating", "returnIntentRating",
] as const;

function surveyRating(body: Record<string, string | number>, name: string, allowNa = true) {
  const raw = body[name];
  if (raw === undefined || raw === "") return null;
  const value = Number(raw);
  const minimum = allowNa ? 0 : 1;
  return Number.isInteger(value) && value >= minimum && value <= 5 ? value : null;
}

export async function POST(request: Request) {
  try {
    const user = await getEventUser();
    if (!user) return Response.json({ error: "Please sign in before submitting the participant survey." }, { status: 401 });
    const body = await request.json() as Record<string, string | number>;
    const ratings = Object.fromEntries(ratingFields.map(name => [name, surveyRating(body, name)])) as Record<(typeof ratingFields)[number], number | null>;
    const overall = surveyRating(body, "rating", false);
    const recommendScore = Number(body.recommendScore);
    const mostValuable = String(body.mostValuable || "").trim();
    const improvements = String(body.improvements || "").trim();
    const futureTopics = String(body.futureTopics || "").trim();
    const message = String(body.message || "").trim();
    if (Object.values(ratings).some(value => value === null) || overall === null || !Number.isInteger(recommendScore) || recommendScore < 0 || recommendScore > 10 || [mostValuable, improvements, futureTopics, message].some(value => value.length < 3)) {
      return Response.json({ error: "Please complete all 20 numbered survey questions. Select N/A where a rating does not apply." }, { status: 400 });
    }
    const allowedDays = new Set(["Before the event", "Day 1", "Day 2", "Day 3", "Overall event"]);
    const eventDay = allowedDays.has(String(body.eventDay)) ? String(body.eventDay) : "Overall event";
    const values = {
      userEmail: user.email,
      name: String(body.name || user.displayName).trim(),
      email: user.email,
      category: "Comprehensive participant survey",
      rating: overall,
      message,
      eventDay,
      registrationRating: ratings.registrationRating!,
      communicationsRating: ratings.communicationsRating!,
      programmeRating: ratings.programmeRating!,
      technicalRelevanceRating: ratings.technicalRelevanceRating!,
      speakerRating: ratings.speakerRating!,
      programmeBalanceRating: ratings.programmeBalanceRating!,
      networkingRating: ratings.networkingRating!,
      exhibitionRating: ratings.exhibitionRating!,
      venueRating: ratings.venueRating!,
      hospitalityRating: ratings.hospitalityRating!,
      travelInfoRating: ratings.travelInfoRating!,
      digitalRating: ratings.digitalRating!,
      conciergeRating: ratings.conciergeRating!,
      returnIntentRating: ratings.returnIntentRating!,
      recommendScore,
      mostValuable,
      improvements,
      futureTopics,
      contactPermission: body.contactPermission === "yes",
    };
    const [row] = await getDb().insert(feedback).values(values).returning();
    await notifyEventAdmins({
      kind: "Private participant survey",
      title: `New 20-question survey · ${eventDay}`,
      detail: message,
      contactEmail: user.email,
      fields: {
        Participant: user.email, Context: eventDay, "Overall rating": `${overall}/5`, Registration: `${values.registrationRating}/5`,
        Communications: `${values.communicationsRating}/5`, Programme: `${values.programmeRating}/5`, "Technical relevance": `${values.technicalRelevanceRating}/5`,
        Speakers: `${values.speakerRating}/5`, Networking: `${values.networkingRating}/5`, Venue: `${values.venueRating}/5`, Digital: `${values.digitalRating}/5`,
        Recommendation: `${recommendScore}/10`, "Most valuable": mostValuable, Improvements: improvements, "Future topics": futureTopics, Message: message,
      },
    });
    return Response.json({ feedback: row }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to submit the participant survey." }, { status: 500 });
  }
}
