CREATE TABLE `club_members` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`x` real DEFAULT 0 NOT NULL,
	`z` real DEFAULT 45 NOT NULL,
	`sitting` integer DEFAULT 0 NOT NULL,
	`cup` text,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `member_token` ON `club_members` (`token_hash`);--> statement-breakpoint
CREATE INDEX `members_updated` ON `club_members` (`updated`);--> statement-breakpoint
CREATE TABLE `club_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member` text NOT NULL,
	`name` text NOT NULL,
	`body` text NOT NULL,
	`x` real NOT NULL,
	`z` real NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `messages_time` ON `club_messages` (`created`);--> statement-breakpoint
CREATE TABLE `club_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`member` text NOT NULL,
	`drink` text NOT NULL,
	`status` text NOT NULL,
	`ready` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `club_rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`host` text NOT NULL,
	`court` integer NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`state` text,
	`updated` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `club_seats` (
	`id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`seat` integer NOT NULL,
	`member` text NOT NULL,
	`input` text DEFAULT '{}' NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_room_seat` ON `club_seats` (`room`,`seat`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_member_seat` ON `club_seats` (`member`);