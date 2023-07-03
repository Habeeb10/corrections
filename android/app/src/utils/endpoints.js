import env from './env';
import {environment} from './env';

const UTILITY = env().utility + '/v2';

// UTILITY
// export const CHECK_BVN = UTILITY + '/util/verify/bvn';
export const UPLOAD_FILE = UTILITY + '/util/upload/photo?tenant=creditville';
export const BANK_OPTIONS = UTILITY + '/util/codes/fetch/bank';

const PECUNIA = "";
const PECUNIA2 = "";

const BILL_BASE_URL="http://13.127.17.141:8081/api/v1/flw";
const NIPS_BASE_URL="http://13.127.17.141:8081/api/v1";
//const NIPS_BASE_URL="http://13.127.17.141:8081/api/v1/nibspay";



//dev
//CREDITVILLE
//export const CREDITVILLE_ONBOARDING = env().creditVille + '/userservice/api/v1';
// export const CREDITVILLE_SAVINGS = env().creditVille + '/savingsservice/api/v1';

//uat

export const CREDITVILLE_ONBOARDING = env().creditVille + `${environment === 'uat' ? '/user/api/v1' : '/userservice/api/v1'}`;
export const CREDITVILLE_SAVINGS = env().creditVille +`${environment === 'uat' ? '/savings/api/v1' : '/savingsservice/api/v1'}`;


//prod


// WALLET
//export const SAVINGS = PECUNIA + '/wallet';
export const WALLET = CREDITVILLE_SAVINGS + '/wallet';
export const GET_RECEIPT = CREDITVILLE_SAVINGS + '/wallet/transaction/receipt';

// TRANSACTIONS
export const TRANSACTIONS = PECUNIA + '/transaction';
export const GET_TRANSACTION_FEES = TRANSACTIONS + '/fees';

// SAVINGS
export const SAVINGS = CREDITVILLE_SAVINGS + '/savings';

// METADATA
export const GET_METADATA = PECUNIA + '/meta/codes';

// AUTH

export const VALIDATE_PHONE = CREDITVILLE_ONBOARDING + '/customer/validate';
export const VALIDATE_USER = CREDITVILLE_ONBOARDING + '/customer/validate/phonenumber';
export const REQUEST_OTP = CREDITVILLE_ONBOARDING + '/otp/request';
export const AUTHENTICATE_OTP = CREDITVILLE_ONBOARDING + '/otp/authenticate';
export const CREATE_CUSTOMER=CREDITVILLE_ONBOARDING + '/customer/create';
export const CHANGE_PASSWORD=CREDITVILLE_ONBOARDING + '/password/reset-password';
export const VERIFY_EMAIL=CREDITVILLE_ONBOARDING + '/verify/email';

export const LOGIN_USER=CREDITVILLE_ONBOARDING + '/login/customer';
export const CHECK_BVN = CREDITVILLE_ONBOARDING + '/bvn';
export const VALIDATE_BVN = CREDITVILLE_ONBOARDING + '/bvn/verify';
export const UPLOAD_PHOTO = CREDITVILLE_ONBOARDING + '/photo/upload';
export const AUTHORIZE_DEVICE = CREDITVILLE_ONBOARDING + '/device/authorize';
export const FORGOT_PASSWORD = CREDITVILLE_ONBOARDING + '/password/mobile/forgot-password';
export const FIRSTIME_PASSWORD = CREDITVILLE_ONBOARDING + '/password/mobile/set-firsttime-password';
export const GET_REFERAL_CODE = CREDITVILLE_ONBOARDING + '/referralcode/request';
export const LOGOUT_USER=LOGIN_USER + '/logout';



export const UPLOAD_IDENTITY = CREDITVILLE_ONBOARDING + '/doc/identitydoc/upload';
export const UPLOAD_UTILITY = CREDITVILLE_ONBOARDING + '/doc/utilitydoc/upload';


export const VALIDATE_PIN = CREDITVILLE_ONBOARDING + '/pin/validatepin';



export const GET_USER_PROFILE = CREDITVILLE_ONBOARDING + '/customer/userid';
export const CREATE_PIN = CREDITVILLE_ONBOARDING + '/pin';
export const COMPLETE_ONBOARDING = CREDITVILLE_ONBOARDING + '/customer/create/complete';
export const GET_INFORMATION = CREDITVILLE_ONBOARDING + '/photo/image';


//savings

//export const SAVINGS = CREDITVILLE_SAVINGS + '/savings';



//PENUE
export const AUTH = PECUNIA + '/auth';
export const PREFERENCES = AUTH + '/preference';
export const ONBOARD = AUTH + '/onboard';
export const ONBOARD_OTP = ONBOARD + '/otp';
export const CREATE_PASSWORD = ONBOARD + '/password';
// export const VALIDATE_BVN = ONBOARD + '/bvn';
export const ADD_EMAIL = ONBOARD + '/email';
//export const CREATE_PIN = ONBOARD + '/pin';
export const SAVE_PHOTO = ONBOARD + '/photo';

export const AUTHENTICATE = AUTH + '/login';
export const REFRESH_TOKEN = AUTH + '/refresh-token';
export const DEVICE_ACTIVATION = AUTH + '/device';
export const ACTIVATE_DEVICE = DEVICE_ACTIVATION + '/confirm';
// export const RESET_PASSWORD = AUTH + '/reset/password';
// export const FORGOT_PASSWORD = RESET_PASSWORD + '/otp';
// export const VALIDATE_PIN = AUTH + '/biometric';

// SETTINGS
export const SETTINGS = PECUNIA + '/settings';
export const DOCUMENTS = SETTINGS + '/document';

