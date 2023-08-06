import moment from "moment";
import { Util } from "_utils";

import {
  START_LOAD_USER_WALLET,
  LOAD_USER_WALLET,
  LOAD_USER_WALLET_FAILED,
  START_LOAD_WALLET_TRANSACTIONS,
  LOAD_WALLET_TRANSACTIONS,
  LOAD_WALLET_TRANSACTIONS_FAILED,
  LOAD_WALLET_TRANSACTIONS_DEBIT,
  LOAD_WALLET_TRANSACTIONS_CREDIT,
  START_LOAD_WALLET_TRANSACTIONS_DEBIT,
  LOAD_WALLET_TRANSACTIONS_DEBIT_FAILED,
  LOAD_WALLET_TRANSACTIONS_CREDIT_FAILED,
  START_LOAD_WALLET_TRANSACTIONS_CREDIT
} from "../types/wallet_types";

const initialState = {
  wallet_data: {},
  wallet_balance:0,
  wallet_info: {},
  transaction_data: [],
  loading_wallet_data: false,
  wallet_data_error: null,
  loading_wallet_transactions: false,
  wallet_transactions_error: null,
  transaction_groups: [],
  loading_wallet_transactions_debit: false,
  wallet_transactions_error_debit: null,
  transaction_groups_debit: [],
  loading_wallet_transactions_credit: false,
  wallet_transactions_error_credit: null,
  transaction_groups_credit: [],
  transaction_count: 0,
  last_transaction: true,
  last_transaction_credit: true,
  last_transaction_debit: true,
  recent_transactions: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case START_LOAD_USER_WALLET: {
      return {
        ...state,
        loading_wallet_data: true
      };
    }
    case LOAD_USER_WALLET: {
      let { savingsResponseDto } = action.wallet;
      let wallet_balance=savingsResponseDto.account.withdrawableBalance ?? savingsResponseDto?.account?.account.balance;
      // console.log("savingsResponseDto.account.withdrawableBalance",savingsResponseDto.account.withdrawableBalance)
      // wallet has too much info, let's strip and store only what we need. User storage space matters!
      return {
        ...state,
        wallet_info: savingsResponseDto.account.account,
        wallet_balance,
        transaction_data: savingsResponseDto.account.transactions,
        loading_wallet_data: false,
        wallet_data_error: null
      };
    }
    case LOAD_USER_WALLET_FAILED: {
      return {
        ...state,
        loading_wallet_data: false,
        wallet_data_error: action.error_message
      };
    }
    case START_LOAD_WALLET_TRANSACTIONS: {
      return {
        ...state,
        loading_wallet_transactions: true,
        wallet_transactions_error: null
      };
    }
    case LOAD_WALLET_TRANSACTIONS: {
      let transactions = action.wallet_transactions?.content ?? []
      let wallet_transactions = [...state.transaction_groups, ...transactions]
      
      // transactions.forEach(tranx => wallet_transactions.push(tranx))
     
      const transaction_groups = Util.removeDuplicates(wallet_transactions, 'id');
      // let wallet_transactions = [...state.transaction_groups, ...action.wallet_transactions?.content[0]];

      // wallet_transactions = wallet_transactions.sort(
      //   (a, b) => moment(b.transaction_date) - moment(a.transaction_date)
      // );

      // const transaction_count = wallet_transactions.length;
      // const recent_transactions = wallet_transactions.filter(
      //   (transaction, index) => {
      //     return index < 3;
      //   }
      // );
      // const transaction_groups =
      //   Util.dateGroupTransactions(wallet_transactions);

      return {
        ...state,
        transaction_groups,
        // recent_transactions,
        last_transaction: action.wallet_transactions?.last,
        loading_wallet_transactions: false,
        wallet_transactions_error: null
      };
    }
    case LOAD_WALLET_TRANSACTIONS_FAILED: {
      return {
        ...state,
        loading_wallet_transactions: false,
        wallet_transactions_error: action.error_message
      };
    }
    case START_LOAD_WALLET_TRANSACTIONS_DEBIT: {
      return {
        ...state,
        loading_wallet_transactions_debit: true,
        wallet_transactions_error_debit: null
      };
    }
    case LOAD_WALLET_TRANSACTIONS_DEBIT: {
      let transactions = action.wallet_transactions?.content ?? []
      let wallet_transactions = [...state.transaction_groups_debit, ...transactions]
      
      // transactions.forEach(tranx => wallet_transactions.push(tranx))
     
      const transaction_groups_debit = Util.removeDuplicates(wallet_transactions, 'id');

      return {
        ...state,
        transaction_groups_debit,
        last_transaction_debit: action.wallet_transactions?.last,
        loading_wallet_transactions_debit: false,
        wallet_transactions_error_debit: null
      };
    }
    case LOAD_WALLET_TRANSACTIONS_DEBIT_FAILED: {
      return {
        ...state,
        loading_wallet_transactions_debit: false,
        wallet_transactions_error_debit: action.error_message
      };
    }
    case START_LOAD_WALLET_TRANSACTIONS_CREDIT: {
      return {
        ...state,
        loading_wallet_transactions_credit: true,
        wallet_transactions_error_credit: null
      };
    } 
    case LOAD_WALLET_TRANSACTIONS_CREDIT: {
      let transactions = action.wallet_transactions?.content ?? []
      let wallet_transactions = [...state.transaction_groups_credit, ...transactions]
      
      // transactions.forEach(tranx => wallet_transactions.push(tranx))
     
      const transaction_groups_credit = Util.removeDuplicates(wallet_transactions, 'id');

      return {
        ...state,
        transaction_groups_credit,
        last_transaction_credit: action.wallet_transactions?.last,
        loading_wallet_transactions_credit: false,
        wallet_transactions_error_credit: null
      };
    }
    case LOAD_WALLET_TRANSACTIONS_CREDIT_FAILED: {
      return {
        ...state,
        loading_wallet_transactions_credit: false,
        wallet_transactions_error_credit: action.error_message
      };
    }
    default: {
      return state;
    }
  }
};
