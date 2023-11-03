import { Alert, Platform } from "react-native";
import {
  getUniqueId,
  getManufacturerSync,
  getModel,
  getDeviceId,
  getReadableVersion
} from "react-native-device-info";
import axios from "axios";

import { store } from "../redux/store/index";
import { env, Endpoints, Dictionary } from "_utils";
import * as NavigatorService from "./navigator";
import { environment, ResponseCodes } from "_utils";
// import { SUCCESS_CODE } from '_utils';

//const DEVICE_ID = ""
const DEVICE_ID = getUniqueId();
//const DEVICE_NAME = "";
const DEVICE_NAME =
  Platform.OS === "ios"
    ? getDeviceId()
    : getManufacturerSync() + " " + getModel();
const VERSION_ID = getReadableVersion();
//const VERSION_ID = "";

const BASIC_AUTH = true;
const BEARER_AUTH = false;

let alert_present = false;

const axiosConfig = {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    // "X-Install-ID": DEVICE_ID,
    // "X-Version-ID": VERSION_ID,
    // "X-Api-Key": env().api_key,
    "X-Mobile-OS": Platform.OS,
    // accessKey: env().accessKey
  }
};
let axiosInstance = axios.create(axiosConfig);

const logNetworkResult = (result) => {
  let { config, status, data } = result;
  logNetworkData(config, status, data);
};

const logNetworkError = (result) => {
  if (result.response) {
    let { response } = result;
    let { config, status, data } = response;
    logNetworkData(config, status, data);
  } else {
    console.log(JSON.stringify(result, null, 4));
  }
};

const logNetworkData = (config, status, data) => {
  console.log(
    "\n====================>\n",
    JSON.stringify(config, null, 4),
    "\n====================>"
  );
  console.log(
    "\n<========== HTTP " + status + " ==========\n",
    JSON.stringify(data, null, 4),
    "\n<=============================="
  );
};

const apiCall = async (
  with_basic_auth,
  url,
  method,
  body,
  additional_headers
) => {
  const user_data = store.getState().user.user_data;
  // const authorization = with_basic_auth
  //   ? `Basic ${env().signature}`
  //   : `${user_data.token}`;
  const authorization =`${user_data.token||""}`;
  const session_id = user_data.session_id;

  let headers = { apiKey: authorization, ...additional_headers };
  if (session_id) {
    headers.session_id = session_id;
  }
  if (url.startsWith(env().utility)) {
    let { utility_service_header } = store.getState().user.preferences;
    if (utility_service_header && environment === "prod") {
      headers[utility_service_header.type] = utility_service_header.key;
    }
  }

  switch (method) {
    case "post":
    case "put":
    case "patch":
      return axiosInstance[method](url, body, { headers });
    case "get":
      return axiosInstance[method](url, { headers });
    case "delete":
      return axiosInstance[method](url, { headers });
    default:
      return axiosInstance[method](url, { headers });
  }
};

