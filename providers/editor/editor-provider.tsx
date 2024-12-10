"use client"
import { FunnelPage } from "@prisma/client";
import { createContext, useContext, useReducer } from "react";
import { EditorAction, EditorState } from "@/providers/editor/editor-types";

const initialEditorState: EditorState['editor'] = {
    elements: [
        {
            content: [],
            id: '__body',
            name: 'Body',
            styles: {},
            type: '__body'
        }
    ],
    selectElement: {
        id: '',
        content: [],
        name: '',
        styles: {},
        type: null,
    },
    device: 'Desktop',
    previewMode: false,
    liveMode: false,
    funnelPageId: '',
}

const initialHistoryState = {
    history: [initialEditorState],
    currentIndex: 0,
}

const initialState: EditorState = {
    editor: initialEditorState,
    history: initialHistoryState,
}

export const EditorContext = createContext<{
    state: EditorState,
    dispatch: React.Dispatch<EditorAction>,
    subaccountId: string,
    funnelId: string,
    pageDetails: FunnelPage | null
}>({
    state: initialState,
    dispatch: () => undefined,
    subaccountId: '',
    funnelId: '',
    pageDetails: null,
})

const editorReducer = (state: EditorState, action: EditorAction) => {

    switch (action.type) {
        case 'ADD_ELEMENT':

        case 'UPDATE_ELEMENT':

        case 'DELETE_ELEMENT':

        case 'CHANGE_CLICKED_ELEMENT':

        case 'CHANGE_DEVICE':
            return {
                ...state,
                editor: {
                    ...state.editor,
                    device: action.payload.device
                },
            }

        case 'TOGGLE_PREVIEW_MODE':
            return {
                ...state,
                editor: {
                    ...state.editor,
                    previewMode: !state.editor.previewMode
                }
            }
        case 'TOGGLE_LIVE_MODE':
            return {
                ...state,
                editor: {
                    ...state.editor,
                    liveMode: action.payload?.value ?? !state.editor.liveMode
                }
            }
        case 'REDO':

        case 'UNDO':

        case 'LOAD_DATA':

        case 'SET_FUNNEL_PAGE_ID':
        default:
            return state
    }

}

type EditorProps = {
    children: React.ReactNode,
    subaccountId: string,
    funnelId: string,
    pageDetails: FunnelPage
}

const EditorProvider = (props: EditorProps) => {
    const [state, dispatch] = useReducer(editorReducer, initialState)

    return <EditorContext.Provider
        value={{
            state,
            dispatch,
            subaccountId: props.subaccountId,
            funnelId: props.funnelId,
            pageDetails: props.pageDetails
        }}
    >
        {props.children}
    </EditorContext.Provider>
}

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within a EditorProvider')
    }
    return context;
}

export default EditorProvider;

