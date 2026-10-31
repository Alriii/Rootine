CREATE TYPE "public"."TaskFrequency" AS ENUM('DAILY', 'SPECIFIC_DAYS', 'TIMES_PER_WEEK');--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"frequency" "TaskFrequency" DEFAULT 'DAILY' NOT NULL,
	"schedule_config" jsonb,
	"preferred_time_window" text,
	"color" text,
	"icon" text,
	"position" integer DEFAULT 0 NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "timezone" text DEFAULT 'Asia/Manila' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tasks_user_active_idx" ON "tasks" USING btree ("user_id","deleted_at","is_archived");--> statement-breakpoint
CREATE INDEX "tasks_user_position_idx" ON "tasks" USING btree ("user_id","position");