const makeApiCall = async (
  with_basic_auth,
  url,
  method,
  body = {},
  additional_headers = {}
) => {
  return new Promise(function (resolve, reject) {
    apiCall(with_basic_auth, url, method, body, additional_headers)
      .then((result) => {
        logNetworkResult(result);

        if (!result.data.status) {
          resolve(result.data.data || result.data);
        }
       else if (result.data.status == "failed") {
          reject({
            message: result.data.message,
            status: "error"
          });
        } else if (
          result.data.status === "SUCCESS" ||
          result.data.status === "success" ||
          result.data.resp &&( result.data.resp.code  == ResponseCodes.SUCCESS_CODE)
        ) {
          resolve(result.data.data || result.data);
        } else if (
          result.data.status === "pending" ||
          result.status === "pending" 
        ) {
          resolve(result.data.data || result.data);
        
        } 
        
        else {
          reject({
            message:
              result.data.resp.message ||
              result.resp.message ||
              result.data.message,
            status: "error"
          });
        }
      })
      .catch((error) => {
        logNetworkError(error);
        if (error.response) {
          let { status, data } = error.response;
          let result = data;
          data.http_status = status;
          if (
            status === 401 &&
            !(url === Endpoints.VALIDATE_PIN || url === Endpoints.VALIDATE_USER && method === "post")
          ) {
            // A 401 from an endpoint other than authorization pin validation
            console.log("forbidden", result)
            if (!alert_present) {
              alert_present = true;
              Alert.alert(
                Dictionary.SESSION_EXPIRED_TITLE,
                Dictionary.SESSION_EXPIRED_MSG,
                [
                  {
                    text: "Ok",
                    onPress: () => {
                      alert_present = false;
                      NavigatorService.navigate("Login");
                    }
                  }
                ],
                { cancelable: false }
              );
            }
          } else {
            if (typeof result.data === "undefined") {
              //alert()
              reject(result);
            } 
            
            // else if (data.data.resp.code === "cv96") {
            //   Alert.alert(
            //     Dictionary.FAILED_ATTEMPT,
            //     data.data.resp.message,
            //     [
            //       {
            //         text: "Ok",
            //         onPress: () => {
            //           alert_present = false;
            //           NavigatorService.navigate("Login");  
            //           logoutUser().then((result) => {
            //             if (result.status === 200) {
            //                 console.log("Logout successful")  
            //             }
            //           }).catch((e) => console.log("Logout error message", e))
            //         }
            //       }
            //     ],
            //     { cancelable: false }
            //   );
            // } 
            
            else {
              reject(result.data.resp||result.data.responseData);
            }
          }
        } else {
          console.log(
            "===== UNKNOWN ERROR =====\n",
            JSON.stringify(error, null, 4)
          );
          if ("Network Error" === error.message) {
            reject({
              message: Dictionary.NETWORK_ERROR,
              status: "error"
            });
          } else {
            reject({
              message: Dictionary.GENERAL_ERROR,
              status: "error"
            });
          }
        }
      });
  });
};

export const getOrganizationPreferences = async () => {
  return makeApiCall(BASIC_AUTH, Endpoints.PREFERENCES, "get");
};

export const authenticateUser = async (
  phone_number,
  password,
  latitude,
  longitude
) => {
  const payload = {
    phoneNumber: phone_number,
    password,
    latitude,
    longitude,
    deviceId: DEVICE_ID,
    version_id: VERSION_ID,
    mobile_os: Platform.OS,
    os_version: Platform.OS + " " + Platform.Version,
    deviceName: DEVICE_NAME
  };
  return makeApiCall(BASIC_AUTH, Endpoints.LOGIN_USER, "post", payload);
};

export const refreshToken = async (token) => {
  return makeApiCall(BASIC_AUTH, Endpoints.REFRESH_TOKEN, "post", { token });
};

export const logoutUser = async () => {

  const user_data = store.getState().user.user_data;

  return axios.get(`${Endpoints.LOGOUT_USER}`,{
    headers:{
      "apiKey":user_data.token
    }
  })
};

export const resetPassword = async (phoneNumber, newPassword, otp) => {
  return makeApiCall(BASIC_AUTH, Endpoints.FORGOT_PASSWORD, "post", {
    phoneNumber,
    newPassword,
    otp
  });
};

export const setFirstTimePassword = async (phoneNumber, newPassword, clientId, otp) => {
  return makeApiCall(BASIC_AUTH, Endpoints.FIRSTIME_PASSWORD, "post", {
    token: "101e9c2e-f5a4-4122-be42-4f12e3074b10",
    newPassword,
    confirmPassword: newPassword,
    clientId,
    phoneNumber,
    userType: "CUSTOMER",
    otp,
    deviceId: DEVICE_ID,
    deviceName: DEVICE_NAME
  });
};

export const initializeSignUp = async (
  phoneNumber,
  referralCode,
  latitude = "",
  longitude = ""
) => {
  return makeApiCall(BASIC_AUTH, Endpoints.VALIDATE_PHONE, "post", {
    phoneNumber,
    referralCode,
    latitude,
    longitude
  });
};

