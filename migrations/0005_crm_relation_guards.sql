-- Close the validation/write race for reassignment, reopening and restore.
-- Completed task and closed opportunity history may remain under an archived
-- customer; active business records require active parents at commit time.
CREATE TRIGGER IF NOT EXISTS crm_opportunity_active_update
BEFORE UPDATE OF customer_id, stage, archived_at ON crm_opportunities
WHEN NEW.archived_at IS NULL AND NEW.stage NOT IN ('won','lost') AND
  NOT EXISTS(SELECT 1 FROM crm_customers WHERE public_id = NEW.customer_id AND archived_at IS NULL)
BEGIN SELECT RAISE(ABORT, 'Active opportunity requires an active customer'); END;

CREATE TRIGGER IF NOT EXISTS crm_task_active_update
BEFORE UPDATE OF customer_id, opportunity_id, status, archived_at ON crm_tasks
WHEN NEW.archived_at IS NULL AND NEW.status != 'done' AND (
  (NEW.customer_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM crm_customers WHERE public_id = NEW.customer_id AND archived_at IS NULL)) OR
  (NEW.opportunity_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM crm_opportunities WHERE public_id = NEW.opportunity_id AND archived_at IS NULL))
)
BEGIN SELECT RAISE(ABORT, 'Active task requires active related records'); END;
