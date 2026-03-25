CREATE TABLE `notes` (
	`file_path` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`tags` text DEFAULT '[]',
	`frontmatter` text DEFAULT '{}',
	`content` text NOT NULL,
	`modified_at` text NOT NULL,
	`indexed_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`due` text,
	`title` text NOT NULL,
	`description` text,
	`priority` text DEFAULT 'low' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`recurrence` text
);