// export const validateSignUpOTP = async (phone_number, otp) => {
//   return makeApiCall(BASIC_AUTH, Endpoints.ONBOARD_OTP, "post", {
//     phone_number,
//     otp,
//   });
// };

export const validateOTP = async (
  phone_number,
  otp,
  otpType,
  notificationType,
  otpId=""
) => {
  return makeApiCall(BASIC_AUTH, Endpoints.AUTHENTICATE_OTP, "post", {
    otpId:otpId==""? phone_number:otpId,
    otp,
    otpType,
    notificationType,
    // sendSource: phone_number
  });
};

export const verifyEmail = async (
  phone_number,
  otp,
  emailAddress
) => {
  return makeApiCall(BASIC_AUTH, Endpoints.VERIFY_EMAIL, "post", {
    phoneNumber: phone_number,
    otp,
   
    emailAddress
  });
};

export const requestOtp = async (phone_number, otpType, notificationType,otpId="") => {
  return makeApiCall(BASIC_AUTH, Endpoints.REQUEST_OTP, "post", {
    otpId: otpId==""?phone_number:otpId,
    otpType,
    notificationType,
    // sendSource: phone_number
  });
};

export const createPassword = async (
  phone_number,
  password,
  confirmation_id
) => {
  return makeApiCall(BASIC_AUTH, Endpoints.CREATE_PASSWORD, "post", {
    phone_number,
    password,
    confirmation_id,
    device_id: DEVICE_ID
  });
};

export const createCustomer = async (
  phoneNumber,
  email,
  firstName,
  lastName,
  middleName,
  gender,
  referralCode,
  password,
  longitude,
  latitude
) => {
  return makeApiCall(BASIC_AUTH, Endpoints.CREATE_CUSTOMER, "post", {
    phoneNumber,
    email,
    firstName,
    middleName,
    referred: referralCode,
    gender,
    lastName,
    longitude,
    latitude,
    password,
    confirmPassword: password,
    deviceId: DEVICE_ID,
    mobileVersion: "12.3",
    mobileOs: Platform.OS,
    mobileOsVer: Platform.OS + " " + Platform.Version,
    deviceName: DEVICE_NAME,
    mobileVersionId: VERSION_ID
  });
};

export const completeOnboarding = async (
  phoneNumber,
  dateOfBirth,
  firstName,
  lastName,
  middleName,
  gender,
  bvn,
  pin
) => {
  return makeApiCall(false, Endpoints.COMPLETE_ONBOARDING, "post", {
    phoneNumber,
    dateOfBirth,
    firstName,
    middleName,

    gender,
    lastName,

    pin,
    bvn,
    address: [
      {
        street: "",
        addressType: "Rent",
        city: "",
        country: "Nigeria"
      }
    ]
  });
};

export const checkBVN = async (bvn) => {
  return makeApiCall(false, Endpoints.CHECK_BVN, "post", { bvn });
};

export const validateBVN = async (bvn, bvn_phone_number, dob, otp) => {
  return makeApiCall(BEARER_AUTH, Endpoints.VALIDATE_BVN, "post", {
    bvn,
    bvn_phone_number,
    dob,
    otp
  });
};

export const addEmail = async (email) => {
  return makeApiCall(BEARER_AUTH, Endpoints.ADD_EMAIL, "post", { email });
};

export const createPIN = async (pin) => {
  return makeApiCall(false, Endpoints.CREATE_PIN, "post", { pin });
};

export const uploadIdentity = async (fileData) => {
  return makeApiCall(false, Endpoints.UPLOAD_IDENTITY, "post", fileData);
};

export const uploadUtility = async (fileData) => {
  return makeApiCall(false, Endpoints.UPLOAD_UTILITY, "post", fileData);
};

export const updateUtilDocument = async (fileData) => {
  return makeApiCall(false, Endpoints.UPDATE_UTILITY, "post", fileData);
};

export const updateIdentityDocument = async (fileData) => {
  return makeApiCall(false, Endpoints.UPDATE_IDENTITY, "post", fileData);
};

