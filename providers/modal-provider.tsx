"use client"

import { Agency, Contact, User } from "@prisma/client";
import { createContext, useContext, useEffect, useState } from "react";


/**
 * 这个组件用于处理模态框的状态管理。
 * 它利用 Context 提供 isOpen 状态来决定模态框的打开与关闭，
 * 同时通过 setOpen 和 setClose 控制模态框的显示与隐藏。
 * 组件还允许通过传入的 fetchData 函数动态获取模态框需要的数据。
 */


type ModalProvider = {
    children: React.ReactNode
}


type ModalData = {
    user?: User;
    agency?: Agency;
    contact?: Contact;
}

type ModalContextType = {
    data: ModalData;
    isOpen: boolean;
    setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => void;
    setClose: () => void;
}
// 1. 创建上下文对象，提供默认值
export const ModalContext = createContext<ModalContextType>({
    data: {},
    isOpen: false,
    setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => { },
    setClose: () => { },
})

const ModalProvider: React.FC<ModalProvider> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<ModalData>({});
    const [showingModal, setShowingModal] = useState<React.ReactNode>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const setOpen = async (modal: React.ReactNode, fetchData?: () => Promise<any>) => {
        if (modal) {
            if (fetchData) {
                setData({ ...data, ...(await fetchData()) })
            }
            setShowingModal(modal);
            setIsOpen(true);
        }
    }

    const setClose = () => {
        setIsOpen(false);
        setData({});
    }

    if (!isMounted) {
        return null;
    }
    return (
        <ModalContext.Provider value={{
            data,
            isOpen,
            setOpen,
            setClose
        }}>
            {children}
            {showingModal}
        </ModalContext.Provider>
    )
}


export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider')
    }
    return context;
}

export default ModalProvider;
