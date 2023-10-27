import { createStackNavigator } from "react-navigation-stack";

//import Login from '_screens/auth/login';
import Login from "_screens/auth/new_login";
import SystemUpgrade from "_screens/auth/system_upgrade";
import SystemUpgradeAlmostDone from "_screens/auth/system_upgrade_almost_done";
import AuthorizeDevice from "_screens/auth/authorize_device";
import ForgotPassword from "_screens/auth/forgot_password";
import Password from "_screens/auth/password";
import ForgotPasswordOTP from "_screens/auth/forgot_password_otp";
import ResetPassword from "_screens/auth/reset_password";
import EnterMobile from "_screens/onboarding/enter_mobile";
import ValidateMobile from "_screens/onboarding/validate_mobile";
import CreatePassword from "_screens/onboarding/create_password";
import CreateUser from "_screens/onboarding/create_user";
import GetHelpSupport from "_screens/settings/get_Help";

import EnterBVN from "_screens/onboarding/enter_bvn";
import ValidateBVN from "_screens/onboarding/validate_bvn";
import EnterEmail from "_screens/onboarding/enter_email";
import ValidateEmail from "_screens/onboarding/validate_email";
import UploadID from "_screens/onboarding/upload_identity";
import UploadUtility from "_screens/onboarding/upload_utility";
import CreatePIN from "_screens/onboarding/create_pin";

const RouteConfigs = {
  Login,
  AuthorizeDevice,
  EnterMobile,
  ValidateMobile,
  CreatePassword,
  Password,
  CreateUser,
  EnterBVN,
  ValidateBVN,
  EnterEmail,
  ValidateEmail,
  UploadID,
  UploadUtility,
  CreatePIN,
  ForgotPassword,
  ForgotPasswordOTP,
  ResetPassword,
  SystemUpgrade,
  SystemUpgradeAlmostDone,
  GetHelpSupport,
};

const AuthNavigator = createStackNavigator(RouteConfigs, {
  header: null,
  headerMode: "none",
});

export default AuthNavigator;
