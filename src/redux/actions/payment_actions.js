import {
  START_LOAD_CARDS,
  LOAD_CARDS,
  LOAD_CARDS_FAILED,
  START_LOAD_ACCOUNTS,
  LOAD_ACCOUNTS,
  LOAD_ACCOUNTS_FAILED,
} from "../types/payment_types";

import { Network } from "_services";

export const getUserCards = (userId) => {
  return (dispatch) => {
    dispatch({
      type: START_LOAD_CARDS,
    });
    Network.getUserCards(userId)
      .then((result) => {
        console.log("habeeeeeeb", { result });
        dispatch({
          cards: result.cards,
          type: LOAD_CARDS,
        });
      })
      .catch((error) => {
        if (error.http_status === 404) {
          dispatch({
            cards: [],
            type: LOAD_CARDS,
          });
        } else {
          dispatch({
            type: LOAD_CARDS_FAILED,
            error_message: error.message,
          });
        }
      });
  };
};

export const getUserAccounts = () => {
  return (dispatch) => {
    dispatch({
      type: START_LOAD_ACCOUNTS,
    });
    Network.getUserAccounts()
      .then((result) => {
        dispatch({
          accounts: result.data,
          type: LOAD_ACCOUNTS,
        });
      })
      .catch((error) => {
        dispatch({
          type: LOAD_ACCOUNTS_FAILED,
          error_message: error.message,
        });
      });
  };
};
