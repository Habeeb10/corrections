import {
  UPDATE_INFORMATION,
  UPDATE_INFORMATION_ERROR,
} from "../types/information";
import { Network } from "_services";

export const getInformation = () => {
  return (dispatch) => {
    Network.getInformation()
      .then((result) => {
        dispatch({
          type: UPDATE_INFORMATION,
          image: result.fileLocation,
        });
      })
      .catch(() => {
        dispatch({
          type: UPDATE_INFORMATION_ERROR,
        });
      });
  };
};
