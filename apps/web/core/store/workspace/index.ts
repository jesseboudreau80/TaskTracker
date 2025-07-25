import clone from "lodash/clone";
import set from "lodash/set";
import { action, computed, observable, makeObservable, runInAction } from "mobx";
// types
import { computedFn } from "mobx-utils";
import { IWorkspaceSidebarNavigationItem, IWorkspace, IWorkspaceSidebarNavigation } from "@plane/types";
// services
import { WorkspaceService } from "@/plane-web/services";
// store
import { CoreRootStore } from "@/store/root.store";
// sub-stores
import { ApiTokenStore, IApiTokenStore } from "./api-token.store";
import { HomeStore, IHomeStore } from "./home";
import { IWebhookStore, WebhookStore } from "./webhook.store";

export interface IWorkspaceRootStore {
  loader: boolean;
  // observables
  workspaces: Record<string, IWorkspace>;
  // computed
  currentWorkspace: IWorkspace | null;
  workspacesCreatedByCurrentUser: IWorkspace[] | null;
  navigationPreferencesMap: Record<string, IWorkspaceSidebarNavigation>;
  getWorkspaceRedirectionUrl: () => string;
  // computed actions
  getWorkspaceBySlug: (workspaceSlug: string) => IWorkspace | null;
  getWorkspaceById: (workspaceId: string) => IWorkspace | null;
  // fetch actions
  fetchWorkspaces: () => Promise<IWorkspace[]>;
  // crud actions
  createWorkspace: (data: Partial<IWorkspace>) => Promise<IWorkspace>;
  updateWorkspace: (workspaceSlug: string, data: Partial<IWorkspace>) => Promise<IWorkspace>;
  updateWorkspaceLogo: (workspaceSlug: string, logoURL: string) => void;
  deleteWorkspace: (workspaceSlug: string) => Promise<void>;
  fetchSidebarNavigationPreferences: (workspaceSlug: string) => Promise<void>;
  updateSidebarPreference: (
    workspaceSlug: string,
    key: string,
    data: Partial<IWorkspaceSidebarNavigationItem>
  ) => Promise<IWorkspaceSidebarNavigationItem | undefined>;
  getNavigationPreferences: (workspaceSlug: string) => IWorkspaceSidebarNavigation | undefined;
  // sub-stores
  webhook: IWebhookStore;
  apiToken: IApiTokenStore;
  home: IHomeStore;
}

export class WorkspaceRootStore implements IWorkspaceRootStore {
  loader: boolean = false;
  // observables
  workspaces: Record<string, IWorkspace> = {};
  navigationPreferencesMap: Record<string, IWorkspaceSidebarNavigation> = {};
  // services
  workspaceService;
  // root store
  router;
  user;
  home;
  // sub-stores
  webhook: IWebhookStore;
  apiToken: IApiTokenStore;

  constructor(_rootStore: CoreRootStore) {
    makeObservable(this, {
      loader: observable.ref,
      // observables
      workspaces: observable,
      navigationPreferencesMap: observable,
      // computed
      currentWorkspace: computed,
      workspacesCreatedByCurrentUser: computed,
      // computed actions
      getWorkspaceBySlug: action,
      getWorkspaceById: action,
      // actions
      fetchWorkspaces: action,
      createWorkspace: action,
      updateWorkspace: action,
      updateWorkspaceLogo: action,
      deleteWorkspace: action,
      fetchSidebarNavigationPreferences: action,
      updateSidebarPreference: action,
    });

    // services
    this.workspaceService = new WorkspaceService();
    // root store
    this.router = _rootStore.router;
    this.user = _rootStore.user;
    this.home = new HomeStore();
    // sub-stores
    this.webhook = new WebhookStore(_rootStore);
    this.apiToken = new ApiTokenStore(_rootStore);
  }

  /**
   * get the workspace redirection url based on the last and fallback workspace_slug
   */
  getWorkspaceRedirectionUrl = () => {
    let redirectionRoute = "/create-workspace";
    // validate the last and fallback workspace_slug
    const currentWorkspaceSlug =
      this.user.userSettings?.data?.workspace?.last_workspace_slug ||
      this.user.userSettings?.data?.workspace?.fallback_workspace_slug;

    // validate the current workspace_slug is available in the user's workspace list
    const isCurrentWorkspaceValid = Object.values(this.workspaces || {}).findIndex(
      (workspace) => workspace.slug === currentWorkspaceSlug
    );

    if (isCurrentWorkspaceValid >= 0) redirectionRoute = `/${currentWorkspaceSlug}`;
    return redirectionRoute;
  };

  /**
   * computed value of current workspace based on workspace slug saved in the query store
   */
  get currentWorkspace() {
    const workspaceSlug = this.router.workspaceSlug;
    if (!workspaceSlug) return null;
    const workspaceDetails = Object.values(this.workspaces ?? {})?.find((w) => w.slug === workspaceSlug);
    return workspaceDetails || null;
  }

