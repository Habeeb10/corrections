import AsyncStorage from '@react-native-community/async-storage';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import thunk from 'redux-thunk';

import rootReducer from '../reducers/index';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: [ // Survives application close
        'user',
        'settings',
        // 'wallet',
        'notifications'
    ],
    blacklist: [ // Does not survive application close
        'config',
        'util',
        'toast',
        'documents',
        'next_of_kin',
        'payment',
        'savings',
        'loans',
        'data',
        'airtime',
        'bills',
        'transfers',
        'transactions'
    ],
    throttle: 1000
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = createStore(
    persistedReducer,
    applyMiddleware(
        // createLogger(),
        thunk
    )
);
let persistor = persistStore(store);

export { store, persistor };