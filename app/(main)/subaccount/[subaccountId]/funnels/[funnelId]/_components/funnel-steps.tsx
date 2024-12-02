"use client"
import CreateFunnelPage from "@/components/forms/funnel-page";
import CustomModal from "@/components/global/custom-modal";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FunnelsForSubAccount } from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { FunnelPage } from "@prisma/client";
import { Check } from "lucide-react";
import { useState } from "react";

import {
    DragDropContext,
    DragStart,
    DropResult,
    Droppable,
} from 'react-beautiful-dnd'
import FunnelStepCard from "./funnel-step-card";
import { upsertFunnelPage } from "@/lib/queries";
import { toast } from "@/components/ui/use-toast";


type Props = {
    funnel: FunnelsForSubAccount;
    subaccountId: string;
    pages: FunnelPage[];
    funnelId: string;
}


const FunnelSteps = ({ funnel, funnelId, pages, subaccountId }: Props) => {

    const [pagesState, setPagesState] = useState(pages);
    const [clickedPage, setClickedPage] = useState<FunnelPage | undefined>(
        pages[0]
    )
    const { setOpen } = useModal();
    const onDragEnd = (result: DropResult) => {
        const { destination, source } = result;
        if (!destination) {
            return;
        }
        if (destination?.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const newPagesOrder = [...pagesState]
            .toSpliced(source.index, 1)
            .toSpliced(destination.index, 0, pagesState[source.index])
            .map((page, index) => {
                return {
                    ...page,
                    order: index
                }
            })
        setPagesState(newPagesOrder)

        newPagesOrder.map(async (page, index) => {
            try {
                await upsertFunnelPage(subaccountId, {
                    id: page.id,
                    order: index,
                    name: page.name,
                }, funnelId)
            } catch (error) {
                console.log(error)
                toast({
                    variant: 'destructive',
                    title: 'Failed',
                    description: 'Could not save page order',
                })
                return;
            }

            toast({
                title: 'Success',
                description: 'Saved page order',
            })
        })

    }
    const onDragStart = (result: DragStart) => { }
    return (
        <AlertDialog>
            <div className="flex border-[1px] lg:!flex-row flex-col">
                <aside className="flex-[0.3] bg-background p-6 flex flex-col justify-between">
                    <ScrollArea className="h-full">
                        <div className="flex gap-4 items-center">
                            <Check />
                            Funnel Steps
                        </div>
                        {
                            pagesState.length ? (<DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
                                <Droppable droppableId="steps" direction="vertical" key="funnels">
                                    {
                                        (provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                            >
                                                {
                                                    pagesState.map((page, index) => (
                                                        <div
                                                            className="relative"
                                                            key={page.id}
                                                            onClick={() => setClickedPage(page)}
                                                        >
                                                            <FunnelStepCard
                                                                funnelPage={page}
                                                                index={index}
                                                                key={page.id}
                                                                activePage={page.id === clickedPage?.id}
                                                            />
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        )
                                    }
                                </Droppable>
                            </DragDropContext>) : (<div className="text-center text-muted-foreground py-6">No Pages</div>)
                        }
                    </ScrollArea>
                    <Button
                        className="mt-4 w-full"
                        onClick={() => {
                            setOpen(
                                <CustomModal
                                    title=" Create or Update a Funnel Page"
                                    subheading="Funnel Pages allow you to create step by step processes for customers to follow"
                                >
                                    <CreateFunnelPage
                                        subaccountId={subaccountId}
                                        funnelId={funnelId}
                                        order={pagesState.length}
                                    />

                                </CustomModal>
                            )

                        }
                        }
                    >Create New Steps</Button>
                </aside>
                <aside></aside>
            </div>
        </AlertDialog>
    );
};


export default FunnelSteps;
