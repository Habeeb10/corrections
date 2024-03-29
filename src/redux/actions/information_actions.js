import {
  UPDATE_INFORMATION,
  UPDATE_INFORMATION_ERROR,
  UPDATE_BANNER_LIST,
} from "../types/information";
import { Network } from "_services";

export const getInformation = () => {
  return (dispatch) => {
    Network.getInformation()
      .then((result) => {
        // console.log("hkhkhkh", { result });
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

export const getImage = () => {
  return (dispatch) => {
    Network.getImage()
      .then((result) => {
        // console.log("habeeb", { result });
        dispatch({
          type: UPDATE_BANNER_LIST,
          bannerList: result.bannerList,
        });
      })
      .catch(() => {
        dispatch({
          type: UPDATE_INFORMATION_ERROR,
        });
      });
  };
};
