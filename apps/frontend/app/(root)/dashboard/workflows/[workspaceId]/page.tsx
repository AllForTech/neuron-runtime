import {WorkspaceDetailView} from "@/components/workflow/workspace/WorkspaceDetailView";

export default async function Page({ params}: { params: Promise<Record<string, any>> }) {
    const { workspaceId } = await params

    return (
        <div className={"flex flex-1 flex-col gap-6 p-4 pt-0 lg:p-5"}>
            <WorkspaceDetailView workspaceId={workspaceId} />
        </div>
    )
}