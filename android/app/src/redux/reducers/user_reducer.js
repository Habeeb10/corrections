import md5 from 'md5';
import {
    TOUR_DONE, USER_DATA, CLEAR_USER_DATA, USER_PWD, CLEAR_USER_PWD, USER_PIN, CLEAR_USER_PIN,
    START_LOAD_PROFILE, LOAD_PROFILE, LOAD_PROFILE_FAILED,
    UPDATE_APPLICATION, RESET_APPLICATION,
    REGISTER_SESSION_PROMPT, CLEAR_SESSION_PROMPT, SHOW_SESSION_DIALOG, HIDE_SESSION_DIALOG,
    START_LOAD_PREFERENCES, LOAD_PREFERENCES, LOAD_PREFERENCES_FAILED,
    START_LOAD_REFERRAL_ACTIVITIES, LOAD_REFERRAL_ACTIVITIES, LOAD_REFERRAL_ACTIVITIES_FAILED,
    SHOW_SCREEN_INACTIVITY_DIALOG, HIDE_SCREEN_INACTIVITY_DIALOG,
    ADD_REFERAL,
    START_REFERAL_CODE,
    LOAD_REFERAL_CODE,
    START_REFERAL_CODE_FAILED
} from '../types/user_types';

const initialState = {
    is_tour_done: false,
    user_data: {},
    wallet_id:"",
    referal_code:"",
    user_pwd: null,
    user_pin: null,
    loading_profile: false,
    profile_error: null,
    loan_application: {},
    session_timeout_ref: null,
    show_session_dialog: false,
    preferences: {},
    loading_preferences: false,
    preferences_error: null,
    loading_referral_code: false,
    referral_code_error: null,
    referal_code:"",
    loading_referral_activities: false,
    referral_activities: [],
    referral_activities_error: null,
    show_screen_inactivity_dialog: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case TOUR_DONE: {
            return {
                ...state,
                is_tour_done: true
            }
        }
        case USER_DATA: {
            let { user_data } = action;
            if (user_data.phoneNumber) {
                user_data.phone_hash = md5(user_data.phoneNumber);
            }
            return {
                ...state,
                user_data
            }
        }
        case CLEAR_USER_DATA: {
            if (state.session_timeout_ref) {
                clearTimeout(state.session_timeout_ref);
            }

            const { user_data } = state;
            let stripped_user_data = {
                phoneNumber: user_data.phoneNumber || null,
                phone_hash: user_data.phone_hash || null,
                first_name: user_data.first_name || null,
                activated: user_data.activated || null
            };
            return {
                ...state,
                session_timeout_ref: null,
                user_data: stripped_user_data
            }
        }
        case USER_PWD: {
            return {
                ...state,
                user_pwd: action.user_pwd
            }
        }
        case CLEAR_USER_PWD: {
            return {
                ...state,
                user_pwd: null
            }
        }
        case USER_PIN: {
            return {
                ...state,
                user_pin: action.user_pin
            }
        }
        case ADD_REFERAL: {
            return {
                ...state,
                referal_code: action.referal_code
            }
        }
        case CLEAR_USER_PIN: {
            return {
                ...state,
                user_pin: null
            }
        }
        case START_LOAD_PROFILE: {
            return {
                ...state,
                loading_profile: true,
                profile_error: null
            }
        }
        case LOAD_PROFILE: {
            // console.log("sdsdsd##dusdc",action.user_profile)
            // let user_data = { ...state.user_data, ...action.user_profile }
            let user_data = Object.assign(state.user_data, action.user_profile);
            let wallet_id = user_data.walletAccount;

            // let walletprod= action.user_profile.deposit.find(deposit=>deposit.productID=="MBW");
            // let wallet_id="";
            // if(walletprod){
            //     wallet_id=walletprod.ID;
            // }else{
            //     wallet_id=action.user_profile.deposit[0].ID
            // }


            return {
                ...state,
                user_data,
                wallet_id,
                loading_profile: false,
                profile_error: null
            }
        }
        case LOAD_PROFILE_FAILED: {
            return {
                ...state,
                loading_profile: false,
                profile_error: action.profile_error
            }
        }

        case START_REFERAL_CODE: {
            return {
                ...state,
                loading_referral_code: true,
                referral_code_error: null,
                referal_code:""
            }
        }
        case LOAD_REFERAL_CODE: {
            

            return {
                ...state,
                
                referal_code:action.referal_code,
                loading_referral_code: false,
                referral_code_error: null
            }
        }
        case START_REFERAL_CODE_FAILED: {
            return {
                ...state,
                loading_referral_code: false,
                referral_code_error: action.referral_code_error
            }
        }

        case UPDATE_APPLICATION: {
            let loan_application = { ...state.loan_application, ...action.application_data }
            return {
                ...state,
                loan_application
            }
        }
        case RESET_APPLICATION: {
            return {
                ...state,
                loan_application: {}
            }
        }
        case REGISTER_SESSION_PROMPT: {
            if (state.session_timeout_ref) {
                clearTimeout(state.session_timeout_ref);
            }

            return {
                ...state,
                session_timeout_ref: action.timeout_ref
            }
        }
        case CLEAR_SESSION_PROMPT: {
            if (state.session_timeout_ref) {
                clearTimeout(state.session_timeout_ref);
            }

            return {
                ...state,
                session_timeout_ref: null
            }
        }
        case SHOW_SESSION_DIALOG: {
            return {
                ...state,
                show_session_dialog: true
            }
        }
        case HIDE_SESSION_DIALOG: {
            return {
                ...state,
                show_session_dialog: false
            }
        }
        case START_LOAD_PREFERENCES: {
            return {
                ...state,
                loading_preferences: true,
                preferences_error: null
            }
        }
        case LOAD_PREFERENCES: {
            return {
                ...state,
                preferences: { ...action.preferences },
                loading_preferences: false,
                preferences_error: null
            }
        }
        case LOAD_PREFERENCES_FAILED: {
            return {
                ...state,
                loading_preferences: false,
                preferences_error: action.error_message
            }
        }
        case START_LOAD_REFERRAL_ACTIVITIES: {
            return {
                ...state,
                loading_referral_activities: true,
                referral_activities_error: null
            }
        }
        case LOAD_REFERRAL_ACTIVITIES: {
            return {
                ...state,
                referral_activities: [...action.referral_activities],
                loading_referral_activities: false,
                referral_activities_error: null
            }
        }
        case LOAD_REFERRAL_ACTIVITIES_FAILED: {
            return {
                ...state,
                referral_activities: [],
                loading_referral_activities: false,
                referral_activities_error: action.error_message
            }
        }
        case SHOW_SCREEN_INACTIVITY_DIALOG: {
            return {
                ...state,
                show_screen_inactivity_dialog: true,
            }
        }
        case HIDE_SCREEN_INACTIVITY_DIALOG: {
            return {
                ...state,
                show_screen_inactivity_dialog: false,
            }
        }
        default: {
            return state;
        }
    }
};