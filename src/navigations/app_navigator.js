import { createStackNavigator } from 'react-navigation-stack';

import AddCard from '_screens/shared/add_card_new';
import AddAccount from '_screens/shared/add_account';
import PaymentMethods from '_screens/shared/payment_methods';
import USSDPayment from '_screens/shared/ussd_payment';
import USSDProcessor from '_screens/shared/ussd_processor';
import Success from '_screens/shared/success';
import TransferSuccess from '_screens/shared/new_success';
import Error from '_screens/shared/error';
import Receipt from '_screens/shared/receipt';
import SelectDebitMethod from '_screens/shared/select_debit_method';

import Dashboard from '_screens/dashboard';
import OnboardSelfie from '_screens/dashboard/onboard_selfie';

import Notifications from '_screens/notifications';

import Transactions from '_screens/transactions';

import Settings from '_screens/settings';
import ContactSupport from '_screens/settings/contact_support';
import ChangePassword from '_screens/settings/change_password';
import ChangePIN from '_screens/settings/change_pin';
import Biometrics from '_screens/settings/biometrics';
import AppNotifications from '_screens/settings/app_notifications';
import ForgotPINOTP from '_screens/settings/forgot_pin_otp';
import ResetPIN from '_screens/settings/reset_pin';
import Documents from '_screens/settings/documents';
import UploadDocument from '_screens/settings/upload_document';
import Profile from '_screens/settings/profile';
import UploadSelfie from '_screens/settings/upload_selfie';
import EditProfile from '_screens/settings/edit_profile';
import NextOfKIN from '_screens/settings/next_of_kin';
import EditNextOfKin from '_screens/settings/edit_next_of_kin';
import AccountsAndCards from '_screens/settings/accounts_and_cards';

import FundWallet from '_screens/fund_wallet';
import FundWalletBank from '_screens/fund_wallet/fund_wallet_bank';
import FundWalletCard from '_screens/fund_wallet/fund_wallet_card';

import Savings from '_screens/savings';
import ArchivedSavings from '_screens/savings/archived_savings';
import NewSavingsPlan from '_screens/savings/new_savings_plan';
import SavingsAmount from '_screens/savings/savings_amount';
import SavingsSummary from '_screens/savings/savings_summary';
import SavingsDetail from '_screens/savings/savings_detail';
import SavingsTransactions from '_screens/savings/savings_transactions';
import SavingsTopUp from '_screens/savings/savings_top_up';
import SavingsTopUpSummary from '_screens/savings/savings_top_up_summary';
import SavingsWithdrawal from '_screens/savings/savings_withdrawal';
import RolloverSavings from '_screens/savings/rollover_savings';
import EditSavingsPlan from '_screens/savings/edit_savings_plan';

import Loans from '_screens/loans';
import LoanRequirements from '_screens/loans/loan_requirements';
import LoanAmount from '_screens/loans/loan_amount';
import LoanReason from '_screens/loans/loan_reason';
import LoanPersonalDetails from '_screens/loans/loan_personal_details';
import LoanEmploymentDetails from '_screens/loans/loan_employment_details';
import LoanUploadID from '_screens/loans/loan_upload_id';
import LoanUserSummary from '_screens/loans/loan_user_summary';
import LoanEligibility from '_screens/loans/loan_eligibility';
import LoanBreakdown from '_screens/loans/loan_breakdown';
import LoanTerms from '_screens/loans/loan_terms';
import LoanGuarantor from '_screens/loans/loan_guarantor';
import LoanApplicationSummary from '_screens/loans/loan_application_summary';
import LoanDetail from '_screens/loans/loan_detail';
import LoanHistory from '_screens/loans/loan_history';
import RepayLoan from '_screens/loans/repay_loan';
import RepayLoanCard from '_screens/loans/repay_loan_card';

import Data from '_screens/data';
import DataNetwork from '_screens/data/data_network';
import DataPackage from '_screens/data/data_package';
import DataSummary from '_screens/data/data_summary';

import Airtime from '_screens/airtime';
import AirtimeBeneficiary from '_screens/airtime/airtime_beneficiary';
import AirtimeSummary from '_screens/airtime/airtime_summary';

import Bills from '_screens/bills';
import BillsCategory from '_screens/bills/bills_category';
import BillsBiller from '_screens/bills/bills_biller';
import BillsPackage from '_screens/bills/bills_package';
import BillsCustomer from '_screens/bills/bills_customer';
import BillsSummary from '_screens/bills/bills_summary';

import Transfers from '_screens/transfers';
import TransferAmount from '_screens/transfers/transfer_amount';
import TransferBeneficiary from '_screens/transfers/transfer_beneficiary';
import TransferConfirmBeneficiary from '_screens/transfers/transfer_confirm_beneficiary';
import TransferNarration from '_screens/transfers/transfer_narration';
import TransferSummary from '_screens/transfers/transfer_summary';

import Referrals from '_screens/referrals';
import ReferralActivities from '_screens/referrals/activities';

import AddDebitMethod from '_screens/add_debit_method';

