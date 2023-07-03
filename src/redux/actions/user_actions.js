import {
    TOUR_DONE, USER_DATA, CLEAR_USER_DATA, USER_PWD, CLEAR_USER_PWD, USER_PIN, CLEAR_USER_PIN,
    START_LOAD_PROFILE, LOAD_PROFILE, LOAD_PROFILE_FAILED,
    UPDATE_APPLICATION, RESET_APPLICATION,
    REGISTER_SESSION_PROMPT, CLEAR_SESSION_PROMPT, SHOW_SESSION_DIALOG, HIDE_SESSION_DIALOG,
    START_LOAD_PREFERENCES, LOAD_PREFERENCES, LOAD_PREFERENCES_FAILED,
    START_LOAD_REFERRAL_ACTIVITIES, LOAD_REFERRAL_ACTIVITIES, LOAD_REFERRAL_ACTIVITIES_FAILED, 
    SHOW_SCREEN_INACTIVITY_DIALOG, HIDE_SCREEN_INACTIVITY_DIALOG,ADD_REFERAL, START_REFERAL_CODE, LOAD_REFERAL_CODE, START_REFERAL_CODE_FAILED
} from '../types/user_types';

import { store } from '../store/index';
import { Network } from '_services';
import { NavigatorService } from '_services';

const dispatchSessionListener = (dispatch, user_data) => {
    let timeout = 900000; // 15 minutes
    if (user_data.expires_in) {
        // timeout = user_data.expires_in * 1000;
    }
    let timeout_ref = setTimeout(() => {
        // dispatch(hideScreenInactivityDialog());
        // NavigatorService.navigate('Login');
        dispatch(showSessionDialog());
    }, timeout);

    dispatch({
        type: REGISTER_SESSION_PROMPT,
        timeout_ref
    });
}

export const setTourDone = () => {
    return dispatch => {
        dispatch({
            type: TOUR_DONE
        })
    };
};

export const setReferalCode = (referal_code) => {
    return dispatch => {
        dispatch({
            type: ADD_REFERAL,
            referal_code
        })
    };
};


export const storeUserData = (user_data) => {
    return dispatch => {
        dispatch({
            type: USER_DATA,
            user_data
        })
    };
};

export const clearUserData = () => {
    return dispatch => {
        dispatch({
            type: CLEAR_USER_DATA
        })
    };
};

export const storeUserPwd = (user_pwd) => {
    return dispatch => {
        dispatch({
            type: USER_PWD,
            user_pwd
        })
    };
};

// export const storeAuthMobileData = (mobile) => {
//     return dispatch => {
//         dispatch({
//             type: USER_PWD,
//             mobile
//         })
//     };
// };

export const clearUserPwd = () => {
    return dispatch => {
        dispatch({
            type: CLEAR_USER_PWD
        })
    };
};

export const storeUserPin = (user_pin) => {
    return dispatch => {
        dispatch({
            type: USER_PIN,
            user_pin
        })
    };
};

export const clearUserPin = () => {
    return dispatch => {
        dispatch({
            type: CLEAR_USER_PIN
        })
    };
};

export const getUserProfile = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_PROFILE
        });
        Network.getUserProfile()
            .then((result) => {
                dispatch({
                    user_profile: result.customerDetails,
                    type: LOAD_PROFILE
                })
            })
            .catch((error) => {
                dispatch({
                    type: LOAD_PROFILE_FAILED,
                    profile_error: error.message
                });
            });
    };
};

export const getReferalCode = () => {
    return dispatch => {
        dispatch({
            type: START_REFERAL_CODE
        });
        Network.getReferalCode()
            .then((result) => {
                dispatch({
                    referal_code: result.referralCode,
                    type: LOAD_REFERAL_CODE
                })
            })
            .catch((error) => {
                dispatch({
                    type: START_REFERAL_CODE_FAILED,
                    referral_code_error: error.message
                });
            });
    };
};

export const updateLoanApplicationData = (application_data) => {
    return dispatch => {
        dispatch({
            type: UPDATE_APPLICATION,
            application_data
        });
    };
}

export const resetLoanApplicationData = () => {
    return dispatch => {
        dispatch({
            type: RESET_APPLICATION
        });
    };
}

export const registerSessionListener = (user_data) => {
    return function (dispatch) {
        dispatchSessionListener(dispatch, user_data);
    };
}

export const removeSessionListener = () => {
    return dispatch => {
        dispatch({
            type: CLEAR_SESSION_PROMPT
        });
    };
};

export const showSessionDialog = () => {
    return dispatch => {
        dispatch({
            type: SHOW_SESSION_DIALOG
        });
    };
};

export const hideSessionDialog = () => {
    return dispatch => {
        dispatch({
            type: HIDE_SESSION_DIALOG
        });
    };
};

export const showScreenInactivityDialog = () => {
    return dispatch => {
        dispatch({
            type: SHOW_SCREEN_INACTIVITY_DIALOG
        });
    };
};

export const hideScreenInactivityDialog = () => {
    return dispatch => {
        dispatch({
            type: HIDE_SCREEN_INACTIVITY_DIALOG
        });
    };
}

export const refreshUserToken = () => {
    return dispatch => {
        let user_data = store.getState().user.user_data;
        Network.refreshToken(user_data.refresh_token)
            .then((result) => {
                user_data.token = result.data.access_token
                dispatch({
                    type: USER_DATA,
                    user_data
                });
                dispatchSessionListener(dispatch, user_data);
            }).catch((ignore) => {
            });
    };
};

export const getOrgPreferences = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_PREFERENCES
        });
        Network.getOrganizationPreferences()
            .then((result) => {
                dispatch({
                    preferences: result.data,
                    type: LOAD_PREFERENCES
                })
            }).catch((error) => {
                dispatch({
                    type: LOAD_PREFERENCES_FAILED,
                    error_message: error.message
                });
            });
    };
};

export const getReferralActivities = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_REFERRAL_ACTIVITIES
        });
        Network.getUserReferralActivities()
            .then((result) => {
                dispatch({
                    referral_activities: result.data,
                    type: LOAD_REFERRAL_ACTIVITIES
                })
            }).catch((error) => {
                dispatch({
                    type: LOAD_REFERRAL_ACTIVITIES_FAILED,
                    referral_activities_error: error.message
                });
            });
    };
}