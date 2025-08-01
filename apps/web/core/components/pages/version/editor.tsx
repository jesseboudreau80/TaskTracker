import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import { DocumentReadOnlyEditorWithRef, TDisplayConfig } from "@plane/editor";
import { TPageVersion } from "@plane/types";
import { Loader } from "@plane/ui";
// components
import { EditorMentionsRoot } from "@/components/editor";
// hooks
import { useEditorConfig } from "@/hooks/editor";
import { useMember, useWorkspace } from "@/hooks/store";
import { usePageFilters } from "@/hooks/use-page-filters";
// plane web hooks
import { useEditorFlagging } from "@/plane-web/hooks/use-editor-flagging";
import { useIssueEmbed } from "@/plane-web/hooks/use-issue-embed";

export type TVersionEditorProps = {
  activeVersion: string | null;
  versionDetails: TPageVersion | undefined;
};

export const PagesVersionEditor: React.FC<TVersionEditorProps> = observer((props) => {
  const { activeVersion, versionDetails } = props;
  // store hooks
  const { getUserDetails } = useMember();
  // params
  const { workspaceSlug, projectId } = useParams();
  // store hooks
  const { getWorkspaceBySlug } = useWorkspace();
  // derived values
  const workspaceDetails = getWorkspaceBySlug(workspaceSlug?.toString() ?? "");
  // editor flaggings
  const { document: documentEditorExtensions } = useEditorFlagging(workspaceSlug?.toString() ?? "");
  // editor config
  const { getReadOnlyEditorFileHandlers } = useEditorConfig();
  // issue-embed
  const { issueEmbedProps } = useIssueEmbed({
    projectId: projectId?.toString() ?? "",
    workspaceSlug: workspaceSlug?.toString() ?? "",
  });
  // page filters
  const { fontSize, fontStyle } = usePageFilters();

  const displayConfig: TDisplayConfig = {
    fontSize,
    fontStyle,
    wideLayout: true,
  };

  if (!versionDetails)
    return (
      <div className="size-full px-5">
        <Loader className="relative space-y-4">
          <Loader.Item width="50%" height="36px" />
          <div className="space-y-2">
            <div className="py-2">
              <Loader.Item width="100%" height="36px" />
            </div>
            <Loader.Item width="80%" height="22px" />
            <div className="relative flex items-center gap-2">
              <Loader.Item width="30px" height="30px" />
              <Loader.Item width="30%" height="22px" />
            </div>
            <div className="py-2">
              <Loader.Item width="60%" height="36px" />
            </div>
            <Loader.Item width="70%" height="22px" />
            <Loader.Item width="30%" height="22px" />
            <div className="relative flex items-center gap-2">
              <Loader.Item width="30px" height="30px" />
              <Loader.Item width="30%" height="22px" />
            </div>
            <div className="py-2">
              <Loader.Item width="50%" height="30px" />
            </div>
            <Loader.Item width="100%" height="22px" />
            <div className="py-2">
              <Loader.Item width="30%" height="30px" />
            </div>
            <Loader.Item width="30%" height="22px" />
            <div className="relative flex items-center gap-2">
              <div className="py-2">
                <Loader.Item width="30px" height="30px" />
              </div>
              <Loader.Item width="30%" height="22px" />
            </div>
          </div>
        </Loader>
      </div>
    );

  const description = versionDetails?.description_html;
  if (description === undefined || description?.trim() === "") return null;

  return (
    <DocumentReadOnlyEditorWithRef
      id={activeVersion ?? ""}
      initialValue={description ?? "<p></p>"}
      containerClassName="p-0 pb-64 border-none"
      disabledExtensions={documentEditorExtensions.disabled}
      flaggedExtensions={documentEditorExtensions.flagged}
      displayConfig={displayConfig}
      editorClassName="pl-10"
      fileHandler={getReadOnlyEditorFileHandlers({
        projectId: projectId?.toString() ?? "",
        workspaceId: workspaceDetails?.id ?? "",
        workspaceSlug: workspaceSlug?.toString() ?? "",
      })}
      mentionHandler={{
        renderComponent: (props) => <EditorMentionsRoot {...props} />,
        getMentionedEntityDetails: (id: string) => ({ display_name: getUserDetails(id)?.display_name ?? "" }),
      }}
      embedHandler={{
        issue: {
          widgetCallback: issueEmbedProps.widgetCallback,
        },
      }}
    />
  );
});
