'use client'
import CustomModal from "@/components/global/custom-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useModal } from "@/providers/modal-provider";
import { Agency, User } from "@prisma/client";
import { PlusCircleIcon } from "lucide-react";
import SubAccountDetails from '@/components/forms/subaccount-form'


type Props = {
    user: User & {
        Agency: Agency
    };
    className: string;
}

const CreateSubaccount = ({ user, className }: Props) => {

    const { setOpen } = useModal();

    const agencyDetails = user.Agency;

    if (!agencyDetails) {
        return null
    }
    return (
        <Button
            className={cn('w-full flex gap-4', className)}
            onClick={() => {
                setOpen(
                    <CustomModal
                        title="Create a Subaccount"
                        subheading="You can switch bettween"
                    >
                        <SubAccountDetails
                            agencyDetails={agencyDetails}
                            userId={user.id}
                            userName={user.name}
                        />
                    </CustomModal>
                )
            }}
        >
            <PlusCircleIcon size={15} />
            Create Subaccount</Button>
    );
};

export default CreateSubaccount;
