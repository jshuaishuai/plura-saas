import { EditorBtns } from "@/lib/constant";

export type DeviceTypes = 'Desktop' | 'Mobile' | 'Tablet'


export type EditorElement = {
    id: string
    name: string
    content: EditorElement[] | { href?: string; innerText?: string; src?: string }
    styles: React.CSSProperties
    type: EditorBtns
}

export type Editor = {
    elements: EditorElement[]
    selectElement: EditorElement
    device: DeviceTypes
    previewMode: boolean
    liveMode: boolean
    funnelPageId: string
}

export type History = {
    history: Editor[]
    currentIndex: number
}

export type EditorState = {
    editor: Editor
    history: History
}


export type EditorAction =
    | {
        type: 'ADD_ELEMENT' // 添加元素
        payload?: any
    }
    | {
        type: 'UPDATE_ELEMENT', // 更新元素
        payload?: any
    }
    | {
        type: 'DELETE_ELEMENT', // 删除元素
        payload?: any
    }
    | {
        type: 'CHANGE_CLICKED_ELEMENT', // 切换选中元素
        payload?: any
    }
    | {
        type: 'CHANGE_DEVICE', // 切换设备
        payload: {
            device: DeviceTypes
        }
    }
    | {
        type: 'TOGGLE_PREVIEW_MODE' // 切换预览模式
    }
    | {
        type: 'TOGGLE_LIVE_MODE', // 切换实时模式
        payload?: {
            value: boolean
        }
    }
    | {
        type: 'REDO' // 重做
    }
    | {
        type: 'UNDO' // 撤销
    }
    | {
        type: 'LOAD_DATA' // 加载数据
    } 
    | {
        type: 'SET_FUNNEL_PAGE_ID' // 设置 funnelPageId
    }
