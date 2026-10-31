CREATE TABLE "task_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"completed_date" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"note" text,
	"mood" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "reminder_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "reminder_time" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "reminder_interval_hours" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "max_daily_reminders" integer DEFAULT 4 NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "last_reminded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "reminder_count_today" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "task_completions_task_date_uidx" ON "task_completions" USING btree ("task_id","completed_date");--> statement-breakpoint
CREATE INDEX "task_completions_user_date_idx" ON "task_completions" USING btree ("user_id","completed_date");--> statement-breakpoint
CREATE INDEX "tasks_reminder_active_idx" ON "tasks" USING btree ("reminder_enabled","is_archived","deleted_at");