"use client"
import { Agency } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NumberInput } from '@tremor/react';
import { useRouter } from 'next/navigation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../ui/alert-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import FileUpload from "@/components/global/file-upload";
import { Input } from "@/components/ui/input";
import { v4 } from 'uuid';


import { Switch } from '../ui/switch'
import { Button } from "../ui/button";
import Loading from '../global/loading';
import { useToast } from '../ui/use-toast';

import { deleteAgency, initUser, saveActivityLogsNotification, updateAgencyDetails, upsertAgency } from '@/lib/queries'
import { useState } from "react";


const formSchema = z.object({
    agencyLogo: z.string().min(1),
    name: z.string().min(1, { message: '机构名不能少于2个字符' }),
    companyEmail: z.string().min(1),
    companyPhone: z.string().min(1),
    whiteLabel: z.boolean(),
    address: z.string().min(1),
    city: z.string().min(1),
    zipCode: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
})


interface AgencyDetailsProps {
    data?: Partial<Agency>
}

const AgencyDetails = ({ data }: AgencyDetailsProps) => {
    const router = useRouter();
    const { toast } = useToast();
    const [deletingAgency, setDeletingAgency] = useState(false)


    const form = useForm<z.infer<typeof formSchema>>({
        mode: 'onChange',
        resolver: zodResolver(formSchema),
        defaultValues: {
            agencyLogo: data?.agencyLogo || "",
            name: data?.name || "",
            companyEmail: data?.companyEmail || "",
            companyPhone: data?.companyPhone || "",
            whiteLabel: data?.whiteLabel || false,
            address: data?.address || "",
            city: data?.city || "",
            zipCode: data?.zipCode || "",
            state: data?.state || "",
            country: data?.country || "",
        }
    })


    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values);

        let newUserData;
        // let custid;

        if (!data?.id) {
            const bodyData = {
                email: values.companyEmail,
                name: values.name,
                shipping: {
                    address: {
                        city: values.city,
                        country: values.country,
                        line1: values.address,
                        postal_code: values.zipCode,
                        state: values.state
                    },
                    name: values.name,
                },
                address: {
                    city: values.city,
                    country: values.country,
                    line1: values.address,
                    postal_code: values.zipCode,
                    state: values.state
                }
            }
        }
        try {
            newUserData = await initUser({ role: 'AGENCY_OWNER' });

            const response = await upsertAgency({
                id: data?.id ? data.id : v4(),
                address: values.address,
                agencyLogo: values.agencyLogo,
                city: values.city,
                companyPhone: values.companyPhone,
                country: values.country,
                name: values.name,
                state: values.state,
                whiteLabel: values.whiteLabel,
                zipCode: values.zipCode,
                createdAt: new Date(),
                updatedAt: new Date(),
                companyEmail: values.companyEmail,
                connectAccountId: '',
                goal: 5,
            });
            toast({
                title: '创建成功',
            })
            if (data?.id) {
                return router.refresh();
            }
            if (response) {
                return router.refresh();
            }
        } catch (error) {
            console.log(error)
            toast({
                variant: 'destructive',
                title: 'Oppse!',
                description: 'could not create your agency',
            })
        }
    }

    const handleDeleteAgency = async () => {
        if (!data?.id) return
        setDeletingAgency(true)
        //WIP: discontinue the subscription
        try {
            const response = await deleteAgency(data.id)
            toast({
                title: 'Deleted Agency',
                description: 'Deleted your agency and all subaccounts',
            })
            router.refresh()
        } catch (error) {
            console.log(error)
            toast({
                variant: 'destructive',
                title: 'Oppse!',
                description: 'could not delete your agency ',
            })
        }
        setDeletingAgency(false)
    }

    const isLoading = form.formState.isSubmitting;

    return (
        <AlertDialog>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>组织信息</CardTitle>
                    <CardDescription>
                        让我们为您的企业创建一个组织，稍后您可以从组织设置选项卡编辑组织设置。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="agencyLogo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>LOGO</FormLabel>
                                        <FormControl>
                                            <FileUpload
                                                apiEndpoint="agencyLogo"
                                                onChange={field.onChange}
                                                value={field.value}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex md:flex-row gap-4">
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>名称</FormLabel>
                                            <FormControl>
                                                <Input placeholder="请输入机构名称" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="companyEmail"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>邮箱</FormLabel>
                                            <FormControl>
                                                <Input placeholder="请输入邮箱" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex md:flex-row gap-4">
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="companyPhone"
                                    render={({ field }) => {
                                        return (
                                            <FormItem className="flex-1">
                                                <FormLabel>手机号</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="请输入手机号"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )
                                    }}
                                />
                            </div>


                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="whiteLabel"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row justify-between items-center rounded-lg border gap-4 p-4">
                                        <div>
                                            <FormLabel>白标代理</FormLabel>
                                            <FormDescription>
                                                开启白标模式后，所有子账户默认会显示您的代理机构徽标。
                                                您可以通过子账户设置覆盖此功能。
                                            </FormDescription>
                                        </div>

                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}

                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>地址</FormLabel>
                                        <FormControl>
                                            <Input placeholder="请输入地址" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex md:flex-row gap-4">
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>城市</FormLabel>
                                            <FormControl>
                                                <Input placeholder="请输入城市" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>省份</FormLabel>
                                            <FormControl>
                                                <Input placeholder="请输入省份" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="zipCode"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>邮编</FormLabel>
                                            <FormControl>
                                                <Input placeholder="请输入邮编" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>国家</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="请输入国家"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {
                                data?.id && (
                                    <div className="flex flex-col gap-2">
                                        <FormLabel>制定一个目标</FormLabel>
                                        <FormDescription>
                                            ✨ 为您的机构制定一个目标。随着您的业务增长
                                            您的目标也会增长，所以不要忘记设定更高的标准！
                                        </FormDescription>
                                        <NumberInput
                                            defaultValue={data?.goal}
                                            onValueChange={async (value) => {
                                                if (!data?.id) {
                                                    return;
                                                }
                                                await updateAgencyDetails(data.id, { goal: value });
                                                await saveActivityLogsNotification({
                                                    agencyId: data.id,
                                                    description: `Updated the agency goal to | ${value} Sub Account`,
                                                    subaccountId: undefined
                                                });
                                                router.refresh();
                                            }}
                                        />
                                    </div>
                                )
                            }

                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loading /> : '保存'}
                            </Button>
                        </form>
                    </Form>
                    {data?.id && (
                        <div className="flex flex-row items-center justify-between rounded-lg border border-destructive gap-4 p-4 mt-4">
                            <div>
                                <div>Danger Zone</div>
                            </div>
                            <div className="text-muted-foreground">
                                Deleting your agency cannpt be undone. This will also delete all
                                sub accounts and all data related to your sub accounts. Sub
                                accounts will no longer have access to funnels, contacts etc.
                            </div>
                            <AlertDialogTrigger
                                disabled={isLoading || deletingAgency}
                                className="text-red-600 p-2 text-center mt-2 rounded-md hove:bg-red-600 hover:text-white whitespace-nowrap"
                            >
                                {deletingAgency ? 'Deleting...' : 'Delete Agency'}
                            </AlertDialogTrigger>
                        </div>
                    )}
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-left">
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-left">
                                This action cannot be undone. This will permanently delete the
                                Agency account and all related sub accounts.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex items-center">
                            <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                disabled={deletingAgency}
                                className="bg-destructive hover:bg-destructive"
                                onClick={handleDeleteAgency}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </CardContent>
            </Card>
        </AlertDialog>
    );
};

export default AgencyDetails;
