import moment from "moment";
import { Util } from "_utils";

import {
  START_LOAD_USER_WALLET,
  LOAD_USER_WALLET,
  LOAD_USER_WALLET_FAILED,
  START_LOAD_WALLET_TRANSACTIONS,
  LOAD_WALLET_TRANSACTIONS,
  LOAD_WALLET_TRANSACTIONS_FAILED
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
  transaction_count: 0,
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
      let wallet_transactions = [...action.wallet_transactions];
      // wallet_transactions = wallet_transactions.reverse();
      wallet_transactions = wallet_transactions.sort(
        (a, b) => moment(b.transaction_date) - moment(a.transaction_date)
      );

      const transaction_count = wallet_transactions.length;
      const recent_transactions = wallet_transactions.filter(
        (transaction, index) => {
          return index < 3;
        }
      );
      const transaction_groups =
        Util.dateGroupTransactions(wallet_transactions);

      return {
        ...state,
        transaction_groups,
        transaction_count,
        recent_transactions,
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
    default: {
      return state;
    }
  }
};
