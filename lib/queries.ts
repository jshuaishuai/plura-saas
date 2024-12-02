"use server"

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { Agency, Plan, SubAccount, User } from "@prisma/client";
import { v4 } from "uuid";
import { revalidatePath } from 'next/cache'

import {
    CreateFunnelFormSchema,
    // CreateMediaType,
    UpsertFunnelPage,
} from './types'
import { z } from 'zod'

// 获取当前用户详细信息
export const getAuthUserDetails = async () => {
    // 获取当前用户
    const user = await currentUser();
    if (!user) {
        return null
    }
    // 从数据库中检索用户相关的数据，
    // 包括与用户关联的 Agency、SidebarOption、SubAccount 和 Permissions。
    try {
        const userData = await db.user.findUnique({
            where: {
                email: user.emailAddresses[0].emailAddress
            },
            include: {
                Agency: {
                    include: {
                        SidebarOption: true,
                        SubAccount: {
                            include: {
                                SidebarOption: true
                            }
                        }
                    }
                },
                Permissions: true
            }
        })

        return userData;

    } catch (error) {
        console.log('getAuthUserDetails-error', error)
        return null;
    }
}


export const verifyAndAcceptInvitation = async () => {
    const user = await currentUser();
    if (!user) {
        return redirect('/sign-in')
    }

    const invitationExits = await db.invitation.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
            status: 'PENDING' // 如果是pending状态意味着收到了邀请
        }
    })

    // 如果有邀请，调用createTeamUser 来创建用户并将他们添加到团队中

    if (invitationExits) {
        const userDetails = await createTeamUser(invitationExits.agencyId, {
            email: invitationExits.email,
            agencyId: invitationExits.agencyId,
            avatarUrl: user.imageUrl,
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            role: invitationExits.role,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await saveActivityLogsNotification({
            agencyId: invitationExits?.agencyId,
            description: 'Joined',
            subaccountId: undefined,
        })

        if (userDetails) {
            await clerkClient.users.updateUserMetadata(user.id, {
                privateMetadata: {
                    role: userDetails.role || 'SUBACCOUNT_USER',
                }
            });

            await db.invitation.delete({
                where: {
                    email: userDetails.email
                }
            });

            return userDetails.agencyId;

        } else {
            return null;
        }
    } else {
        // 如果没有邀请，则直接返回用户的 agencyId，代表用户已属于某个机构
        const agency = await db.user.findUnique({
            where: {
                email: user.emailAddresses[0].emailAddress
            }
        })

        return agency?.agencyId;
    }

}

export const createTeamUser = async (agencyId: string, user: User) => {
    if (user.role === 'AGENCY_OWNER') {
        return null;
    }
    const response = await db.user.create({
        data: { ...user }
    })

    return response;
}
// 保存用户活动日志通知。根据当前用户是否登录，
// 或者通过 subaccountId 查找到相关的用户信息，然后将这些信息与通知关联
export const saveActivityLogsNotification = async ({
    agencyId,
    description,
    subaccountId,
}: {
    agencyId?: string,
    description?: string,
    subaccountId?: string
}) => {
    // 保存活动日志通知，首先获取当前用户，如果用户不存在，
    // 尝试根据 subaccountId 查找相关用户。
    const authUser = await currentUser();
    let userData;

    if (!authUser) {
        const response = await db.user.findFirst({
            where: {
                Agency: {
                    SubAccount: {
                        some: {
                            id: subaccountId
                        }
                    }
                }
            }
        });
        if (response) {
            userData = response
        }

    } else {
        userData = await db.user.findUnique({
            where: {
                email: authUser.emailAddresses[0].emailAddress
            }
        })
    }

    if (!userData) {
        console.log('Could not find user')
        return;
    }

    let foundAgencyId = agencyId;
    if (!foundAgencyId) {
        if (!subaccountId) {
            throw new Error('You need to provide atleast an agencyId or subaccountId')
        }
        const response = await db.subAccount.findUnique({
            where: {
                id: subaccountId
            }
        })
        if (response) {
            foundAgencyId = response.agencyId
        }
    }

    if (subaccountId) {
        // 这些外键约束确保了在插入 notification 时，userId、agencyId、
        // 和 subaccountId 必须引用存在的 user、agency 和 sub_account
        // 表中的有效记录。
        // 如果插入时提供的值不存在于相关表中，会抛出外键约束错误。
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id
                    }
                },
                Agency: {
                    connect: {
                        id: foundAgencyId
                    }
                },
                SubAccount: {
                    connect: {
                        id: subaccountId
                    }
                }
            }
        })
    } else {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id
                    }
                },
                Agency: {
                    connect: {
                        id: foundAgencyId
                    }
                },
            }
        })
    }




}


export const updateAgencyDetails = async (agencyId: string, agencyDetails: Partial<Agency>) => {

    const res = await db.agency.update({
        where: {
            id: agencyId
        },
        data: {
            ...agencyDetails
        }
    })

    return res;
}


