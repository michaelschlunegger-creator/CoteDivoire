CREATE TABLE `activity_reservations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text NOT NULL,
	`activity_id` text NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`detail` text NOT NULL,
	`contact_email` text DEFAULT '' NOT NULL,
	`payload` text DEFAULT '{}' NOT NULL,
	`email_status` text DEFAULT 'not_configured' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `agenda_selections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text NOT NULL,
	`session_id` text NOT NULL,
	`status` text DEFAULT 'selected' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`level` text DEFAULT 'update' NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_recaps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_number` integer NOT NULL,
	`event_date` text NOT NULL,
	`title` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by` text NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`day` integer NOT NULL,
	`event_date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`location` text DEFAULT 'To be confirmed' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`capacity` integer DEFAULT 0 NOT NULL,
	`is_open` integer DEFAULT false NOT NULL,
	`is_placeholder` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text,
	`name` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`category` text NOT NULL,
	`rating` integer NOT NULL,
	`message` text NOT NULL,
	`event_day` text DEFAULT 'General' NOT NULL,
	`registration_rating` integer DEFAULT 0 NOT NULL,
	`programme_rating` integer DEFAULT 0 NOT NULL,
	`technical_relevance_rating` integer DEFAULT 0 NOT NULL,
	`speaker_rating` integer DEFAULT 0 NOT NULL,
	`networking_rating` integer DEFAULT 0 NOT NULL,
	`venue_rating` integer DEFAULT 0 NOT NULL,
	`exhibition_rating` integer DEFAULT 0 NOT NULL,
	`digital_rating` integer DEFAULT 0 NOT NULL,
	`recommend_score` integer DEFAULT 0 NOT NULL,
	`most_valuable` text DEFAULT '' NOT NULL,
	`improvements` text DEFAULT '' NOT NULL,
	`future_topics` text DEFAULT '' NOT NULL,
	`contact_permission` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `participant_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text NOT NULL,
	`display_name` text DEFAULT '' NOT NULL,
	`organization` text DEFAULT '' NOT NULL,
	`job_title` text DEFAULT '' NOT NULL,
	`country` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participant_profiles_user_email_unique` ON `participant_profiles` (`user_email`);--> statement-breakpoint
CREATE TABLE `private_reminders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text NOT NULL,
	`day_number` integer NOT NULL,
	`reminder_time` text NOT NULL,
	`note` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recap_photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`recap_id` integer NOT NULL,
	`file_key` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer DEFAULT 0 NOT NULL,
	`caption` text DEFAULT '' NOT NULL,
	`credit` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`recap_id`) REFERENCES `daily_recaps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`job_title` text NOT NULL,
	`organization` text NOT NULL,
	`country` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`participation_type` text NOT NULL,
	`interests` text DEFAULT '' NOT NULL,
	`dietary` text DEFAULT '' NOT NULL,
	`accessibility` text DEFAULT '' NOT NULL,
	`privacy_consent` integer DEFAULT false NOT NULL,
	`communication_consent` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`category` text NOT NULL,
	`file_key` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text DEFAULT 'application/octet-stream' NOT NULL,
	`size_bytes` integer DEFAULT 0 NOT NULL,
	`visibility` text DEFAULT 'public' NOT NULL,
	`uploaded_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