import UploadID from '_screens/onboarding/upload_identity';
import UploadUtility from '_screens/onboarding/upload_utility';
import EnterEmail from '_screens/onboarding/enter_email';
import ValidateEmail from '_screens/onboarding/validate_email';

const DASHBOARD_STACK = createStackNavigator({
    Dashboard,
    OnboardSelfie,
    Receipt
}, { header: null, headerMode: 'none' });

const SETTINGS_STACK = createStackNavigator({
    Settings,
    ContactSupport,
    ChangePassword,
    ChangePIN,
    Biometrics,
    AppNotifications,
    ForgotPINOTP,
    ResetPIN,
    Documents:{screen: Documents, path: 'documents-kyc'},
    UploadDocument,
    Profile,
    UploadSelfie,
    EditProfile,
    NextOfKIN,
    EditNextOfKin,
    AccountsAndCards,
    AddCard,
    AddAccount,
    EnterEmail,
    ValidateEmail,
    UploadID,
    UploadUtility
}, { header: null, headerMode: 'none' });

const NOTIFICATIONS_STACK = createStackNavigator({
    Notifications
}, { header: null, headerMode: 'none' });

const TRANSACTIONS_STACK = createStackNavigator({
    Transactions,
    Receipt
}, { header: null, headerMode: 'none' });

const FUND_WALLET_STACK = createStackNavigator({
    FundWallet,
    FundWalletBank,
    FundWalletCard,
    USSDPayment,
    USSDProcessor,
    PaymentMethods,
    AddCard,
    AddAccount,
    Success,
    Error,
    Receipt
}, { header: null, headerMode: 'none' });

const SAVINGS_STACK = createStackNavigator({
    Savings: {screen: Savings, path: 'b'},
    ArchivedSavings,
    NewSavingsPlan,
    SavingsAmount,
    PaymentMethods,
    AddCard,
    AddAccount,
    SavingsSummary,
    Success,
    Error,
    Receipt,
    SavingsDetail,
    SavingsTransactions,
    SavingsTopUp,
    SavingsTopUpSummary,
    SavingsWithdrawal,
    RolloverSavings,
    EditSavingsPlan
}, { header: null, headerMode: 'none' });

const LOANS_STACK = createStackNavigator({
    Loans,
    LoanRequirements,
    LoanAmount,
    LoanReason,
    LoanPersonalDetails,
    LoanEmploymentDetails,
    EditNextOfKin,
    LoanUploadID,
    LoanUserSummary,
    LoanEligibility,
    LoanBreakdown,
    LoanTerms,
    PaymentMethods,
    AddCard,
    AddAccount,
    LoanGuarantor,
    LoanApplicationSummary,
    Success,
    Error,
    Receipt,
    LoanDetail,
    LoanHistory,
    RepayLoan,
    USSDPayment,
    USSDProcessor,
    RepayLoanCard
}, { header: null, headerMode: 'none' });

const DATA_STACK = createStackNavigator({
    Data,
    DataNetwork,
    DataPackage,
    DataSummary,
    Success,
    Error,
    Receipt
}, { header: null, headerMode: 'none' });

const AIRTIME_STACK = createStackNavigator({
    Airtime,
    AirtimeBeneficiary,
    AirtimeSummary,
    Success,
    Error,
    Receipt
}, { header: null, headerMode: 'none' });

const BILLS_STACK = createStackNavigator({
    Bills,
    BillsCategory,
    BillsBiller,
    BillsPackage,
    BillsCustomer,
    BillsSummary,
    Success,
    Error,
    Receipt
}, { header: null, headerMode: 'none' });

const TRANSFERS_STACK = createStackNavigator({
    Transfers,
    TransferAmount,
    TransferBeneficiary,
    TransferConfirmBeneficiary,
    TransferNarration,
    TransferSummary,
    Success,
    TransferSuccess,
    Error,
    Receipt
}, { header: null, headerMode: 'none' });

const REFERRALS_STACK = createStackNavigator({
    Referrals,
    ReferralActivities
}, { header: null, headerMode: 'none' });

const ADD_DEBIT_METHOD_STACK = createStackNavigator({
    AddDebitMethod,
    PaymentMethods,
    SelectDebitMethod
}, { header: null, headerMode: 'none' });

const AppNavigator = createStackNavigator({
    Dashboard: {screen: DASHBOARD_STACK, path: 'dashboard'},
    Settings: {screen: SETTINGS_STACK, path: 'settings'},
    Notifications: NOTIFICATIONS_STACK,
    Transactions: TRANSACTIONS_STACK,
    FundWallet: FUND_WALLET_STACK,
    Savings: {screen: SAVINGS_STACK, path: 'savings'},
    Loans: LOANS_STACK,
    Data: DATA_STACK,
    Airitme: AIRTIME_STACK,
    Bills: BILLS_STACK,
    Transfers: TRANSFERS_STACK,
    Referrals: REFERRALS_STACK,
    AddDebitMethod: ADD_DEBIT_METHOD_STACK,
}, { header: null, headerMode: 'none' });

export default AppNavigator;