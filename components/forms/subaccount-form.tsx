"use client"
import { Agency, SubAccount } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NumberInput } from '@tremor/react';
import { useRouter } from 'next/navigation';
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import FileUpload from "@/components/global/file-upload";
import { Input } from "@/components/ui/input";
import { v4 } from 'uuid';


import { Switch } from '../ui/switch'
import { Button } from "../ui/button";
import Loading from '../global/loading';
import { useToast } from '../ui/use-toast';

import { initUser, saveActivityLogsNotification, updateAgencyDetails, upsertAgency, upsertSubAccount } from '@/lib/queries'
import { useModal } from "@/providers/modal-provider";


const formSchema = z.object({
    name: z.string(),
    companyEmail: z.string(),
    companyPhone: z.string().min(1),
    address: z.string(),
    city: z.string(),
    subAccountLogo: z.string(),
    zipCode: z.string(),
    state: z.string(),
    country: z.string(),
})


interface AgencyDetailsProps {
    agencyDetails: Agency;
    details?: Partial<SubAccount>;
    userId: string;
    userName: string;
}

const SubaccountDetails = ({
    agencyDetails,
    details,
    userId,
    userName
}: AgencyDetailsProps) => {
    const router = useRouter();
    const { toast } = useToast();
    const { setClose } = useModal()

    const form = useForm<z.infer<typeof formSchema>>({
        mode: 'onChange',
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: details?.name,
            companyEmail: details?.companyEmail,
            companyPhone: details?.companyPhone,
            address: details?.address,
            city: details?.city,
            zipCode: details?.zipCode,
            state: details?.state,
            country: details?.country,
            subAccountLogo: details?.subAccountLogo,
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values);
        try {
            const response = await upsertSubAccount({
                id: details?.id ? details.id : v4(),
                address: values.address,
                subAccountLogo: values.subAccountLogo,
                city: values.city,
                companyPhone: values.companyPhone,
                country: values.country,
                name: values.name,
                state: values.state,
                zipCode: values.zipCode,
                createdAt: new Date(),
                updatedAt: new Date(),
                companyEmail: values.companyEmail,
                agencyId: agencyDetails.id,
                connectAccountId: '',
                goal: 5000,
            });
            if (!response) {
                throw new Error('No response from server');
            }
            await saveActivityLogsNotification({
                agencyId: response.agencyId,
                description: `${userName} | updated sub account | ${response.name}`,
                subaccountId: response.id
            });

            toast({
                title: '创建成功',
                description: '已创建代理机构',
            });

            setClose();
            router.refresh();
        } catch (error) {
            toast({
                title: '创建失败',
                description: '请重试',
            })
        }
    }

    const isLoading = form.formState.isSubmitting;

    return (
        <AlertDialog>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>机构信息</CardTitle>
                    <CardDescription>
                        让我们为您的企业创建一个代理机构。稍后您可以从代理机构设置选项卡编辑代理机构设置。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="subAccountLogo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>机构LOGO</FormLabel>
                                        <FormControl>
                                            <FileUpload
                                                apiEndpoint="subAccountLogo"
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
                                            <FormLabel>市区</FormLabel>
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
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loading /> : '保存'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AlertDialog>
    );
};

export default SubaccountDetails;