export const savePhoto = async (fileData) => {
  return makeApiCall(BEARER_AUTH, Endpoints.UPLOAD_PHOTO, "post", fileData);
};

export const getDocumentTypes = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.GET_DOCUMENT_TYPES, "get");
};

export const getUserDocuments = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.DOCUMENTS, "get");
};

export const addUserDocument = async (type_id, url) => {
  return makeApiCall(BEARER_AUTH, Endpoints.DOCUMENTS, "post", {
    type_id,
    url
  });
};

export const updateUserDocument = async (user_id, type_id, url) => {
  return makeApiCall(BEARER_AUTH, `${Endpoints.DOCUMENTS}/${user_id}`, "put", {
    type_id,
    url
  });
};

export const getDeviceActivationToken = async (phone_number) => {
  return makeApiCall(BASIC_AUTH, Endpoints.DEVICE_ACTIVATION, "post", {
    phone_number,
    device_id: DEVICE_ID
  });
};

export const activateDevice = async (phoneNumber) => {
  return makeApiCall(false, Endpoints.AUTHORIZE_DEVICE, "post", {
    phoneNumber,
    // device_id: DEVICE_ID,
    deviceId: DEVICE_ID,
    mobileVersion: "12.3",
    mobileOs: Platform.OS,
    mobileOsVer: Platform.OS + " " + Platform.Version,
    deviceName: DEVICE_NAME,
    mobileVersionId: VERSION_ID
  });
};

export const changePassword = async (old_password, new_password,phoneNumber) => {
  return makeApiCall(false, Endpoints.CHANGE_PASSWORD, "post", {
    oldPassword: old_password,
    newPassword:new_password,
    confirmPassword:new_password,
    userType:"",
    phoneNumber

  });
};

export const changePIN = async (oldPin, newPin) => {
  return makeApiCall(false, Endpoints.CHANGE_PIN, "post", {
    oldPin,
    newPin
  });
};

export const forgotPIN = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.FORGOT_PIN, "post");
};

export const resetPIN = async (otp, new_pin) => {
  return makeApiCall(BEARER_AUTH, Endpoints.RESET_PIN, "post", {
    otp,
    newPin:new_pin
  });
};

export const validatePIN = async (pin) => {
  return makeApiCall(false, Endpoints.VALIDATE_PIN, "post", { pin });
};

export const registerFcmToken = async (notification_token) => {
  return makeApiCall(BEARER_AUTH, Endpoints.STORE_NOTIFICATION_TOKEN, "put", {
    notification_token
  });
};

export const getPushNotifications = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.GET_USER_NOTIFICATIONS, "get");
};

export const getUserProfile = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.GET_USER_PROFILE, "get");
};

export const getUserReferralActivities = async (code) => {
  return makeApiCall(BEARER_AUTH, `${Endpoints.REFERRAL_ACTIVITIES}/${code}`, "get");
};

export const getReferralActivitiesRunning = async (code) => {
  return makeApiCall(BEARER_AUTH, `${Endpoints.REFERRAL_ACTIVITIES}/${code}/RUNNING`, "get");
};

export const getReferralActivitiesMatured = async (code) => {
  return makeApiCall(BEARER_AUTH, `${Endpoints.REFERRAL_ACTIVITIES}/${code}/MATURED`, "get");
};

export const doReferralTransfer = async (transfer_data) => {
  return makeApiCall(BEARER_AUTH, `${Endpoints.REFERRAL_ACTIVITIES}/transfer`, "post", transfer_data);
};

export const getProfileOptions = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.PROFILE_OPTIONS, "get");
};

export const updateUserProfile = async (profile_data) => {
  return makeApiCall(BEARER_AUTH, Endpoints.USER_PROFILE, "post", profile_data);
};

export const updateUserPicture = async (photo_url) => {
  return makeApiCall(BEARER_AUTH, Endpoints.USER_PROFILE, "put", { photo_url });
};

export const getUserNextOfKin = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.USER_NEXT_OF_KIN, "get");
};

