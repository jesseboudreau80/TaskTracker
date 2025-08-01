import React, { useCallback } from "react";
import xor from "lodash/xor";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// types
import { WORK_ITEM_TRACKER_EVENTS } from "@plane/constants";
import { TIssue } from "@plane/types";
// components
import { ModuleDropdown } from "@/components/dropdowns";
// constants
// hooks
import { captureSuccess } from "@/helpers/event-tracker.helper";
import { useIssuesStore } from "@/hooks/use-issue-layout-store";

type Props = {
  issue: TIssue;
  onClose: () => void;
  disabled: boolean;
};

export const SpreadsheetModuleColumn: React.FC<Props> = observer((props) => {
  const { issue, disabled, onClose } = props;
  // router
  const { workspaceSlug } = useParams();
  // hooks
  const {
    issues: { changeModulesInIssue },
  } = useIssuesStore();

  const handleModule = useCallback(
    async (moduleIds: string[] | null) => {
      if (!workspaceSlug || !issue || !issue.project_id || !issue.module_ids || !moduleIds) return;

      const updatedModuleIds = xor(issue.module_ids, moduleIds);
      const modulesToAdd: string[] = [];
      const modulesToRemove: string[] = [];
      for (const moduleId of updatedModuleIds) {
        if (issue.module_ids.includes(moduleId)) modulesToRemove.push(moduleId);
        else modulesToAdd.push(moduleId);
      }
      changeModulesInIssue(workspaceSlug.toString(), issue.project_id, issue.id, modulesToAdd, modulesToRemove);

      captureSuccess({
        eventName: WORK_ITEM_TRACKER_EVENTS.update,
        payload: {
          id: issue.id,
        },
      });
    },
    [workspaceSlug, issue, changeModulesInIssue]
  );

  return (
    <div className="h-11 border-b-[0.5px] border-custom-border-200">
      <ModuleDropdown
        projectId={issue?.project_id ?? undefined}
        value={issue?.module_ids ?? []}
        onChange={handleModule}
        disabled={disabled}
        placeholder="Select modules"
        buttonVariant="transparent-with-text"
        buttonContainerClassName="w-full relative flex items-center p-2 group-[.selected-issue-row]:bg-custom-primary-100/5 group-[.selected-issue-row]:hover:bg-custom-primary-100/10 px-page-x"
        buttonClassName="relative leading-4 h-4.5 bg-transparent hover:bg-transparent !px-0"
        onClose={onClose}
        multiple
        showCount
        showTooltip
      />
    </div>
  );
});
