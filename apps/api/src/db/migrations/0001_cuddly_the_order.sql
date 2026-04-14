ALTER TABLE "deployed_workflows" DROP CONSTRAINT "deployed_workflows_secret_key_unique";--> statement-breakpoint
ALTER TABLE "deployed_workflows" ALTER COLUMN "secret_key" DROP NOT NULL;