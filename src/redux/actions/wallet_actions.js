import {
    START_LOAD_USER_WALLET, LOAD_USER_WALLET, LOAD_USER_WALLET_FAILED,
    START_LOAD_WALLET_TRANSACTIONS, LOAD_WALLET_TRANSACTIONS, LOAD_WALLET_TRANSACTIONS_FAILED
} from '../types/wallet_types';

import { Network } from '_services';

export const getUserWallet = (id) => {
    console.log("wallet id",id)
    return dispatch => {
        dispatch({
            type: START_LOAD_USER_WALLET
        });

        Network.getUserWalletData(id)
       // .then(response => response.json())
            .then(({data}) => {
               // console.log({v_Account: wallet_result.data.virtual_accounts}, '123v_aaa_wallet_result');
                dispatch({
                    wallet: data.data,
                    type: LOAD_USER_WALLET
                });
                // dispatch({
                //     type: START_LOAD_WALLET_TRANSACTIONS
                // });

                
            }).catch((error) => {
                dispatch({
                    type: LOAD_USER_WALLET_FAILED,
                    error_message: error.message
                });
            });
    };
};


// export const getUserWallet = (id) => {
//     return dispatch => {
//         dispatch({
//             type: START_LOAD_USER_WALLET
//         });

//         Network.getUserWalletData(id)
//             .then((wallet_result) => {
//                 console.log({wallet_result}, '123wallet_result');
//                 console.log({v_Account: wallet_result.data.virtual_accounts}, '123v_aaa_wallet_result');
//                 dispatch({
//                     wallet: wallet_result.data,
//                     type: LOAD_USER_WALLET
//                 });
//                 dispatch({
//                     type: START_LOAD_WALLET_TRANSACTIONS
//                 });

//                 Network.getAccountTransactions(wallet_result.data.account_no)
//                     .then((transaction_result) => {
//                         dispatch({
//                             wallet_transactions: transaction_result.data.transactions,
//                             type: LOAD_WALLET_TRANSACTIONS
//                         })
//                     }).catch((error) => {
//                         if (error.http_status === 404) {
//                             dispatch({
//                                 wallet_transactions: [],
//                                 type: LOAD_WALLET_TRANSACTIONS
//                             })
//                         } else {
//                             dispatch({
//                                 type: LOAD_WALLET_TRANSACTIONS_FAILED,
//                                 error_message: error.message
//                             });
//                         }
//                     });
//             }).catch((error) => {
//                 dispatch({
//                     type: LOAD_USER_WALLET_FAILED,
//                     error_message: error.message
//                 });
//             });
//     };
// };


export const getWalletTransactions = (account_no) => {
    return dispatch => {
        dispatch({
            type: START_LOAD_WALLET_TRANSACTIONS
        });

        Network.getAccountTransactions(account_no)
            .then((transaction_result) => {
                dispatch({
                    wallet_transactions: transaction_result.data.transactions,
                    type: LOAD_WALLET_TRANSACTIONS
                })
            }).catch((error) => {
                if (error.http_status === 404) {
                    dispatch({
                        wallet_transactions: [],
                        type: LOAD_WALLET_TRANSACTIONS
                    })
                } else {
                    dispatch({
                        type: LOAD_WALLET_TRANSACTIONS_FAILED,
                        error_message: error.message
                    });
                }
            });
    };
};