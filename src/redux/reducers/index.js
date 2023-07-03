import { combineReducers } from 'redux';

import configReducer from './config_reducer';
import userReducer from './user_reducer';
import settingsReducer from './settings_reducer';
import utilReducer from './util_reducer';
import toastReducer from './toast_reducer';
import documentReducer from './document_reducer';
import nextOfKinReducer from './next_of_kin_reducer';
import paymentReducer from './payment_reducer';
import savingsReducer from './savings_reducer';
import loanReducer from './loan_reducer';
import dataReducer from './data_reducer';
import airtimeReducer from './airtime_reducer';
import billsReducer from './bills_reducer';
import transferReducer from './transfer_reducer';
import walletReducer from './wallet_reducer';
import transactionReducer from './transaction_reducer';
import notificationReducer from './notification_reducer';
import informationReducer from './information_reducer';

const rootReducer = combineReducers({
    config: configReducer,
    user: userReducer,
    settings: settingsReducer,
    util: utilReducer,
    toast: toastReducer,
    documents: documentReducer,
    next_of_kin: nextOfKinReducer,
    payment: paymentReducer,
    savings: savingsReducer,
    loans: loanReducer,
    data: dataReducer,
    airtime: airtimeReducer,
    bills: billsReducer,
    transfers: transferReducer,
    wallet: walletReducer,
    transactions: transactionReducer,
    notifications: notificationReducer,
    information: informationReducer
});

export default rootReducer;