export const updateUserNextOfKin = async (next_of_kin_data) => {
  return makeApiCall(
    BEARER_AUTH,
    Endpoints.USER_NEXT_OF_KIN,
    "post",
    next_of_kin_data
  );
};

export const getUserCards = async (userId) => {
  return makeApiCall(BEARER_AUTH, Endpoints.USER_CARDS, "get");
};

export const getUserAccounts = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.USER_BANKS, "get");
};

export const initAddCard = async (payload) => {
  return makeApiCall(BEARER_AUTH, Endpoints.INIT_ADD_USER_CARD, "post",payload);
};

export const fundSavingsWithCard = async (payload) => {
  return makeApiCall(BEARER_AUTH, Endpoints.FUND_SAVINGS_CARD, "post",payload);
};


export const verifyAddCard = async (reference) => {
  return makeApiCall(BEARER_AUTH, Endpoints.USER_CARD, "post", { reference });
};

export const verifyPAymentByReference = async (reference) => {
  return makeApiCall(BEARER_AUTH, `${Endpoints.VERIFY_PAYMENT_BY_REF}/${reference}`, "get");
};

export const allArchiveSavings = async () => {
  return makeApiCall(BEARER_AUTH, `${Endpoints.GET_ALL_ARCHIVE}`, "get");
};

export const getReferalCode = async () => {
  return makeApiCall(BEARER_AUTH, `${Endpoints.GET_REFERAL_CODE}`, "get");
};

export const deleteUserCard = async (card_id) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.CARDS}/${card_id}`,
    "delete"
  );
};

export const getBankOptions = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.FINICIAL_INSTITUTION, "get");
};

export const addUserBank = async (account_number, bank_code) => {
  return makeApiCall(BEARER_AUTH, Endpoints.USER_BANKS, "post", {
    account_number,
    bank_code
  });
};

export const deleteUserBank = async (account_id) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.USER_BANKS}/${account_id}`,
    "delete"
  );
};

export const getStateConfigOptions = async () => {
  return makeApiCall(
    BASIC_AUTH,
    `${Endpoints.GET_METADATA}?code_description=state`,
    "get"
  );
};

export const getLgaConfigOptions = async () => {
  return makeApiCall(
    BASIC_AUTH,
    `${Endpoints.GET_METADATA}?code_description=local-government`,
    "get"
  );
};

export const getSavingsProductOptions = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.GET_SAVINGS_PRODUCTS, "get");
};

export const getSavingsCollectionOptions = async () => {
  return makeApiCall(
    BEARER_AUTH,
    Endpoints.GET_SAVINGS_COLLECTION_MODES,
    "get"
  );
};

export const getSavingsFrequencyOptions = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.GET_SAVINGS_FREQUENCIES, "get");
};

export const getSavingsOfferings = async (tenor_options) => {
  return makeApiCall(
    BEARER_AUTH,
    Endpoints.GET_SAVINGS_OFFERINGS,
    "post",
    tenor_options
  );
};

export const getSavingsBreakdown = async (tenor_options) => {
  return makeApiCall(
    BEARER_AUTH,
    Endpoints.GET_SAVINGS_BREAKDOWN,
    "post",
    tenor_options
  );
};

export const fundWalletPaystack = async (data) => {
  return makeApiCall(
    false,
    Endpoints.FUND_WALLET_PAY_STACK,
    "post",
    data
  );
};

export const createSavingsPlan = async (savings_data) => {
  return makeApiCall(BEARER_AUTH, Endpoints.CREATE_SAVINGS, "post", savings_data);
};

export const updateSavingsPlan = async (plan_id, plan_data) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.SAVINGS}/${plan_id}`,
    "put",
    plan_data
  );
};

export const getUserSavingsData = async (id) => {
  return makeApiCall(false, `${Endpoints.GET_CUSTOMER_SAVINGS}/${id}`, "get");
};

export const topUpSavingsPlan = async (topup_data) => {
  return makeApiCall(
    false,
    `${Endpoints.TOP_UP_SAVINGS}`,
    "post",
    topup_data
  );
};



export const getWithdrawalWarning = async (account_no, amount) => {
  return makeApiCall(
    false,
    `${Endpoints.GET_WITHDRAWAL_WARNINGS}/${account_no}/${amount}`,
    "get"
  );
};

export const withdrawSavings = async (withdrawal_data) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.SAVINGS}/plan/withdraw`,
    "post",
    withdrawal_data
  );
};

