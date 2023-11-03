import {
    START_LOAD_DROPDOWN, LOAD_DROPDOWN, LOAD_DROPDOWN_FAILED,
    START_LOAD_BANKS, LOAD_BANKS, LOAD_BANKS_FAILED,
    START_LOAD_STATES, LOAD_STATES, LOAD_STATES_FAILED,
    START_LOAD_LGA, LOAD_LGA, LOAD_LGA_FAILED
} from '../types/config_types';

import { Network } from '_services';
import {banks} from "../../data"

export const getDropdownOptions = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_DROPDOWN
        });
        Network.getProfileOptions()
            .then((result) => {
                dispatch({
                    options: result.data,
                    type: LOAD_DROPDOWN
                })
            }).catch((error) => {
                dispatch({
                    type: LOAD_DROPDOWN_FAILED,
                    error_message: error.message
                });
            });
    };
};

export const getBankOptions = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_BANKS
        });

        // console.log("bankslofaffd##",banks.data)
        // dispatch({
        //     banks:banks.data ,
        //     type: LOAD_BANKS
        // })


        Network.getBankOptions()
            .then((result) => {

                dispatch({
                    banks: result.financialInstitutions.content,
                    type: LOAD_BANKS
                })
            }).catch((error) => {
                dispatch({
                    type: LOAD_BANKS_FAILED,
                    error_message: error.message
                });
            });
    };
};

export const getStateOptions = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_STATES
        });
        Network.getStateConfigOptions()
            .then((result) => {
                dispatch({
                    options: result.data,
                    type: LOAD_STATES
                })
            }).catch((error) => {
                dispatch({
                    type: LOAD_STATES_FAILED,
                    error_message: error.message
                });
            });
    };
};

export const getLgaOptions = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_LGA
        });
        Network.getLgaConfigOptions()
            .then((result) => {
                dispatch({
                    options: result.data,
                    type: LOAD_LGA
                })
            }).catch((error) => {
                dispatch({
                    type: LOAD_LGA_FAILED,
                    error_message: error.message
                });
            });
    };
};