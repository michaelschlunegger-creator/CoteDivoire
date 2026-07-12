CREATE TABLE `admin_audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`admin_email` text NOT NULL,
	`action` text NOT NULL,
	`target_email` text DEFAULT '' NOT NULL,
	`target_reference` text DEFAULT '' NOT NULL,
	`target_label` text DEFAULT 'Participant' NOT NULL,
	`detail` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `participant_access` (
	`user_email` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`session_version` integer DEFAULT 1 NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`suspended_at` text,
	`soft_deleted_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
