import AgencyDetails from "@/components/forms/agency-form";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser, getAuth } from "@clerk/nextjs/server";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";


const AgencyPage = async ({
    searchParams,
}: {
    searchParams: {
        plan: Plan;
        state: string;
        code: string
    }
}) => {

    // verifyAndAcceptInvitation 函数：确保用户能够处理未接受的邀请并将他们添加到相应的机构中。
    const agencyId = await verifyAndAcceptInvitation();
    console.log('%c [ agencyId ]-17', 'font-size:13px; background:pink; color:#bf2c9f;', agencyId)

    // 获取用户信息
    const user = await getAuthUserDetails();

    if (agencyId) {

        if (user?.role === 'SUBACCOUNT_GUEST' || user?.role === 'SUBACCOUNT_USER') {

            return redirect('/subaccount')

        } else if (user?.role === 'AGENCY_OWNER' || user?.role === 'AGENCY_ADMIN') {

            if (searchParams.plan) {
                // 如果 plan 存在，重定向到机构的账单页面。
                return redirect(`/agency/${agencyId}/billing?plan=${searchParams.plan}`)
            }

            if (searchParams.state) {
                // 如果 state 存在，解析路径并重定向到对应的机构路径。
                const statePath = searchParams.state.split('__')[0];
                const stateAgencyId = searchParams.state.split('__')[1];

                if (!stateAgencyId) {
                    return <div>Not authorized</div>
                }

                return redirect(`/agency/${stateAgencyId}/${statePath}?code=${searchParams.code}`)

            } else {

                return redirect(`/agency/${agencyId}`)

            }
        } else {

            return <div>Not authorized</div>

        }
    }

    const authUser = await currentUser();


    // 显示创建机构表单

    return (
        <div className="flex justify-center items-center mt-4">
            <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
                <h1 className="text-4xl">Create an Agency</h1>
                <AgencyDetails
                    data={{
                        companyEmail: authUser?.emailAddresses?.[0]?.emailAddress
                    }}
                />
            </div>
        </div>
    );
};

export default AgencyPage;