export const withdrawExternalSavings = async (plan_id, withdrawal_data) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.SAVINGS}/${plan_id}/back-office-withdrawal`,
    "post",
    withdrawal_data
  );
};

export const rolloverSavingsPlan = async (plan_id, rollover_data) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.SAVINGS}/${plan_id}/rollover`,
    "post",
    rollover_data
  );
};

export const archiveSavingsPlan = async (payload) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.ARCHIVE_SAVINGS}`,
    "post",
    payload
  );
};

export const restoreSavingsPlan = async (plan_id) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.SAVINGS}/${plan_id}/restore`,
    "post"
  );
};

export const getSavingsTransactions = async (plan_id, page, pageSize, type) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.SAVINGS}/transaction/${plan_id}/?page=${page}&pageSize=${pageSize}&filter=${type}`,
    "get"
  );
};

export const getLoanProductOptions = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.GET_LOAN_PRODUCTS, "get");
};

export const getLoanScoringOptions = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.GET_LOAN_SCORING_OPTIONS, "get");
};

export const getLoanPurposes = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.GET_LOAN_PURPOSES, "get");
};

export const submitLoanRequest = async (loan_application) => {
  return makeApiCall(
    BEARER_AUTH,
    Endpoints.REQUEST_LOAN,
    "post",
    loan_application
  );
};

export const getLoanSchedules = async (token) => {
  return makeApiCall(BEARER_AUTH, Endpoints.GET_LOAN_PAYMENT_SCHEDULE, "post", {
    token
  });
};

export const addLoanGuarantor = async (guarantor) => {
  return makeApiCall(
    BEARER_AUTH,
    Endpoints.ADD_LOAN_GUARANTOR,
    "post",
    guarantor
  );
};

export const completeLoanApplication = async (loan_data) => {
  return makeApiCall(BEARER_AUTH, Endpoints.LOANS, "post", loan_data);
};

export const getUserLoanData = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.LOANS, "get");
};

export const cancelLoanApplication = async (reason) => {
  return makeApiCall(
    BEARER_AUTH,
    Endpoints.CANCEL_LOAN_REQUEST,
    "post",
    reason
  );
};

export const repayUserLoan = async (transaction_data) => {
  return makeApiCall(
    BEARER_AUTH,
    Endpoints.REPAY_LOAN,
    "post",
    transaction_data
  );
};

export const getLoanDetails = async (loan_id) => {
  return makeApiCall(BEARER_AUTH, `${Endpoints.LOANS}/${loan_id}`, "get");
};

// export const getUserWalletData = async () => {
//   return makeApiCall(false, Endpoints.USER_WALLET, "get");
// };

export const getUserWalletData = async (id) => {
  const user_data = store.getState().user.user_data;
  // const authorization = with_basic_auth
  //   ? `Basic ${env().signature}`
  //   : `${user_data.token}`;

  return axios.get(`${Endpoints.SAVINGS}/${id}`,{
    headers:{
      "apiKey":user_data.token
    }
  })

  //return makeApiCall(false, Endpoints.USER_WALLET, "get");
};

export const getAccountTransactions = async (id, page, pageSize, type) => {
  const res = await makeApiCall(
    BEARER_AUTH,
    `${Endpoints.SAVINGS}/transaction/wallet/${id}?page=${page}&pageSize=${pageSize}&filter=${type}`,
    "get"
  );
  return res;
};

export const getTransactionFeeTypesData = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.GET_TRANSACTION_FEES, "get");
};

export const getTransactionFee = async (transaction_data) => {
  return makeApiCall(
    BEARER_AUTH,
    Endpoints.GET_TRANSACTION_FEES,
    "post",
    transaction_data
  );
};

export const getCvTransactionFee = async (type, amount) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.ACCOUNT_TRANSACTION_FEES}?type=${type}&amount=${amount}`,
    "get"
  );
};