export const GET_DOCUMENT_TYPES = DOCUMENTS + '/types';
// export const CHANGE_PASSWORD = SETTINGS + '/password';f

export const CARDS = CREDITVILLE_ONBOARDING + '/card';


export const CHANGE_PIN = CREDITVILLE_ONBOARDING + '/pin/changepin';
export const SEND_OTP_PIN = CREDITVILLE_ONBOARDING + '/pin/send';
export const RESET_PIN = CREDITVILLE_ONBOARDING + '/pin/resetpin';
export const FORGOT_PIN = RESET_PIN + '/otp';
export const USER_PROFILE = CREDITVILLE_ONBOARDING + '/customer/update';
export const PROFILE_OPTIONS = USER_PROFILE + '/options';
export const USER_NEXT_OF_KIN = CREDITVILLE_ONBOARDING + '/customer/create/nextofkin';
export const USER_CARDS = CARDS + '/client';
export const USER_CARD = CARDS + '/authorize';
export const INIT_ADD_USER_CARD = SAVINGS + '/initialize-card-tokenization';
export const USER_BANKS = SETTINGS + '/banks';
export const TRANSFER_BENEFICIARIES = CREDITVILLE_ONBOARDING + '/customer/all/beneficiaries';
export const ADD_TRANSFER_BENEFICIARIES = CREDITVILLE_ONBOARDING + '/customer/beneficiary/add';
export const REFERRAL_ACTIVITIES = SETTINGS + '/referrals/activities';

export const NOTIFICATIONS = SETTINGS + '/notification';
export const STORE_NOTIFICATION_TOKEN = NOTIFICATIONS + '/token';
export const GET_USER_NOTIFICATIONS = NOTIFICATIONS + '/device';






export const GET_SAVINGS_PRODUCTS = SAVINGS + '/allplan';
export const ARCHIVE_SAVINGS = SAVINGS + '/status';
export const GET_CUSTOMER_SAVINGS = SAVINGS + '/all';
export const CREATE_SAVINGS = SAVINGS + '/create';
export const GET_SAVINGS_COLLECTION_MODES = SAVINGS + '/collection-methods';
export const GET_SAVINGS_FREQUENCIES = SAVINGS + '/frequency';
export const GET_SAVINGS_OFFERINGS = SAVINGS + '/offerings';
export const GET_WITHDRAWAL_WARNINGS = SAVINGS + '/warning/message';
export const FUND_WALLET_PAY_STACK = SAVINGS + '/fund-wallet';
export const TOP_UP_SAVINGS = SAVINGS + '/fund-plan';
// export const GET_SAVINGS_BREAKDOWN = PECUNIA + '/savings/breakdown';
export const GET_ALL_ARCHIVE = SAVINGS + '/all/achieve';
export const FUND_SAVINGS_CARD = SAVINGS + '/fund-savings';




// LOANS
export const LOANS = PECUNIA + '/digital-bank/loan';
export const GET_LOAN_PRODUCTS = LOANS + '/products';
export const GET_LOAN_PURPOSES = PECUNIA + '/meta/icons/loan-purpose';
export const GET_LOAN_SCORING_OPTIONS = LOANS + '/score/options';
export const REQUEST_LOAN = LOANS + '/score';
export const GET_LOAN_PAYMENT_SCHEDULE = LOANS + '/payment-schedules';
//export const GET_LOAN_PAYMENT_SCHEDULE = PECUNIA + '/loan/payment-schedules';
export const ADD_LOAN_GUARANTOR = LOANS + '/guarantor';
export const CANCEL_LOAN_REQUEST = LOANS + '/cancel';
export const REPAY_LOAN = LOANS + '/repay';

// BILL PAYMENT
export const BILL_PAYMENT = PECUNIA2 + '/digital-bank/bills/cv';
export const BUY_AIRTIME = CREDITVILLE_SAVINGS + '/wallet/airtime/purchase';
export const CABLE_PAYMENT = CREDITVILLE_SAVINGS + '/wallet/cable/subscribe';
export const BUY_DATA = CREDITVILLE_SAVINGS + '/wallet/data/purchase';
export const BILLER_CATEGORIES = CREDITVILLE_SAVINGS + '/wallet/all/categories';
export const BILLER_CATEGORIES_BY_CODE = BILL_BASE_URL + '/bill-categories';
export const BILLER_ITEMS = CREDITVILLE_SAVINGS + '/wallet/biller/items';
//export const PAY_BILL = BILL_BASE_URL + '/bills';
export const PAY_BILL = CREDITVILLE_SAVINGS + '/wallet/electricity/purchase';

// ACCOUNTS
export const ACCOUNTS = PECUNIA + '/digital-bank/accounts';
export const FUND_PRIMARY_ACCOUNT = SAVINGS + '/fund-wallet';
export const VERIFY_PAYMENT_BY_REF = SAVINGS + '/callback';


export const ACCOUNT_TRANSACTIONS = ACCOUNTS + '/transactions';
export const ACCOUNT_TRANSACTION_FEES = ACCOUNT_TRANSACTIONS + '/fees';
export const NAME_ENQUIRY = SAVINGS + '/bank/name-enquiry';
//export const NAME_ENQUIRY = NIPS_BASE_URL + '/nibspay/name-enquiry';
export const INTRA_NAME_ENQUIRY = WALLET + '/nameenquiry';
export const FUNDS_TRANSFER = WALLET + '/inter/transfer';
//export const FUNDS_TRANSFER = NIPS_BASE_URL + '/nibspay/fund-single-credit';
export const FUNDS_TRANSFER_INTRA = WALLET + '/intra/transfer';
export const FINICIAL_INSTITUTION = SAVINGS + '/bank';