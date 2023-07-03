import { START_LOAD_DOCS, LOAD_DOCS, LOAD_DOCS_FAILED } from '../types/document_types';

const initialState = {
    loading: false,
    items: [],
    error_message: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case START_LOAD_DOCS: {
            return {
                ...state,
                loading: true,
                error_message: null
            }
        }
        case LOAD_DOCS: {
            return {
                ...state,
                items: [...action.documents],
                loading: false,
                error_message: null
            }
        }
        case LOAD_DOCS_FAILED: {
            return {
                ...state,
                items: [],
                loading: false,
                error_message: action.error_message
            }
        }
        default: {
            return state;
        }
    }
};