import { Image } from 'react-native';
import {
    START_LOAD_DROPDOWN, LOAD_DROPDOWN, LOAD_DROPDOWN_FAILED,
    START_LOAD_BANKS, LOAD_BANKS, LOAD_BANKS_FAILED,
    START_LOAD_STATES, LOAD_STATES, LOAD_STATES_FAILED,
    START_LOAD_LGA, LOAD_LGA, LOAD_LGA_FAILED
} from '../types/config_types';

const initialState = {
    options: [],
    loading_options: false,
    options_error: null,
    banks: [],
    loading_banks: false,
    banks_error: null,
    states: [],
    loading_states: false,
    states_error: null,
    lgas: [],
    loading_lgas: false,
    lgas_error: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case START_LOAD_DROPDOWN: {
            return {
                ...state,
                loading_options: true,
                options_error: null
            }
        }
        case LOAD_DROPDOWN: {
            let options_data = [...action.options];
            let options = options_data.filter(option => {
                return option.key === 'gender'
                    || option.key === 'marital-status'
                    || option.key === 'relationship';
            });

            return {
                ...state,
                options,
                loading_options: false,
                options_error: null
            }
        }
        case LOAD_DROPDOWN_FAILED: {
            return {
                ...state,
                loading_options: false,
                options_error: action.error_message
            }
        }
        case START_LOAD_BANKS: {
            return {
                ...state,
                loading_banks: true,
                banks_error: null
            }
        }
        case LOAD_BANKS: {
            let bank_data = [...action.banks];
            let banks = [];

            bank_data.forEach(bank => {
                try {
                    Image.prefetch(bank.institutionLogo||"");
                } catch (error) {
                    console.log(JSON.stringify(error, null, 4));
                }

                banks.push({
                    id: bank.id||1,
                    additional_code: bank.institutionCode,
                    code_description: bank.code_description||"",
                    url: bank.institutionLogo||"",
                    name:bank.institutionName,
                    link_id: bank.link_id||""
                });
            });

            return {
                ...state,
                banks,
                loading_banks: false,
                banks_error: null
            }
        }
        case LOAD_BANKS_FAILED: {
            return {
                ...state,
                loading_banks: false,
                banks_error: action.error_message
            }
        }
        case START_LOAD_STATES: {
            return {
                ...state,
                loading_states: true,
                states_error: null
            }
        }
        case LOAD_STATES: {
            let state_data = [...action.options];
            let states = [];

            state_data.forEach(state => {
                states.push({
                    id: state.id,
                    code_description: state.code_description,
                    ref_code: state.ref_code,
                    link_id: state.link_id
                });
            });

            return {
                ...state,
                states,
                loading_states: false,
                states_error: null
            }
        }
        case LOAD_STATES_FAILED: {
            return {
                ...state,
                loading_states: false,
                states_error: action.error_message
            }
        }
        case START_LOAD_LGA: {
            return {
                ...state,
                loading_lgas: true,
                lgas_error: null
            }
        }
        case LOAD_LGA: {
            let lga_data = [...action.options];
            let lgas = [];

            lga_data.forEach(lga => {
                lgas.push({
                    id: lga.id,
                    code_description: lga.code_description,
                    ref_code: lga.ref_code,
                    link_id: lga.link_id
                });
            });

            return {
                ...state,
                lgas,
                loading_lgas: false,
                lgas_error: null
            }
        }
        case LOAD_LGA_FAILED: {
            return {
                ...state,
                loading_lgas: false,
                lgas_error: action.error_message
            }
        }
        default: {
            return state;
        }
    }
};