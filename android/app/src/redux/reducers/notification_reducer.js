import {
    START_LOAD_NOTIFICATIONS, LOAD_NOTIFICATIONS, LOAD_NOTIFICATIONS_FAILED,
    SAVE_NOTIFICATION, MARK_NOTIFICATION_READ, ADD_NOTIFICATION, REMOVE_NOTIFICATION
} from '../types/notification_types';

const initialState = {
    user_notifications: [],
    loading_notifications: false,
    notifications_error: null
};

export const processNotification = (notification_data, notifications) => {
    let duplicate = notifications.find(notification => notification_data.id.endsWith(notification.id));
    if (!duplicate) {
        notifications.unshift({
            ...notification_data
        });
    }

    return notifications;
}

export default (state = initialState, action) => {
    switch (action.type) {
        case START_LOAD_NOTIFICATIONS: {
            return {
                ...state,
                loading_notifications: true
            }
        }
        case LOAD_NOTIFICATIONS: {
            let user_notifications = state.user_notifications;
            let notification_data = [...action.notifications];
            notification_data.forEach(server_data => {
                let notification = {
                    id: server_data.message_id,
                    title: server_data.title,
                    description: server_data.body,
                    timestamp: server_data.sent_time || Date.now(),
                    is_read: true
                };
                user_notifications = processNotification(notification, user_notifications);
            });

            return {
                ...state,
                user_notifications,
                loading_notifications: false,
                notifications_error: null
            }
        }
        case LOAD_NOTIFICATIONS_FAILED: {
            return {
                ...state,
                loading_notifications: false,
                notifications_error: action.error_message
            }
        }
        case SAVE_NOTIFICATION: {
            let notification = {
                id: action.remoteMessage.messageId,
                title: action.remoteMessage.notification.title,
                description: action.remoteMessage.notification.body,
                timestamp: action.remoteMessage.sentTime,
                is_read: false
            };

            return {
                ...state,
                user_notifications: processNotification(notification, state.user_notifications)
            }
        }
        case MARK_NOTIFICATION_READ: {
            let user_notifications = state.user_notifications;
            user_notifications.forEach(notification => {
                if (notification.id === action.notification_id) {
                    notification.is_read = true;
                }
            });

            return {
                ...state,
                user_notifications
            }
        }
        case ADD_NOTIFICATION: {
            //return { ...state, user_notifications: [...state.user_notifications, action.payload] };
            let user_notifications = state.user_notifications ?? [];
            return {
              ...state,
              user_notifications: user_notifications.concat(action.payload),
            };
          }
        case REMOVE_NOTIFICATION: {
            let user_notifications = state.user_notifications.filter(
              (notification) => notification.id !== action.payload.id
            );
      
            return {
              ...state,
              user_notifications,
            };
        }
        default: {
            return state;
        }
    }
};