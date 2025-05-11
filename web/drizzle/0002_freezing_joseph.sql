ALTER TABLE `web_video` RENAME COLUMN "miniourl" TO "filename";--> statement-breakpoint
CREATE TABLE `web_short_url` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`videoId` text(255) NOT NULL,
	`shortVideoId` text(255) NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`videoId`) REFERENCES `web_video`(`id`) ON UPDATE no action ON DELETE no action
);
