import React, { Component } from "react";
import {
  BackHandler,
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import SwitchToggle from "@dooboo-ui/native-switch-toggle";

import { showToast } from "_actions/toast_actions";
import {
  getDropdownOptions,
  getStateOptions,
  getLgaOptions
} from "_actions/config_actions";
import { getUserNextOfKin } from "_actions/next_of_kin_actions";
import { getUserProfile } from "_actions/user_actions";
import NaijaStates from "naija-state-local-government";

import { Dictionary, Util } from "_utils";
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from "_styles";
import { ScrollView, SubHeader, FloatingLabelInput, ProgressBar } from "_atoms";
import { PrimaryButton } from "_molecules";
import { MainHeader, Dropdown } from "_organisms";

import { Network } from "_services";

class EditNextOfKin extends Component {
  constructor(props) {
    super(props);

    const { next_of_kin } = this.props.next_of_kin;
    const { nextOfKin } = this.props.user.user_data;
    const navigation = this.props.navigation;
    const title = navigation.getParam("title");
    const progress = navigation.getParam("progress");
    const redirect = navigation.getParam("redirect");

    this.state = {
      title,
      progress,
      redirect,
      name: nextOfKin.name ? nextOfKin.name.split(" ")[0] : "",
      first_name_error: "",
      gender: nextOfKin.gender
        ? {
            label: Util.capitalizeFirstLetter(nextOfKin.gender),
            value: nextOfKin.gender
          }
        : "",
      gender_error: "",
      last_name: nextOfKin.name ? nextOfKin.name.split(" ")[1] : "",
      last_name_error: "",
      email: nextOfKin.email || "",
      email_error: "",
      phone_number: nextOfKin.phoneNumber || "",
      phone_number_error: "",
      address: next_of_kin.address || "",
      address_error: "",
      relationships: [
        { label: "Brother", value: "Brother" },
        { label: "Sister", value: "Sister" },
        { label: "Father", value: "Father" },
        { label: "Mother", value: "Mother" },
        { label: "Friend", value: "Friend" },
        { label: "Mentor", value: "Mentor" },
        { label: "Pastor", value: "Pastor" },
        { label: "Spouse", value: "Spouse" }
        // ,{label:"Brother",value:"Brother"}
        // ,{label:"Brother",value:"Brother"}
      ],
      lgas: [],
      city: nextOfKin.city || "",
      city_error: "",
      state:
        nextOfKin.state != ""
          ? {
              label: nextOfKin.state
                ? Util.capitalizeFirstLetter(nextOfKin.state)
                : nextOfKin.state,
              value: nextOfKin.state
            }
          : "",
      state_error: "",
      lga:
        nextOfKin.lga != ""
          ? { label: nextOfKin.lga, value: nextOfKin.lga }
          : "",
      lga_error: "",
      nearest_landmark: nextOfKin.nearest_landmark || "",
      nearest_landmark_error: "",
      relationship:
        nextOfKin.relationShip != ""
          ? {
              label: Util.capitalizeFirstLetter(nextOfKin.relationShip),
              value: nextOfKin.relationShip
            }
          : "",
      relationship_error: "",
      copy_my_address: false,
      processing: false
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);

    // if (this.props.config.options.length === 0) {
    //     this.props.getDropdownOptions();
    // }

    // if (this.props.config.states.length === 0) {
    //     this.props.getStateOptions();
    // }

    // if (this.props.config.lgas.length === 0) {
    //     this.props.getLgaOptions();
    // }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      !this.state.processing && this.props.navigation.goBack();

      return true;
    }
  };

  getDataFromDropdownConfig = (key) => {
    let data = this.props.config.options.find((item) => {
      return item.key === key;
    });

    let options = data ? data.options : [];
    options = options.map((item) => {
      return {
        label: item.code_description,
        value: item.id
      };
    });

    return options;
  };

  getDropDownOption = (key, value) => {
    let options = this.getDataFromDropdownConfig(key);
    let preferred = options.filter((option) => {
      return option.label.toLowerCase() === value.toLowerCase();
    });

    return preferred.length > 0 ? preferred[0] : "";
  };

  getDataFromStateOptions = () => {
    let options = NaijaStates.states();
    options = options.map((item) => {
      return {
        label: item,
        value: item,
        ref_code: item
      };
    });

    return options;
  };

  getStateOption = (state) => {
    let options = this.getDataFromStateOptions();
    let preferred = options.filter((option) => {
      return option.label.toLowerCase() === state.toLowerCase();
    });

    return preferred.length > 0 ? preferred[0] : "";
  };

  getDataFromLgaOptions = (state) => {
    let data = NaijaStates.lgas(state);

    // console.log("dffuisd",data.l)
    // if (!init) {
    //     if (!this.state || !this.state.state || typeof this.state.state !== 'object') {
    //         return [];
    //     }

    //     options=NaijaStates.lgas(this.state.state.ref_code);
    //     //options = options.filter((lga) => { return lga.link_id === this.state.state.ref_code });
    // }

    let options = data.lgas.map((item) => {
      return {
        label: item,
        value: item
      };
    });

    this.setState({
      lgas: options
    });
    // return options;
  };

  getLgaIdOption = (lga_id) => {
    let options = this.getDataFromLgaOptions(true);
    let preferred = options.filter((option) => {
      return option.value === lga_id;
    });

    return preferred.length > 0 ? preferred[0] : "";
  };

  getLgaOption = (lga) => {
    let options = this.getDataFromLgaOptions(true);
    let preferred = options.filter((option) => {
      return option.label.toLowerCase() === lga.toLowerCase();
    });

    return preferred.length > 0 ? preferred[0] : "";
  };

  handleCopyMyAddress = () => {
    this.setState(
      {
        copy_my_address: !this.state.copy_my_address
      },
      () => {
        if (this.state.copy_my_address) {
          const { address,  } =
            this.props.user.user_data;
          if (address.length > 0) {
            this.setState({
              
              address_error: "",
              city:address[0].city,
              city_error: "",
              state: "",
              //state: state!=null ? this.getStateOption(state) : "",
              state_error: "",
              lga: "",
              // lgas:[],
              lga_error: "",
              nearest_landmark:address[0].street,
              nearest_landmark_error: ""
            });
          } else {
            this.props.showToast("No address to copy");
          }
        }
      }
    );
  };

  validate = () => {
    let is_valid = true;

    if (!this.state.name) {
      this.setState({
        first_name_error: Dictionary.REQUIRED_FIELD
      });

      is_valid = false;
    }

    if (!this.state.last_name) {
      this.setState({
        last_name_error: Dictionary.REQUIRED_FIELD
      });

      is_valid = false;
    }

    if (!this.state.email || !Util.isValidEmail(this.state.email)) {
      this.setState({
        email_error: Dictionary.ENTER_VALID_EMAIL
      });

      is_valid = false;
    }

    if (!Util.isValidPhone(this.state.phone_number)) {
      this.setState({
        phone_number_error: Dictionary.REQUIRED_FIELD
      });

      is_valid = false;
    }

    if (!this.state.address) {
      this.setState({
        address_error: Dictionary.REQUIRED_FIELD
      });

      is_valid = false;
    }

    if (!this.state.city) {
      this.setState({
        city_error: Dictionary.REQUIRED_FIELD
      });

      is_valid = false;
    }

    if (!this.state.state) {
      this.setState({
        state_error: Dictionary.REQUIRED_FIELD
      });

      is_valid = false;
    }

    if (!this.state.lga) {
      this.setState({
        lga_error: Dictionary.REQUIRED_FIELD
      });

      is_valid = false;
    }

    if (!this.state.nearest_landmark) {
      this.setState({
        nearest_landmark_error: Dictionary.REQUIRED_FIELD
      });

      is_valid = false;
    }

    if (!this.state.relationship) {
      this.setState({
        relationship_error: Dictionary.REQUIRED_FIELD
      });

      is_valid = false;
    }

    return is_valid;
  };

  handleSubmit = () => {
    if (!this.validate()) {
      return;
    }

    this.setState({ processing: true }, () => {
      let {
        name,
        last_name,
        gender,
        email,
        phone_number,
        relationship,
        address,
        city,
        state,
        lga,
        nearest_landmark
      } = this.state;

      Network.updateUserNextOfKin({
        id: this.props.user.user_data.id,
        bvn: this.props.user.user_data.bvn,
        nextOfKin: {
          name: name.trim() + " " + last_name.trim(),
          email,
          address,
          gender: gender.value,
          nearestLandMark: nearest_landmark,
          lga: lga.value,
          city,
          relationShip: relationship.value,
          phoneNumber: phone_number,
          state: state.value
        }
      })
        .then((result) => {
          this.setState({ processing: false }, () => {
            if (this.state.redirect) {
              this.props.getUserProfile();
              this.props.navigation.navigate(this.state.redirect);
            } else {
              this.handleBackButton();
              this.props.showToast(result.message, false);
              this.props.getUserProfile();
            }
          });
        })
        .catch((error) => {
          this.setState({ processing: false }, () =>
            this.props.showToast(error.message)
          );
        });
    });
  };

  render() {
    let { initializing, user } = this.props;
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={
            this.state.title ? this.state.title : Dictionary.NEXT_OF_KIN_HEADER
          }
        />
        {initializing && (
          <View style={SharedStyle.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
          </View>
        )}
        {!initializing && (
          <ScrollView {...this.props}>
            <SubHeader text={Dictionary.NEXT_OF_KIN_SUB_HEADER} />
            {this.state.progress && (
              <ProgressBar progress={this.state.progress} />
            )}
            <View style={[FormStyle.formContainer, styles.formContainer]}>
              <View style={FormStyle.formItem}>
                <FloatingLabelInput
                  label={Dictionary.FIRST_NAME_LABEL}
                  value={this.state.name}
                  multiline={false}
                  autoCorrect={false}
                  onChangeText={(text) =>
                    this.setState({
                      name: text,
                      name_error: ""
                    })
                  }
                  editable={!this.state.processing}
                />
                <Text style={FormStyle.formError}>{this.state.name_error}</Text>
              </View>

              <View style={FormStyle.formItem}>
                <FloatingLabelInput
                  label={Dictionary.LAST_NAME_LABEL}
                  value={this.state.last_name}
                  multiline={false}
                  autoCorrect={false}
                  onChangeText={(text) =>
                    this.setState({
                      last_name: text,
                      last_name_error: ""
                    })
                  }
                  editable={!this.state.processing}
                />
                <Text style={FormStyle.formError}>
                  {this.state.last_name_error}
                </Text>
              </View>

              <View style={FormStyle.formItem}>
                <Dropdown
                  options={[
                    {
                      label: "Male",
                      value: "male"
                    },
                    {
                      label: "Female",
                      value: "female"
                    }
                  ]}
                  value={""}
                  title={Dictionary.GENDER_LABEL}
                  onChange={(obj) => {
                    this.setState({
                      gender: obj,
                      gender_error: ""
                    });
                  }}
                >
                  <FloatingLabelInput
                    pointerEvents="none"
                    label={Dictionary.GENDER_LABEL}
                    value={this.state.gender.label || ""}
                    multiline={false}
                    autoCorrect={false}
                    editable={false}
                  />
                </Dropdown>
                <Text style={FormStyle.formError}>
                  {this.state.gender_error}
                </Text>
              </View>

              <View style={FormStyle.formItem}>
                <FloatingLabelInput
                  label={Dictionary.EMAIL_ADDRESS_LABEL}
                  value={this.state.email}
                  keyboardType={"email-address"}
                  multiline={false}
                  autoCorrect={false}
                  onChangeText={(text) =>
                    this.setState({
                      email: text,
                      email_error: ""
                    })
                  }
                  editable={!this.state.processing}
                />
                <Text style={FormStyle.formError}>
                  {this.state.email_error}
                </Text>
              </View>
              <View style={FormStyle.formItem}>
                <FloatingLabelInput
                  label={Dictionary.MOBILE_NUMBER_LABEL}
                  value={this.state.phone_number}
                  keyboardType={"number-pad"}
                  enterMobile
                  multiline={false}
                  maxLength={11}
                  autoCorrect={false}
                  onChangeText={(text) =>
                    this.setState({
                      phone_number: text.replace(/\D/g, ""),
                      phone_number_error: ""
                    })
                  }
                  editable={!this.state.processing}
                />
                <Text style={FormStyle.formError}>
                  {this.state.phone_number_error}
                </Text>
              </View>
              <View style={FormStyle.formItem}>
                <Dropdown
                  options={this.state.relationships}
                  value={""}
                  title={Dictionary.RELATIONSHIP_LABEL}
                  onChange={(obj) => {
                    this.setState({
                      relationship: obj,
                      relationship_error: ""
                    });
                  }}
                >
                  <FloatingLabelInput
                    pointerEvents="none"
                    label={Dictionary.RELATIONSHIP_LABEL}
                    value={this.state.relationship.label || ""}
                    multiline={false}
                    autoCorrect={false}
                    editable={false}
                  />
                </Dropdown>
                <Text style={FormStyle.formError}>
                  {this.state.relationship_error}
                </Text>
              </View>
              {/* <View style={[FormStyle.formItem, styles.copyAddress]}>
                <Text style={styles.copyAddressLabel}>
                  {Dictionary.COPY_MY_ADDRESS_LABEL}
                </Text>
                <SwitchToggle
                  containerStyle={FormStyle.switchContainer}
                  circleStyle={FormStyle.switchCircle}
                  switchOn={this.state.copy_my_address}
                  onPress={() => this.handleCopyMyAddress()}
                  backgroundColorOn={Colors.GREEN}
                  backgroundColorOff={Colors.LIGHT_GREY}
                  circleColorOff={Colors.WHITE}
                  circleColorOn={Colors.WHITE}
                  duration={50}
                />
              </View> */}
              <View style={FormStyle.formItem}>
                <FloatingLabelInput
                  label={Dictionary.STREET_LABEL}
                  value={this.state.address}
                  multiline={false}
                  autoCorrect={false}
                  onChangeText={(text) =>
                    this.setState({
                      address: text,
                      address_error: "",
                      copy_my_address: false
                    })
                  }
                  editable={!this.state.processing}
                />
                <Text style={FormStyle.formError}>
                  {this.state.address_error}
                </Text>
              </View>
              <View style={FormStyle.formItem}>
                <FloatingLabelInput
                  label={Dictionary.CITY_LABEL}
                  value={this.state.city}
                  multiline={false}
                  autoCorrect={false}
                  onChangeText={(text) =>
                    this.setState({
                      city: text,
                      city_error: "",
                      copy_my_address: false
                    })
                  }
                  editable={!this.state.processing}
                />
                <Text style={FormStyle.formError}>{this.state.city_error}</Text>
              </View>
              <View style={FormStyle.formItem}>
                <Dropdown
                  options={this.getDataFromStateOptions()}
                  value={""}
                  title={Dictionary.STATE_LABEL}
                  onChange={(obj) => {
                    this.getDataFromLgaOptions(obj.value);
                    this.setState({
                      state: obj,
                      state_error: "",
                      lga: "",
                      copy_my_address: false
                    });
                  }}
                >
                  <FloatingLabelInput
                    pointerEvents="none"
                    label={Dictionary.STATE_LABEL}
                    value={this.state.state.label || ""}
                    multiline={false}
                    autoCorrect={false}
                    editable={false}
                  />
                </Dropdown>
                <Text style={FormStyle.formError}>
                  {this.state.state_error}
                </Text>
              </View>
              <View style={FormStyle.formItem}>
                <Dropdown
                  options={this.state.lgas}
                  value={""}
                  title={Dictionary.LGA_LABEL}
                  emptyListMessage={Dictionary.STATE_REQUIRED_FOR_LGA}
                  onChange={(obj) => {
                    this.setState({
                      lga: obj,
                      lga_error: "",
                      copy_my_address: false
                    });
                  }}
                >
                  <FloatingLabelInput
                    pointerEvents="none"
                    label={Dictionary.LGA_LABEL}
                    value={this.state.lga.label || ""}
                    multiline={false}
                    autoCorrect={false}
                    editable={false}
                  />
                </Dropdown>
                <Text style={FormStyle.formError}>{this.state.lga_error}</Text>
              </View>
              <View style={FormStyle.formItem}>
                <FloatingLabelInput
                  label={Dictionary.LANDMARK_LABEL}
                  value={this.state.nearest_landmark}
                  multiline={false}
                  autoCorrect={false}
                  onChangeText={(text) =>
                    this.setState({
                      nearest_landmark: text,
                      nearest_landmark_error: "",
                      copy_my_address: false
                    })
                  }
                  editable={!this.state.processing}
                />
                <Text style={FormStyle.formError}>
                  {this.state.nearest_landmark_error}
                </Text>
              </View>
            </View>
            <View style={SharedStyle.bottomPanel}>
              <View style={FormStyle.formButton}>
                <PrimaryButton
                  loading={this.state.processing}
                  title={
                    this.state.redirect
                      ? Dictionary.CONTINUE_BTN
                      : Dictionary.UPDATE_BTN
                  }
                  icon="arrow-right"
                  onPress={this.handleSubmit}
                />
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  formContainer: {
    paddingBottom: Mixins.scaleSize(50)
  },
  copyAddress: {
    flexDirection: "row",
    alignItems: "center"
  },
  copyAddressLabel: {
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.LIGHT_GREY,
    marginRight: Mixins.scaleSize(10)
  }
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    next_of_kin: state.next_of_kin,
    config: state.config,
    initializing:
      state.config.loading_options ||
      state.config.loading_states ||
      state.config.loading_lgas
  };
};

const mapDispatchToProps = {
  showToast,
  getUserNextOfKin,
  getDropdownOptions,
  getStateOptions,
  getLgaOptions,
  getUserProfile
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(EditNextOfKin));
