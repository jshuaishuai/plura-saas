import Unauthorized from "@/components/unauthorized";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { redirect } from 'next/navigation';

type Props = {
    searchParams: {
        state: string;
        code: string;
    }
}

const SubAccountMainPage = async ({ searchParams }: Props) => {


    const agencyId = await verifyAndAcceptInvitation()

    if (!agencyId) {
        return <Unauthorized />
    }

    const user = await getAuthUserDetails()

    const getFirstSubaccountWithAccess = user?.Permissions.find(
        (p) => p.access === true
    )

    if (getFirstSubaccountWithAccess) {
        return redirect(`/subaccount/${getFirstSubaccountWithAccess.subAccountId}`)
    }

    return (
        <Unauthorized />
    );
};

export default SubAccountMainPage;
