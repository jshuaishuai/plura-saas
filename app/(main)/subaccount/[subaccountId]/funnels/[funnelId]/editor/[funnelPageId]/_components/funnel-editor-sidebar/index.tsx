'use client'

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useEditor } from "@/providers/editor/editor-provider";

type Props = {
    subaccountId: string
}
const FunnelEditorSidebar = ({ subaccountId }: Props) => {
    const { state } = useEditor();
    return (
        <Sheet
            open={true}
            modal={false}
        >
            <SheetContent
                showX={false}
                side="right"
                className={cn(
                    'mt-[97px] w-16 z-[80] shadow-none p-0 focus:border-none transition-all overflow-hidden',
                    {
                        'hidden': state.editor.previewMode
                    }
                )}
            >
                <h1>Funnel Editor</h1>
            </SheetContent>

            <SheetContent
                showX={false}
                side="right"
                className={cn(
                    'mt-[97px] w-80 z-[40] shadow-none p-0 mr-16 bg-background h-full transition-all overflow-hidden ',
                    { hidden: state.editor.previewMode }
                )}
            >
                Show your creativity! You can customize every component as you
                like.
            </SheetContent>
        </Sheet>
    );
};

export default FunnelEditorSidebar;
