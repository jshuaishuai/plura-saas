import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { getAuthUserDetails } from "@/lib/queries";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CommandEmpty, CommandGroup } from "@/components/ui/command";
import Link from "next/link";
import Image from 'next/image'

import { SubAccount } from "@prisma/client";
import { Button } from "@/components/ui/button";
import CreateSubaccount from "./_components/create-subaccount";
import DeleteSubaccount from "./_components/delete-subaccount";


type Props = {
    params: {
        agencyId: string
    }
}

const AllSubaccountPage = async ({ params }: Props) => {


    const user = await getAuthUserDetails();
    console.log('%c [ user ]-22', 'font-size:13px; background:pink; color:#bf2c9f;', user)
    if (!user) {
        return;
    }


    return (
        <AlertDialog>
            <div className="flex flex-col">
                {/* 创建子租户按钮 */}
                <CreateSubaccount
                    user={user}
                    className="w-[200px] self-end m-6"
                />
                <Command>
                    <CommandInput placeholder="搜索" />
                    <CommandList>
                        <CommandEmpty>No accounts found.</CommandEmpty>
                        <CommandGroup heading="Sub Accounts">
                            {
                                !!user.Agency?.SubAccount.length ? (
                                    user.Agency.SubAccount.map((subaccount: SubAccount) => (
                                        <CommandItem
                                            key={subaccount.id}
                                            className="h-32 !bg-background my-2 text-primary border-[1px] border-border p-4 rounded-lg hover:!bg-background cursor-pointer transition-all"
                                        >
                                            <Link
                                                href={`/subaccount/${subaccount.id}`}
                                                className="flex gap-4 w-full h-full"
                                            >
                                                <div className="relative w-32">
                                                    <Image src={subaccount.subAccountLogo} alt="subaccount logo" fill className="rounded-md object-contain bg-muted/50 p-4" />
                                                </div>

                                                <div className="flex flex-col justify-between">
                                                    <div className="flex flex-col">
                                                        {subaccount.name}
                                                        <span className="text-muted-foreground text-xs">
                                                            {subaccount.address}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>

                                            <AlertDialogTrigger>
                                                <Button variant="destructive">删除</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete your account
                                                        and remove your data from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                                    <AlertDialogAction className="bg-destructive hover:bg-destructive">
                                                        <DeleteSubaccount subaccountId={subaccount.id} />
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </CommandItem>
                                    ))

                                ) : (<></>)
                            }
                        </CommandGroup>
                    </CommandList>
                </Command>
            </div>
        </AlertDialog>
    );
};

export default AllSubaccountPage;
