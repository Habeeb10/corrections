import env from './env';

const UTILITY = env().utility + '/v2';

// UTILITY
export const CHECK_BVN = UTILITY + '/util/verify/bvn';
export const UPLOAD_FILE = UTILITY + '/util/upload/photo?tenant=creditville';
export const BANK_OPTIONS = UTILITY + '/util/codes/fetch/bank';

const PECUNIA = env().pecunia + '/v1';
const PECUNIA2 = env().pecunia + '/v2';

// METADATA
export const GET_METADATA = PECUNIA + '/meta/codes';

// AUTH
export const AUTH = PECUNIA + '/auth';
export const PREFERENCES = AUTH + '/preference';
export const ONBOARD = AUTH + '/onboard';
export const ONBOARD_OTP = ONBOARD + '/otp';
export const CREATE_PASSWORD = ONBOARD + '/password';
export const VALIDATE_BVN = ONBOARD + '/bvn';
export const ADD_EMAIL = ONBOARD + '/email';
export const CREATE_PIN = ONBOARD + '/pin';
export const SAVE_PHOTO = ONBOARD + '/photo';

export const AUTHENTICATE = AUTH + '/login';
export const REFRESH_TOKEN = AUTH + '/refresh-token';
export const DEVICE_ACTIVATION = AUTH + '/device';
export const ACTIVATE_DEVICE = DEVICE_ACTIVATION + '/confirm';
export const RESET_PASSWORD = AUTH + '/reset/password';
export const FORGOT_PASSWORD = RESET_PASSWORD + '/otp';
export const VALIDATE_PIN = AUTH + '/biometric';

// SETTINGS
export const SETTINGS = PECUNIA + '/settings';
export const DOCUMENTS = SETTINGS + '/document';
export const GET_DOCUMENT_TYPES = DOCUMENTS + '/types';
export const CHANGE_PASSWORD = SETTINGS + '/password';
export const CHANGE_PIN = SETTINGS + '/pin';
export const RESET_PIN = SETTINGS + '/reset/pin';
export const FORGOT_PIN = RESET_PIN + '/otp';
export const USER_PROFILE = SETTINGS + '/profile';
export const PROFILE_OPTIONS = USER_PROFILE + '/options';
export const USER_NEXT_OF_KIN = USER_PROFILE + '/next-of-kin';
export const USER_CARDS = SETTINGS + '/cards';
export const USER_CARD = SETTINGS + '/card';
export const INIT_ADD_USER_CARD = USER_CARD + '/init';
export const USER_BANKS = SETTINGS + '/banks';
export const TRANSFER_BENEFICIARIES = USER_BANKS + '/beneficiary';
export const REFERRAL_ACTIVITIES = SETTINGS + '/referrals/activities';

export const NOTIFICATIONS = SETTINGS + '/notification';
export const STORE_NOTIFICATION_TOKEN = NOTIFICATIONS + '/token';
export const GET_USER_NOTIFICATIONS = NOTIFICATIONS + '/device';

// WALLET
export const USER_WALLET = PECUNIA + '/wallet';

// TRANSACTIONS
export const TRANSACTIONS = PECUNIA + '/transaction';
export const GET_TRANSACTION_FEES = TRANSACTIONS + '/fees';

// SAVINGS
export const SAVINGS = PECUNIA + '/digital-bank/savings';
export const GET_SAVINGS_PRODUCTS = SAVINGS + '/products';
export const GET_SAVINGS_COLLECTION_MODES = SAVINGS + '/collection-methods';
export const GET_SAVINGS_FREQUENCIES = SAVINGS + '/frequency';
export const GET_SAVINGS_OFFERINGS = SAVINGS + '/offerings';
export const GET_SAVINGS_BREAKDOWN = PECUNIA + '/savings/breakdown';

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
export const BUY_AIRTIME = BILL_PAYMENT + '/buy-airtime';
export const BUY_DATA = BILL_PAYMENT + '/buy-data';
export const BILLER_CATEGORIES = BILL_PAYMENT + '/categories';
export const BILLER_ITEMS = BILL_PAYMENT + '/billers';
export const PAY_BILL = BILL_PAYMENT + '/pay';

// ACCOUNTS
export const ACCOUNTS = PECUNIA + '/digital-bank/accounts';
export const FUND_PRIMARY_ACCOUNT = ACCOUNTS + '/fund';
export const ACCOUNT_TRANSACTIONS = ACCOUNTS + '/transactions';
export const ACCOUNT_TRANSACTION_FEES = ACCOUNT_TRANSACTIONS + '/fees';
export const NAME_ENQUIRY = ACCOUNTS + '/nameenquiry';
export const FUNDS_TRANSFER = ACCOUNTS + '/transfer';