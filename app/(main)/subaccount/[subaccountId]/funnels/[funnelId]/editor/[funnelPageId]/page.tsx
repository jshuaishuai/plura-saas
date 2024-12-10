import { db } from "@/lib/db"
import EditorProvider from "@/providers/editor/editor-provider"
import { redirect } from "next/navigation"
import FunnelEditorNavigation from "./_components/funnel-editor-navgation"
import FunnelEditor from "./_components/funnel-editor"
import FunnelEditorSidebar from "./_components/funnel-editor-sidebar"


type Props = {
    params: {
        subaccountId: string
        funnelId: string
        funnelPageId: string
    }
}

const Page = async ({ params }: Props) => {

    const funnelPageDetails = await db.funnelPage.findUnique({
        where: {
            id: params.funnelPageId
        }
    })

    console.log('%c [ funnelPageDetails ]-22', 'font-size:13px; background:pink; color:#bf2c9f;', funnelPageDetails)
    if (!funnelPageDetails) {
        return redirect(`/subaccount/${params.subaccountId}/funnels/${params.funnelId}`)
    }

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
            <EditorProvider
                subaccountId={params.subaccountId}
                funnelId={params.funnelId}
                pageDetails={funnelPageDetails}
            >
                <FunnelEditorNavigation
                    subaccountId={params.subaccountId}
                    funnelId={params.funnelId}
                    funnelPageDetails={funnelPageDetails}
                />
                <div className="h-full flex justify-center">
                    <FunnelEditor funnelPageId={params.funnelPageId} />
                </div>
                <FunnelEditorSidebar subaccountId={params.subaccountId} />
            </EditorProvider>
        </div>
    );
};

export default Page;