export const fundUserWallet = async (transaction_data) => {
  return makeApiCall(
    BEARER_AUTH,
    Endpoints.FUND_PRIMARY_ACCOUNT,
    "post",
    transaction_data
  );
};

export const getTransactionUSSDCodes = async (amount, transaction_type) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.TRANSACTIONS}/ussd?transaction_type=${transaction_type}`,
    "post",
    { amount }
  );
};

export const getTransactionDetails = async (transaction_id) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.TRANSACTIONS}/${transaction_id}`,
    "get"
  );
};

export const getTransferBeneficiaryData = async (bvn) => {
  return makeApiCall(BEARER_AUTH, `${Endpoints.CREDITVILLE_ONBOARDING}/customer/${bvn}/beneficiaries`, "get");
};

export const getCustomerBeneficiaryData = async (clientId, isIntra) => {
  return makeApiCall(BEARER_AUTH, `${Endpoints.CREDITVILLE_ONBOARDING}/customer/beneficiaries`, "post", {
    clientId,
    intra: isIntra
  });
};

export const addTransferBeneficiary = async (body) => {
  return makeApiCall(BEARER_AUTH, `${Endpoints.ADD_TRANSFER_BENEFICIARIES}`, "post",body);
};


export const doIntraBankNameEnquiry = async (accountNumber) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.INTRA_NAME_ENQUIRY}/${accountNumber}`,
    "get"
  );
};


export const doNameEnquiry = async (body) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.NAME_ENQUIRY}?bankAccountNumber=${body.AccountNumber}&bankCode=${body.DestinationInstitutionCode}&channelCode=${body.ChannelCode}`,
    "get",
    
  );
};


export const doTransferIntra = async (transfer_data) => {
  return makeApiCall(
    BEARER_AUTH,
    Endpoints.FUNDS_TRANSFER_INTRA,
    "post",
    transfer_data
  );
};

export const doTransfer = async (transfer_data) => {
  return makeApiCall(
    BEARER_AUTH,
    Endpoints.FUNDS_TRANSFER,
    "post",
    transfer_data
  );
};

export const getBillerCategoryData = async () => {
  return makeApiCall(BEARER_AUTH, Endpoints.BILLER_CATEGORIES, "get");
};

export const getCategoryBillers = async (category_id) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.CREDITVILLE_SAVINGS}/wallet/${category_id}/categories`,
    "get"
  );
};

export const getBillerItems = async (biller_id) => {
  return makeApiCall(
    BEARER_AUTH,
    `${Endpoints.BILLER_ITEMS}/${biller_id}`,
    "get"
  );
};

export const payBill = async (transaction_data) => {
  return makeApiCall(BEARER_AUTH, Endpoints.PAY_BILL, "post", transaction_data);
};

export const payCableBill = async (transaction_data) => {
  return makeApiCall(BEARER_AUTH, `${Endpoints.CABLE_PAYMENT}`, "post", transaction_data);
};



export const buyAirtime = async (transaction_data) => {
  return makeApiCall(
    BEARER_AUTH,
    Endpoints.BUY_AIRTIME,
    "post",
    transaction_data
  );
};

export const buyData = async (transaction_data) => {
  return makeApiCall(BEARER_AUTH, Endpoints.BUY_DATA, "post", transaction_data);
};

export const validateUser = async (phone_number) => {
  const payload = {
    phoneNumber: phone_number,
  };
  
  return makeApiCall(BASIC_AUTH, Endpoints.VALIDATE_USER, "post", payload);
};

export const getReceipt = async (transaction_id) => {
  return makeApiCall(BEARER_AUTH, `${Endpoints.GET_RECEIPT}/${transaction_id}`, "get");
};

export const getInformation = async () => {
  return makeApiCall(BASIC_AUTH, `${Endpoints.GET_INFORMATION}`, "get");
};
