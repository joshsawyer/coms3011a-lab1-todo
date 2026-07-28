CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`due_date` integer NOT NULL,
	`topic` text NOT NULL,
	`status` text DEFAULT 'todo' NOT NULL CHECK(`status` IN ('todo', 'in_progress', 'complete')),
	`archived_at` integer,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL
);
