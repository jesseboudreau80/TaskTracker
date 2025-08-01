import { ICycle } from "./cycle";
import { TIssue } from "./issues/issue";
import { IModule } from "./module";
import { IProjectLite } from "./project";
import { IStateLite } from "./state";
import { IUserLite } from "./users";
import {
  IIssueDisplayProperties,
  IIssueFilterOptions,
  TIssueExtraOptions,
  TIssueGroupByOptions,
  TIssueGroupingFilters,
  TIssueOrderByOptions,
} from "./view-props";
import { IWorkspaceLite, Properties } from "./workspace";

export interface IIssueCycle {
  id: string;
  cycle_detail: ICycle;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  project: string;
  workspace: string;
  issue: string;
  cycle: string;
}

export interface IIssueModule {
  created_at: Date;
  created_by: string;
  id: string;
  issue: string;
  module: string;
  module_detail: IModule;
  project: string;
  updated_at: Date;
  updated_by: string;
  workspace: string;
}

export interface IIssueParent {
  description: any;
  id: string;
  name: string;
  priority: string | null;
  project_detail: IProjectLite;
  sequence_id: number;
  start_date: string | null;
  state_detail: IStateLite;
  target_date: string | null;
}

export interface IIssueLink {
  title: string;
  url: string;
}

export interface ILinkDetails {
  created_at: Date;
  created_by: string;
  id: string;
  metadata: any;
  title: string;
  url: string;
}

export interface ISubIssuesState {
  backlog: number;
  unstarted: number;
  started: number;
  completed: number;
  cancelled: number;
}

export interface ISubIssueResponse {
  state_distribution: ISubIssuesState;
  sub_issues: TIssue[];
}

export interface BlockeIssueDetail {
  id: string;
  name: string;
  sequence_id: number;
  project_detail: IProjectLite;
}

export type IssuePriorities = {
  id: string;
  created_at: Date;
  updated_at: Date;
  uuid: string;
  properties: Properties;
  created_by: number;
  updated_by: number;
  user: string;
};

export interface IIssueLabel {
  id: string;
  name: string;
  color: string;
  project_id: string;
  workspace_id: string;
  parent: string | null;
  sort_order: number;
}

export interface IIssueLabelTree extends IIssueLabel {
  children: IIssueLabel[] | undefined;
}

export interface IIssueActivity {
  access?: "EXTERNAL" | "INTERNAL";
  actor: string;
  actor_detail: IUserLite;
  attachments: any[];
  comment?: string;
  comment_html?: string;
  comment_stripped?: string;
  created_at: Date;
  created_by: string;
  field: string | null;
  id: string;
  issue: string | null;
  issue_comment?: string | null;
  issue_detail: {
    description_html: string;
    id: string;
    name: string;
    priority: string | null;
    sequence_id: string;
    type_id: string;
  } | null;
  new_identifier: string | null;
  new_value: string | null;
  old_identifier: string | null;
  old_value: string | null;
  project: string;
  project_detail: IProjectLite;
  updated_at: Date;
  updated_by: string;
  verb: string;
  workspace: string;
  workspace_detail?: IWorkspaceLite;
}

export interface IIssueLite {
  id: string;
  name: string;
  project_id: string;
  start_date?: string | null;
  target_date?: string | null;
  workspace__slug: string;
}

export interface IIssueAttachment {
  asset: string;
  attributes: {
    name: string;
    size: number;
  };
  created_at: string;
  created_by: string;
  id: string;
  issue: string;
  project: string;
  updated_at: string;
  updated_by: string;
  workspace: string;
}

export type TIssuePriorities = "urgent" | "high" | "medium" | "low" | "none";

export interface ViewFlags {
  enableQuickAdd: boolean;
  enableIssueCreation: boolean;
  enableInlineEditing: boolean;
}

export type GroupByColumnTypes =
  | "project"
  | "cycle"
  | "module"
  | "state"
  | "state_detail.group"
  | "priority"
  | "labels"
  | "assignees"
  | "created_by"
  | "team_project";

export type TGetColumns = {
  isWorkspaceLevel?: boolean;
  projectId?: string;
};

export interface IGroupByColumn {
  id: string;
  name: string;
  icon?: React.ReactElement | undefined;
  payload: Partial<TIssue>;
  isDropDisabled?: boolean;
  dropErrorMessage?: string;
}

export interface IIssueMap {
  [key: string]: TIssue;
}

export interface IIssueListRow {
  id: string;
  groupId: string;
  type: "HEADER" | "NO_ISSUES" | "QUICK_ADD" | "ISSUE";
  name?: string;
  icon?: React.ReactElement | undefined;
  payload?: Partial<TIssue>;
}

export interface ILayoutDisplayFiltersOptions {
  filters: (keyof IIssueFilterOptions)[];
  display_properties: (keyof IIssueDisplayProperties)[];
  display_filters: {
    group_by?: TIssueGroupByOptions[];
    sub_group_by?: TIssueGroupByOptions[];
    order_by?: TIssueOrderByOptions[];
    type?: TIssueGroupingFilters[];
  };
  extra_options: {
    access: boolean;
    values: TIssueExtraOptions[];
  };
}
