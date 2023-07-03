import {
  UPDATE_INFORMATION,
  UPDATE_INFORMATION_ERROR,
} from "../types/information";

const initialState = {
  image: "",
  imageVisible: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_INFORMATION: {
      return {
        ...state,
        image: action.image,
        imageVisible: true
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
