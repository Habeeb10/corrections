import {
    START_LOAD_CARDS, LOAD_CARDS, LOAD_CARDS_FAILED,
    START_LOAD_ACCOUNTS, LOAD_ACCOUNTS, LOAD_ACCOUNTS_FAILED
} from '../types/payment_types';

const initialState = {
    cards: [],
    loading_cards: false,
    cards_error: null,
    accounts: [],
    loading_accounts: false,
    accounts_error: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case START_LOAD_CARDS: {
            return {
                ...state,
                loading_cards: true,
                cards_error: null
            }
        }
        case LOAD_CARDS: {
            return {
                ...state,
                cards: [...action.cards],
                loading_cards: false,
                cards_error: null
            }
        }
        case LOAD_CARDS_FAILED: {
            return {
                ...state,
                loading_cards: false,
                cards_error: action.error_message
            }
        }
        case START_LOAD_ACCOUNTS: {
            return {
                ...state,
                loading_accounts: true,
                accounts_error: null
            }
        }
        case LOAD_ACCOUNTS: {
            return {
                ...state,
                accounts: [...action.accounts],
                loading_accounts: false,
                accounts_error: null
            }
        }
        case LOAD_ACCOUNTS_FAILED: {
            return {
                ...state,
                loading_accounts: false,
                accounts_error: action.error_message
            }
        }
        default: {
            return state;
        }
    }
};