CREATE TABLE "web_account" (
	"userId" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	"refresh_token_expires_in" integer,
	CONSTRAINT "web_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "web_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "web_short_url" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"videoId" uuid NOT NULL,
	"shortVideoId" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "web_short_url_videoId_unique" UNIQUE("videoId")
);
--> statement-breakpoint
CREATE TABLE "web_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp DEFAULT now(),
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "web_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "web_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "web_video" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"filename" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "web_account" ADD CONSTRAINT "web_account_userId_web_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."web_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_session" ADD CONSTRAINT "web_session_userId_web_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."web_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_short_url" ADD CONSTRAINT "web_short_url_videoId_web_video_id_fk" FOREIGN KEY ("videoId") REFERENCES "public"."web_video"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_video" ADD CONSTRAINT "web_video_userId_web_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."web_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "web_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "web_session" USING btree ("userId");