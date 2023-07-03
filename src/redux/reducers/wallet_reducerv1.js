import moment from 'moment';
import { Util } from '_utils';

import {
    START_LOAD_USER_WALLET, LOAD_USER_WALLET, LOAD_USER_WALLET_FAILED,
    START_LOAD_WALLET_TRANSACTIONS, LOAD_WALLET_TRANSACTIONS, LOAD_WALLET_TRANSACTIONS_FAILED
} from '../types/wallet_types';

const initialState = {
    wallet_data: {},
    loading_wallet_data: false,
    wallet_data_error: null,
    loading_wallet_transactions: false,
    wallet_transactions_error: null,
    transaction_groups: [],
    transaction_count: 0,
    recent_transactions: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case START_LOAD_USER_WALLET: {
            return {
                ...state,
                loading_wallet_data: true
            }
        }
        case LOAD_USER_WALLET: {
            let { wallet } = action;

            // wallet has too much info, let's strip and store only what we need. User storage space matters!
            let wallet_data = {
                id: wallet.id,
                account_name: wallet.account_name,
                account_no: wallet.account_no,
                account_balance: wallet.account_balance,
                balance_last_upated: wallet.balance_last_upated,
                virtual_accounts: []
            };

            wallet.virtual_accounts.forEach(virtual_account => {
                wallet_data.virtual_accounts.push({
                    id: virtual_account.id,
                    bank_name: virtual_account.bank_name,
                    account_name: virtual_account.account_name,
                    account_number: virtual_account.account_number,
                    account_type: virtual_account.account_type
                });
            });

            return {
                ...state,
                wallet_data,
                loading_wallet_data: false,
                wallet_data_error: null
            }
        }
        case LOAD_USER_WALLET_FAILED: {
            return {
                ...state,
                loading_wallet_data: false,
                wallet_data_error: action.error_message
            }
        }
        case START_LOAD_WALLET_TRANSACTIONS: {
            return {
                ...state,
                loading_wallet_transactions: true,
                wallet_transactions_error: null
            }
        }
        case LOAD_WALLET_TRANSACTIONS: {
            let wallet_transactions = [...action.wallet_transactions];
            // wallet_transactions = wallet_transactions.reverse();
            wallet_transactions = wallet_transactions.sort((a, b) =>
                moment(b.transaction_date) - moment(a.transaction_date)
            );

            const transaction_count = wallet_transactions.length;
            const recent_transactions = wallet_transactions.filter((transaction, index) => {
                return index < 3;
            });
            const transaction_groups = Util.dateGroupTransactions(wallet_transactions);

            return {
                ...state,
                transaction_groups,
                transaction_count,
                recent_transactions,
                loading_wallet_transactions: false,
                wallet_transactions_error: null
            }
        }
        case LOAD_WALLET_TRANSACTIONS_FAILED: {
            return {
                ...state,
                loading_wallet_transactions: false,
                wallet_transactions_error: action.error_message
            }
        }
        default: {
            return state;
        }
    }
};