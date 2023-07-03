import {
    START_LOAD_SAVINGS_PRODUCTS, LOAD_SAVINGS_PRODUCTS, LOAD_SAVINGS_PRODUCTS_FAILED,
    START_LOAD_SAVINGS_COLLECT_MODES, LOAD_SAVINGS_COLLECT_MODES, LOAD_SAVINGS_COLLECT_MODES_FAILED,
    START_LOAD_SAVINGS_FREQUENCIES, LOAD_SAVINGS_FREQUENCIES, LOAD_SAVINGS_FREQUENCIES_FAILED,
    START_LOAD_USER_SAVINGS, LOAD_USER_SAVINGS, LOAD_USER_SAVINGS_FAILED,
    UPDATE_APPLICATION, RESET_APPLICATION, UPDATE_SAVINGS_ARCHIVED_STATUS
} from '../types/savings_types';

import { Network } from '_services';

export const getSavingsProducts = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_SAVINGS_PRODUCTS
        });

        Network.getSavingsProductOptions()
            .then((result) => {
                dispatch({
                    options: result.savingProductsDtoList,
                    type: LOAD_SAVINGS_PRODUCTS
                })
            })
            .catch((error) => {
                dispatch({
                    type: LOAD_SAVINGS_PRODUCTS_FAILED,
                    error_message: error.message
                });
            });
    };
};

export const getSavingsCollectionModes = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_SAVINGS_COLLECT_MODES
        });

        dispatch({
            options: [ {
                "id": 1,
                "name": "automated",
                "created_on": "2019-12-13T02:07:29.000Z",
                "created_by": null,
                "modified_on": null,
                "modified_by": null,
                "deleted_flag": 0,
                "deleted_on": null,
                "deleted_by": null
              },
              {
                "id": 2,
                "name": "manual",
                "created_on": "2019-12-13T02:07:29.000Z",
                "created_by": null,
                "modified_on": null,
                "modified_by": null,
                "deleted_flag": 0,
                "deleted_on": null,
                "deleted_by": null
              }],
            type: LOAD_SAVINGS_COLLECT_MODES
        })
        // Network.getSavingsCollectionOptions()
        //     .then((result) => {
        //         dispatch({
        //             options: result.data,
        //             type: LOAD_SAVINGS_COLLECT_MODES
        //         })
        //     })
        //     .catch((error) => {
        //         dispatch({
        //             type: LOAD_SAVINGS_COLLECT_MODES_FAILED,
        //             error_message: error.message
        //         });
        //     });
    };
};

export const getSavingsFrequencies = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_SAVINGS_FREQUENCIES
        });

        Network.getSavingsFrequencyOptions()
            .then((result) => {
                dispatch({
                    options: result.savingsFrequencies,
                    type: LOAD_SAVINGS_FREQUENCIES
                })
            })
            .catch((error) => {
                dispatch({
                    type: LOAD_SAVINGS_FREQUENCIES_FAILED,
                    error_message: error.message
                });
            });
    };
};

export const updateSavingsApplicationData = (application_data) => {
    return dispatch => {
        dispatch({
            type: UPDATE_APPLICATION,
            application_data
        });
    };
}

export const resetSavingsApplicationData = () => {
    return dispatch => {
        dispatch({
            type: RESET_APPLICATION
        });
    };
}

export const getUserSavings = (bvn) => {
    return dispatch => {
        dispatch({
            type: START_LOAD_USER_SAVINGS
        });

        Network.getUserSavingsData(bvn)
            .then((result) => {
                dispatch({
                    user_savings: result.deposits,
                    type: LOAD_USER_SAVINGS
                })
            })
            .catch((error) => {
                dispatch({
                    type: LOAD_USER_SAVINGS_FAILED,
                    error_message: error.message
                });
            });
    };
};

export const updateSavingsArchivedStatus = (savings_id, archived) => {
    return dispatch => {
        dispatch({
            type: UPDATE_SAVINGS_ARCHIVED_STATUS,
            savings_id,
            archived
        });
    };
}