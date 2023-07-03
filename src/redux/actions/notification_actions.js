import {
    START_LOAD_NOTIFICATIONS, LOAD_NOTIFICATIONS, LOAD_NOTIFICATIONS_FAILED,
    SAVE_NOTIFICATION, MARK_NOTIFICATION_READ, ADD_NOTIFICATION, REMOVE_NOTIFICATION
} from '../types/notification_types';

import { Network } from '_services';

export const syncNotifications = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_NOTIFICATIONS
        });

        Network.getPushNotifications()
            .then((result) => {
                dispatch({
                    notifications: result.data,
                    type: LOAD_NOTIFICATIONS
                })
            }).catch((error) => {
                dispatch({
                    type: LOAD_NOTIFICATIONS_FAILED,
                    error_message: error.message
                });
            });
    };
};

export const saveNotification = (remoteMessage) => {
    return dispatch => {
        dispatch({
            type: SAVE_NOTIFICATION,
            remoteMessage
        });
    };
}

export const markNotificationAsRead = (notification_id) => {
    return dispatch => {
        dispatch({
            type: MARK_NOTIFICATION_READ,
            notification_id
        });
    };
}

export const addNotification = (notification) => {
    return dispatch => {
        dispatch({
            type: ADD_NOTIFICATION,
            payload: notification,
        });
    };
};

export const removeNotification = (notification) => {
    return dispatch => {
        dispatch({
            type: REMOVE_NOTIFICATION,
            payload: notification,
        });
    };
};