export const initUser = async (newUser: Partial<User>) => {

    const user = await currentUser();
    if (!user) {
        return;
    }

    const userData = await db.user.upsert({
        where: {
            email: user.emailAddresses[0].emailAddress
        },
        update: newUser,
        create: {
            id: user.id,
            avatarUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName} ${user.lastName}`,
            role: newUser.role || 'SUBACCOUNT_USER'
        }
    });

    await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
            role: newUser.role || 'SUBACCOUNT_USER'
        }
    });

    return userData;
}


export const upsertAgency = async (agency: Agency, price?: Plan) => {
    if (!agency.companyEmail) {
        return null;
    }
    try {
        const agencyDetail = await db.agency.upsert({
            where: {
                id: agency.id,
            },
            update: agency,
            create: {
                users: {
                    connect: {
                        email: agency.companyEmail
                    }
                },
                ...agency,
                SidebarOption: {
                    create: [
                        {
                            name: 'Dashboard',
                            icon: 'category',
                            link: `/agency/${agency.id}`,
                        },
                        {
                            name: 'Launchpad',
                            icon: 'clipboardIcon',
                            link: `/agency/${agency.id}/launchpad`,
                        },
                        {
                            name: 'Billing',
                            icon: 'payment',
                            link: `/agency/${agency.id}/billing`,
                        },
                        {
                            name: 'Settings',
                            icon: 'settings',
                            link: `/agency/${agency.id}/settings`,
                        },
                        {
                            name: 'Sub Accounts',
                            icon: 'person',
                            link: `/agency/${agency.id}/all-subaccounts`,
                        },
                        {
                            name: 'Team',
                            icon: 'shield',
                            link: `/agency/${agency.id}/team`,
                        },
                    ],
                },
            }
        });
        return agencyDetail;
    } catch (error) {
        console.log(error);
    }
}


export const upsertSubAccount = async (subAccount: SubAccount) => {
    if (!subAccount.companyEmail) {
        return null;
    }
    // 查找该子账号所属的代理机构（Agency）中的 AGENCY_OWNER。
    const agencyOwner = await db.user.findFirst({
        where: {
            Agency: {
                id: subAccount.agencyId
            },
            role: 'AGENCY_OWNER'
        }
    })

    if (!agencyOwner) return console.log('🔴Erorr could not create subaccount')

    const permissionId = v4();

    const response = await db.subAccount.upsert({
        where: {
            id: subAccount.id
        },
        update: subAccount,
        create: {
            ...subAccount,
            Permissions: {
                create: {
                    access: true,
                    email: agencyOwner.email,
                    id: permissionId
                },
                connect: {
                    subAccountId: subAccount.id,
                    id: permissionId,
                }
            },
            Pipeline: {
                create: { name: 'Lead Cycle' },
            },
            SidebarOption: {
                create: [
                    {
                        name: 'Launchpad',
                        icon: 'clipboardIcon',
                        link: `/subaccount/${subAccount.id}/launchpad`,
                    },
                    {
                        name: 'Settings',
                        icon: 'settings',
                        link: `/subaccount/${subAccount.id}/settings`,
                    },
                    {
                        name: 'Funnels',
                        icon: 'pipelines',
                        link: `/subaccount/${subAccount.id}/funnels`,
                    },
                    {
                        name: 'Media',
                        icon: 'database',
                        link: `/subaccount/${subAccount.id}/media`,
                    },
                    {
                        name: 'Automations',
                        icon: 'chip',
                        link: `/subaccount/${subAccount.id}/automations`,
                    },
                    {
                        name: 'Pipelines',
                        icon: 'flag',
                        link: `/subaccount/${subAccount.id}/pipelines`,
                    },
                    {
                        name: 'Contacts',
                        icon: 'person',
                        link: `/subaccount/${subAccount.id}/contacts`,
                    },
                    {
                        name: 'Dashboard',
                        icon: 'category',
                        link: `/subaccount/${subAccount.id}`,
                    },
                ],
            },
        }
    });
    return response;
}


export const getNotificationAndUser = async (agencyId: string) => {

    try {
        const response = await db.notification.findMany({
            where: {
                agencyId,
            },
            include: {
                User: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return response;
    } catch (error) {
        console.log('%c [ error ]-384', 'font-size:13px; background:pink; color:#bf2c9f;', error)

    }

}

export const deleteAgency = async (agencyId: string) => {
    const response = await db.agency.delete({
        where: {
            id: agencyId
        }
    });
    return response;
}


// 获取子租户详情

export const getSubaccountDetails = async (id: string) => {


    const res = await db.subAccount.findUnique({
        where: {
            id
        }
    })

    return res;
}


export const deleteSubAccount = async (id: string) => {
    const response = await db.subAccount.delete({
        where: {
            id
        }
    });
    return response;
}

export const getFunnels = async (subacountId: string) => {
    const funnels = await db.funnel.findMany({
        where: { subAccountId: subacountId },
        include: { FunnelPages: true },
    })

    return funnels
}

export const upsertFunnel = async (
    subaccountId: string,
    funnel: z.infer<typeof CreateFunnelFormSchema> & { liveProducts: string },
    funnelId: string
) => {
    const response = await db.funnel.upsert({
        where: { id: funnelId },
        update: funnel,
        create: {
            ...funnel,
            id: funnelId || v4(),
            subAccountId: subaccountId,
        },
    })

    return response
}

export const getFunnel = async (funnelId: string) => {

    const funnel = await db.funnel.findUnique({
        where: {
            id: funnelId
        },
        include: {
            FunnelPages: {
                orderBy: {
                    order: 'asc'
                }
            }
        }
    })

    return funnel;
}



export const upsertFunnelPage = async (
    subaccountId: string,
    funnelPage: UpsertFunnelPage,
    funnelId: string
  ) => {
    if (!subaccountId || !funnelId) return
    const response = await db.funnelPage.upsert({
      where: { id: funnelPage.id || '' },
      update: { ...funnelPage },
      create: {
        ...funnelPage,
        content: funnelPage.content
          ? funnelPage.content
          : JSON.stringify([
            {
              content: [],
              id: '__body',
              name: 'Body',
              styles: { backgroundColor: 'white' },
              type: '__body',
            },
          ]),
        funnelId,
      },
    })
  
    revalidatePath(`/subaccount/${subaccountId}/funnels/${funnelId}`, 'page')
    return response
  }

export const deleteFunnelPage = async (funnelPageId: string) => { 

    const response = await db.funnelPage.delete({ where: { id: funnelPageId } })
  
    return response
}