  /**
   * computed value of all the workspaces created by the current logged in user
   */
  get workspacesCreatedByCurrentUser() {
    if (!this.workspaces) return null;
    const user = this.user.data;
    if (!user) return null;
    const userWorkspaces = Object.values(this.workspaces ?? {})?.filter((w) => w.created_by === user?.id);
    return userWorkspaces || null;
  }

  /**
   * get workspace info from the array of workspaces in the store using workspace slug
   * @param workspaceSlug
   */
  getWorkspaceBySlug = (workspaceSlug: string) =>
    Object.values(this.workspaces ?? {})?.find((w) => w.slug == workspaceSlug) || null;

  /**
   * get workspace info from the array of workspaces in the store using workspace id
   * @param workspaceId
   */
  getWorkspaceById = (workspaceId: string) => this.workspaces?.[workspaceId] || null; // TODO: use undefined instead of null

  /**
   * fetch user workspaces from API
   */
  fetchWorkspaces = async () => {
    this.loader = true;
    try {
      const workspaceResponse = await this.workspaceService.userWorkspaces();
      runInAction(() => {
        workspaceResponse.forEach((workspace) => {
          set(this.workspaces, [workspace.id], workspace);
        });
      });
      return workspaceResponse;
    } finally {
      this.loader = false;
    }
  };

  /**
   * create workspace using the workspace data
   * @param data
   */
  createWorkspace = async (data: Partial<IWorkspace>) =>
    await this.workspaceService.createWorkspace(data).then((response) => {
      runInAction(() => {
        this.workspaces = set(this.workspaces, response.id, response);
      });
      return response;
    });

  /**
   * update workspace using the workspace slug and new workspace data
   * @param workspaceSlug
   * @param data
   */
  updateWorkspace = async (workspaceSlug: string, data: Partial<IWorkspace>) =>
    await this.workspaceService.updateWorkspace(workspaceSlug, data).then((res) => {
      if (res && res.id) {
        runInAction(() => {
          Object.keys(data).forEach((key) => {
            set(this.workspaces, [res.id, key], data[key as keyof IWorkspace]);
          });
        });
      }
      return res;
    });

  /**
   * update workspace using the workspace slug and new workspace data
   * @param {string} workspaceSlug
   * @param {string} logoURL
   */
  updateWorkspaceLogo = async (workspaceSlug: string, logoURL: string) => {
    const workspaceId = this.getWorkspaceBySlug(workspaceSlug)?.id;
    if (!workspaceId) {
      throw new Error("Workspace not found");
    }
    runInAction(() => {
      set(this.workspaces[workspaceId], ["logo_url"], logoURL);
    });
  };

  /**
   * delete workspace using the workspace slug
   * @param workspaceSlug
   */
  deleteWorkspace = async (workspaceSlug: string) =>
    await this.workspaceService.deleteWorkspace(workspaceSlug).then(() => {
      const updatedWorkspacesList = this.workspaces;
      const workspaceId = this.getWorkspaceBySlug(workspaceSlug)?.id;
      delete updatedWorkspacesList[`${workspaceId}`];
      runInAction(() => {
        this.workspaces = updatedWorkspacesList;
      });
    });

  fetchSidebarNavigationPreferences = async (workspaceSlug: string) => {
    try {
      const response = await this.workspaceService.fetchSidebarNavigationPreferences(workspaceSlug);

      runInAction(() => {
        this.navigationPreferencesMap[workspaceSlug] = response;
      });
    } catch (error) {
      console.error("Failed to fetch sidebar preferences:", error);
    }
  };

  updateSidebarPreference = async (
    workspaceSlug: string,
    key: string,
    data: Partial<IWorkspaceSidebarNavigationItem>
  ) => {
    // Store the data before update to use for reverting if needed
    const beforeUpdateData = clone(this.navigationPreferencesMap[workspaceSlug]?.[key]);

    try {
      runInAction(() => {
        this.navigationPreferencesMap[workspaceSlug] = {
          ...this.navigationPreferencesMap[workspaceSlug],
          [key]: {
            ...beforeUpdateData,
            ...data,
          },
        };
      });

      const response = await this.workspaceService.updateSidebarPreference(workspaceSlug, key, data);
      return response;
    } catch (error) {
      // Revert to original data if API call fails
      runInAction(() => {
        this.navigationPreferencesMap[workspaceSlug] = {
          ...this.navigationPreferencesMap[workspaceSlug],
          [key]: beforeUpdateData,
        };
      });
      console.error("Failed to update sidebar preference:", error);
    }
  };

  getNavigationPreferences = computedFn(
    (workspaceSlug: string): IWorkspaceSidebarNavigation | undefined => this.navigationPreferencesMap[workspaceSlug]
  );
}
