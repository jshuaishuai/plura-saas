"use client";

import { Button } from "@/components/ui/button";
import { getFunnelPageDetails } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { useEditor } from "@/providers/editor/editor-provider";
import { EyeOff } from "lucide-react";
import { useEffect } from "react";

type Props = {
    funnelPageId: string
}
const FunnelEditor = ({ funnelPageId }: Props) => {
    const { state, dispatch } = useEditor();


    useEffect(() => {
        // 请求当前页面数据
        const fetchData = async () => {
            const response = await getFunnelPageDetails(funnelPageId);
            console.log('%c [ response ]-21', 'font-size:13px; background:pink; color:#bf2c9f;', response)

        }

        fetchData();

    }, [funnelPageId])

    const handleClick = () => {

    }

    const handleUnPreview = () => {
        dispatch({
            type: 'TOGGLE_PREVIEW_MODE'
        })
        dispatch({
            type: 'TOGGLE_LIVE_MODE'
        })
    }


    return (
        <div
            className={cn(
                'use-automation-zoom-in h-full overflow-scroll mr-[385px] bg-background transition-all rounded-md',
                {
                    '!p-0 !mr-0': state.editor.previewMode === true || state.editor.liveMode === true,
                    '!w-[850px]': state.editor.device === 'Tablet',
                    '!w-[420px]': state.editor.device === 'Mobile',
                    '!w-full': state.editor.device === 'Desktop',
                }
            )}
            onClick={handleClick}
        >
            {
                state.editor.previewMode && state.editor.liveMode && (
                    <Button
                        variant={'ghost'}
                        size={'icon'}
                        className="w-6 h-6 bg-slate-600 p-[2px] fixed top-0 z-[100] hover:text-slate-600"
                        onClick={handleUnPreview}
                    >
                        <EyeOff />
                    </Button>
                )
            }

        </div>
    );
};

export default FunnelEditor;
