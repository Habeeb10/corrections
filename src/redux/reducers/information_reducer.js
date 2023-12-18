import {
  UPDATE_INFORMATION,
  UPDATE_INFORMATION_ERROR,
  UPDATE_BANNER_LIST,
} from "../types/information";

const initialState = {
  image: "",
  bannerList: [],
  imageVisible: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_INFORMATION: {
      return {
        ...state,
        image: action.image,
        imageVisible: true,
      };
    }
    case UPDATE_BANNER_LIST: {
      // console.log({ action });
      return {
        ...state,
        bannerList: action.bannerList,
        imageVisible: true,
      };
    }
    case UPDATE_INFORMATION_ERROR: {
      return { state };
    }
    default: {
      return state;
    }
  }
};
