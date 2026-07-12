import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const registrations = sqliteTable("registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email"),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  jobTitle: text("job_title").notNull(),
  organization: text("organization").notNull(),
  country: text("country").notNull(),
  phone: text("phone").notNull().default(""),
  participationType: text("participation_type").notNull(),
  interests: text("interests").notNull().default(""),
  dietary: text("dietary").notNull().default(""),
  accessibility: text("accessibility").notNull().default(""),
  privacyConsent: integer("privacy_consent", { mode: "boolean" }).notNull().default(false),
  communicationConsent: integer("communication_consent", { mode: "boolean" }).notNull().default(false),
  status: text("status").notNull().default("received"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const feedback = sqliteTable("feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email"),
  name: text("name").notNull().default(""),
  email: text("email").notNull().default(""),
  category: text("category").notNull(),
  rating: integer("rating").notNull(),
  message: text("message").notNull(),
  eventDay: text("event_day").notNull().default("General"),
  registrationRating: integer("registration_rating").notNull().default(0),
  communicationsRating: integer("communications_rating").notNull().default(0),
  programmeRating: integer("programme_rating").notNull().default(0),
  technicalRelevanceRating: integer("technical_relevance_rating").notNull().default(0),
  speakerRating: integer("speaker_rating").notNull().default(0),
  programmeBalanceRating: integer("programme_balance_rating").notNull().default(0),
  networkingRating: integer("networking_rating").notNull().default(0),
  venueRating: integer("venue_rating").notNull().default(0),
  exhibitionRating: integer("exhibition_rating").notNull().default(0),
  hospitalityRating: integer("hospitality_rating").notNull().default(0),
  travelInfoRating: integer("travel_info_rating").notNull().default(0),
  digitalRating: integer("digital_rating").notNull().default(0),
  conciergeRating: integer("concierge_rating").notNull().default(0),
  returnIntentRating: integer("return_intent_rating").notNull().default(0),
  recommendScore: integer("recommend_score").notNull().default(0),
  mostValuable: text("most_valuable").notNull().default(""),
  improvements: text("improvements").notNull().default(""),
  futureTopics: text("future_topics").notNull().default(""),
  contactPermission: integer("contact_permission", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const resources = sqliteTable("resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull(),
  fileKey: text("file_key").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull().default("application/octet-stream"),
  sizeBytes: integer("size_bytes").notNull().default(0),
  visibility: text("visibility").notNull().default("public"),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const announcements = sqliteTable("announcements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  level: text("level").notNull().default("update"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminNotifications = sqliteTable("admin_notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  contactEmail: text("contact_email").notNull().default(""),
  payload: text("payload").notNull().default("{}"),
  emailStatus: text("email_status").notNull().default("not_configured"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const dailyRecaps = sqliteTable("daily_recaps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dayNumber: integer("day_number").notNull(),
  eventDate: text("event_date").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  status: text("status").notNull().default("draft"),
  createdBy: text("created_by").notNull(),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const recapPhotos = sqliteTable("recap_photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  recapId: integer("recap_id").notNull().references(() => dailyRecaps.id, { onDelete: "cascade" }),
  fileKey: text("file_key").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull().default(0),
  caption: text("caption").notNull().default(""),
  credit: text("credit").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const activityReservations = sqliteTable("activity_reservations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email").notNull(),
  activityId: text("activity_id").notNull(),
  status: text("status").notNull().default("confirmed"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const eventActivities = sqliteTable("event_activities", {
  id: text("id").primaryKey(),
  day: integer("day").notNull(),
  eventDate: text("event_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  location: text("location").notNull().default("To be confirmed"),
  description: text("description").notNull().default(""),
  capacity: integer("capacity").notNull().default(0),
  isOpen: integer("is_open", { mode: "boolean" }).notNull().default(false),
  isPlaceholder: integer("is_placeholder", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const participantProfiles = sqliteTable("participant_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email").notNull().unique(),
  displayName: text("display_name").notNull().default(""),
  organization: text("organization").notNull().default(""),
  jobTitle: text("job_title").notNull().default(""),
  country: text("country").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const agendaSelections = sqliteTable("agenda_selections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email").notNull(),
  sessionId: text("session_id").notNull(),
  status: text("status").notNull().default("selected"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const privateReminders = sqliteTable("private_reminders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email").notNull(),
  dayNumber: integer("day_number").notNull(),
  reminderTime: text("reminder_time").notNull(),
  note: text("note").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const participantAccess = sqliteTable("participant_access", {
  userEmail: text("user_email").primaryKey(),
  status: text("status").notNull().default("active"),
  sessionVersion: integer("session_version").notNull().default(1),
  note: text("note").notNull().default(""),
  suspendedAt: text("suspended_at"),
  softDeletedAt: text("soft_deleted_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminAuditLogs = sqliteTable("admin_audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  adminEmail: text("admin_email").notNull(),
  action: text("action").notNull(),
  targetEmail: text("target_email").notNull().default(""),
  targetReference: text("target_reference").notNull().default(""),
  targetLabel: text("target_label").notNull().default("Participant"),
  detail: text("detail").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
