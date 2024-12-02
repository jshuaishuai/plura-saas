import AgencyDetails from "@/components/forms/agency-form";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

type Props = {
    params: {
        agencyId: string
    }
}

const Settings = async ({ params }: Props) => {

    const authUser = await currentUser();

    if (!authUser) {
        return null;
    }
    const userDetails = await db.user.findUnique({
        where: {
            email: authUser.emailAddresses[0].emailAddress
        }
    })

    console.log('%c [ userDetails ]-24', 'font-size:13px; background:pink; color:#bf2c9f;', userDetails)
    if (!userDetails) {
        return null;
    }

    const agencyDetails = await db.agency.findUnique({
        where: {
            id: params.agencyId
        },
        include: {
            SubAccount: true
        }
    });

    console.log('%c [ agencyDetails ]-37', 'font-size:13px; background:pink; color:#bf2c9f;', agencyDetails)

    if (!agencyDetails) {
        return null;
    }

    const subAccounts = agencyDetails.SubAccount;


    return (
        <div className="flex lg:!fle-row flex-col gap-4">
            <AgencyDetails data={agencyDetails} />
        </div>
    );
};

export default Settings;
