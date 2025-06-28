PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_web_short_url` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`videoId` text(255) NOT NULL,
	`shortVideoId` text(255) NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`videoId`) REFERENCES `web_video`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_web_short_url`("id", "videoId", "shortVideoId", "createdAt", "updatedAt") SELECT "id", "videoId", "shortVideoId", "createdAt", "updatedAt" FROM `web_short_url`;--> statement-breakpoint
DROP TABLE `web_short_url`;--> statement-breakpoint
ALTER TABLE `__new_web_short_url` RENAME TO `web_short_url`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `web_short_url_videoId_unique` ON `web_short_url` (`videoId`);--> statement-breakpoint
CREATE TABLE `__new_web_video` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`userId` text(255) NOT NULL,
	`title` text(255) NOT NULL,
	`description` text,
	`filename` text(255) NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`userId`) REFERENCES `web_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_web_video`("id", "userId", "title", "description", "filename", "createdAt", "updatedAt") SELECT "id", "userId", "title", "description", "filename", "createdAt", "updatedAt" FROM `web_video`;--> statement-breakpoint
DROP TABLE `web_video`;--> statement-breakpoint
ALTER TABLE `__new_web_video` RENAME TO `web_video`;