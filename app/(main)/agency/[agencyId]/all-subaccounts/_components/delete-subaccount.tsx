"use client"
import { deleteSubAccount, getSubaccountDetails, saveActivityLogsNotification } from "@/lib/queries";

import { useRouter } from 'next/navigation'


type Props = {
    subaccountId: string;
}

const DeleteSubaccount = ({ subaccountId }: Props) => {
    const router = useRouter()


    const handleClick = async () => {
        const res = await getSubaccountDetails(subaccountId)

        await saveActivityLogsNotification({
            agencyId: undefined,
            description: `Deleted a subaccount | ${res?.name}`,
            subaccountId

        })

        // 删除子账户
        await deleteSubAccount(subaccountId)

        router.refresh()


    }


    return (
        <div className="text-white" onClick={handleClick}>
            Delete Sub Account
        </div>
    );
};

export default DeleteSubaccount;
