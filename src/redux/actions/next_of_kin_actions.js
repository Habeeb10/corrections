import { START_LOAD_NOK, LOAD_NOK, LOAD_NOK_FAILED } from '../types/next_of_kin_types';

import { Network } from '_services';

export const getUserNextOfKin = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_NOK
        });
        Network.getUserNextOfKin()
            .then((result) => {
                dispatch({
                    next_of_kin: result.data,
                    type: LOAD_NOK
                });
            })
            .catch((error) => {
                if (error.http_status === 404) {
                    dispatch({
                        next_of_kin: {},
                        type: LOAD_NOK
                    })
                } else {
                    dispatch({
                        type: LOAD_NOK_FAILED,
                        next_of_kin_error: error.message
                    });
                }
            });
    };
};