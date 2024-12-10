'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { upsertFunnelPage } from "@/lib/queries";
import { useEditor } from "@/providers/editor/editor-provider";

import { FunnelPage } from "@prisma/client";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { ArrowLeftCircle, EyeIcon, Laptop, Redo2, Smartphone, Tablet, Undo2 } from "lucide-react";
import Link from "next/link";
import { FocusEventHandler } from "react";
import { toast } from 'sonner'
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { DeviceTypes } from "@/providers/editor/editor-types";

type Props = {
    subaccountId: string;
    funnelId: string;
    funnelPageDetails: FunnelPage
};

const FunnelEditorNavigation = ({
    subaccountId,
    funnelId,
    funnelPageDetails
}: Props) => {
    const router = useRouter();
    const { state, dispatch } = useEditor();
    console.log('%c [ state ]-32', 'font-size:13px; background:pink; color:#bf2c9f;', state)

    const handleOnBlurTitleChange: FocusEventHandler<HTMLInputElement> = async (e) => {
        if (e.target.value === funnelPageDetails.name) {
            // no change 
            return;
        }

        if (!e.target.value) {
            toast('Funnel name cannot be empty')
            e.target.value = funnelPageDetails.name
        }

        // 修改funnelpage 信息

        await upsertFunnelPage(
            subaccountId,
            {
                id: funnelPageDetails.id,
                name: e.target.value,
                order: funnelPageDetails.order
            },
            funnelId
        )

        toast.success('Funnel name updated successfully')

        // router.refresh()
    }

    // 预览
    const handlePreviewClick = () => {
        dispatch({
            type: 'TOGGLE_PREVIEW_MODE'
        })
        dispatch({
            type: 'TOGGLE_LIVE_MODE'
        })
    }

    // 撤销
    const handleUndo = () => {
        dispatch({
            type: 'UNDO'
        })
    }

    // 重做
    const handleRedo = () => {
        dispatch({
            type: 'REDO'
        })
    }

    const handleOnSave = () => {

    }


    return (
        <TooltipProvider>
            <nav
                className={cn('border-b-[1px] flex items-center justify-between p-6 gap-2 transition-all', {
                    '!h-0 !p-0 !overflow-hidden': state.editor.previewMode
                })}
            >
                <aside className="flex items-center gap-4 max-w-[260px]">
                    <Link href={`/subaccount/${subaccountId}/funnels/${funnelId}`}>
                        <ArrowLeftCircle />
                    </Link>
                    <div className="flex flex-col w-full ">
                        <Input
                            defaultValue={funnelPageDetails.name}
                            className="border-none h-5 m-0 p-0 text-lg"
                            onBlur={handleOnBlurTitleChange}
                        />
                        <span className="text-sm text-muted-foreground">
                            Path: /{funnelPageDetails.pathName}
                        </span>
                    </div>
                </aside>

                <aside>
                    <Tabs
                        defaultValue="Desktop"
                        className="w-fit"
                        value={state.editor.device}
                        onValueChange={(value) => {
                            dispatch({
                                type: 'CHANGE_DEVICE',
                                payload: {
                                    device: value as DeviceTypes
                                }
                            })
                        }}
                    >
                        <TabsList className="grid w-full grid-cols-3 bg-transparent h-fit">
                            {/* 桌面 */}
                            <Tooltip>
                                <TooltipTrigger>
                                    <TabsTrigger value="Desktop" className="data-[state=active]:bg-muted w-10 h-10 p-0">
                                        <Laptop />
                                    </TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Desktop</TooltipContent>
                            </Tooltip>
                            {/*  */}
                            <Tooltip>
                                <TooltipTrigger>
                                    <TabsTrigger
                                        value="Tablet"
                                        className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                                    >
                                        <Tablet />
                                    </TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Tablet</TooltipContent>
                            </Tooltip>

                            {/*  */}
                            <Tooltip>
                                <TooltipTrigger>
                                    <TabsTrigger
                                        value="Mobile"
                                        className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                                    >
                                        <Smartphone />
                                    </TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Mobile</TooltipContent>
                            </Tooltip>
                        </TabsList>
                    </Tabs>
                </aside>
                <aside className="flex items-center gap-2">
                    <Button
                        size={"icon"}
                        variant={"ghost"}
                        className="hover:bg-slate-800 hover:text-slate-100"
                        onClick={handlePreviewClick}
                    >
                        <EyeIcon />
                    </Button>

                    <Button
                        size={"icon"}
                        variant={"ghost"}
                        className="hover:bg-slate-800 hover:text-slate-100"
                        onClick={handleUndo}
                    >
                        <Undo2 />
                    </Button>

                    <Button
                        size={"icon"}
                        variant={"ghost"}
                        className="hover:bg-slate-800 hover:text-slate-100"
                        onClick={handleRedo}
                    >
                        <Redo2 />
                    </Button>
                    <div className="flex flex-col item-center mr-4">
                        <div className="flex flex-row items-center gap-4">
                            Draft
                            <Switch disabled defaultChecked={true} />
                            Publish
                        </div>
                        <span className="text-muted-foreground text-sm">Last Update {funnelPageDetails.updatedAt.toLocaleDateString()}</span>
                    </div>
                    <Button onClick={handleOnSave}>Save</Button>
                </aside>
            </nav>
        </TooltipProvider>
    );
};

export default FunnelEditorNavigation;
