import React, { Component } from 'react';
import { BackHandler, ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';
import { getDropdownOptions, getStateOptions, getLgaOptions } from '_actions/config_actions';
import { getUserProfile } from '_actions/user_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, SharedStyle, FormStyle } from '_styles';
import { ScrollView, FloatingLabelInput } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader, Dropdown } from '_organisms';
import NaijaStates from 'naija-state-local-government';


import { Network } from '_services';

class EditProfile extends Component {
    constructor(props) {
        super(props);

        let { user_data } = this.props.user;

        this.state = {
            email: user_data.email || '',
            email_error: '',
            gender: user_data.gender|| '',
           // gender: user_data.gender?{label:Util.capitalizeFirstLetter(user_data.gender),value:user_data.gender} : '',
            gender_error: '',
            marital_lists: [
                { label: "Married", value: "Married" },
                { label: "Single", value: "Single" },
                { label: "Divorced", value: "Divorced" },
                
                // ,{label:"Brother",value:"Brother"}
                // ,{label:"Brother",value:"Brother"}
              ],
            marital_status: user_data.maritalStatus || '',
            //marital_status: user_data.maritalStatus ?{label:Util.capitalizeFirstLetter(user_data.maritalStatus),value:user_data.maritalStatus} : '',
            marital_status_error: '',
            address: user_data.address.length>0? user_data.address[0].address1: '',
            address_error: '',
            city: user_data.address.length>0 ?user_data.address[0].city :'',
            city_error: '',
            state:  user_data.address.length>0 ?{label:Util.capitalizeFirstLetter(user_data.address[0].state||""),value:user_data.address[0].state} : '',
            state_error: '',
            lgas:[],
            lga: user_data.lga ?{label:user_data.lga,value:user_data.lga} : '',
            lga_error: '',
            nearest_landmark: user_data.nearestLandMark || '',
            nearest_landmark_error: '',
            processing: false
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

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
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            !this.state.processing && this.props.navigation.goBack();

            return true;
        }
    }

    getDataFromDropdownConfig = (key) => {
        let data = this.props.config.options.find(item => {
            return item.key === key;
        });

        let options = data ? data.options : [];
        options = options.map(item => {
            return {
                label: item.code_description,
                value: item.id,
            }
        })

        return options;
    }

    getDropDownOption = (key, value) => {
        let options = this.getDataFromDropdownConfig(key);
        let preferred = options.filter((option) => {
            return option.label.toLowerCase() === value.toLowerCase();
        });

        return preferred.length > 0 ? preferred[0] : '';
    }

    getDataFromStateOptions = () => {
         let options = NaijaStates.states();
        options = options.map(item => {
            return {
                label: item,
                value: item,
                ref_code: item
            }
        });

        return options;
    }

    getStateOption = (state) => {
        let options = this.getDataFromStateOptions();
        let preferred = options.filter((option) => {
            return option.label.toLowerCase() === state.toLowerCase();
        });

        return preferred.length > 0 ? preferred[0] : '';
    }

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

       let options = data.lgas.map(item => {
            return {
                label: item,
                value: item,
            }
        })
        
        this.setState({
            lgas:options
        })
       // return options;
    }

    getLgaOption = (lga) => {
        let options = this.getDataFromLgaOptions(true);
        let preferred = options.filter((option) => {
            return option.label.toLowerCase() === lga.toLowerCase();
        });

        return preferred.length > 0 ? preferred[0] : '';
    }

    validate = () => {
        let is_valid = true;

        if (!this.state.email || !Util.isValidEmail(this.state.email)) {
            this.setState({
                email_error: Dictionary.ENTER_VALID_EMAIL,
            });

            is_valid = false;
        }

        if (!this.state.gender) {
            this.setState({
                gender_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.marital_status) {
            this.setState({
                marital_status_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.address) {
            this.setState({
                address_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.city) {
            this.setState({
                city_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.state) {
            this.setState({
                state_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.lga) {
            this.setState({
                lga_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.nearest_landmark) {
            this.setState({
                nearest_landmark_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        return is_valid;
    }

    handleSubmit = () => {
        if (!this.validate()) {
            return;
        }


        this.setState({ processing: true }, () => {
            let { email, gender, marital_status, address, city, state, lga, nearest_landmark } = this.state;

            Network.updateUserProfile({
                email,
                bvn:this.props.user.user_data.bvn,
                gender: gender.value,
                maritalStatus: marital_status.value,
                street: address,
                city,
                state: state.value,
                lga: lga.value,
                nearestLandMark:nearest_landmark
            }).then((result) => {
                this.setState({ processing: false }, () => {
                    this.handleBackButton();
                    this.props.showToast(result.message, false);
                    this.props.getUserProfile();
                });
            }).catch((error) => {
                this.setState({ processing: false }, () =>
                    this.props.showToast(error.message));
            });
        });
    }

    render() {
        let { initializing } = this.props;
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.PROFILE_HEADER} />
                {initializing && (
                    <View style={SharedStyle.loaderContainer}>
                        <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                    </View>
                )}
                {!initializing && (
                    <ScrollView {...this.props}>
                        <View style={[FormStyle.formContainer, styles.formContainer]}>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                
                                    label={Dictionary.EMAIL_ADDRESS_LABEL}
                                    value={this.state.email}
                                    keyboardType={'email-address'}
                                    multiline={false}
                                    autoCorrect={false}
                                    onChangeText={text => this.setState({
                                        email: text,
                                        email_error: ''
                                    })}
                                    editable={false}
                                />
                                <Text style={FormStyle.formError}>{this.state.email_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                            <FloatingLabelInput
                                
                                label={Dictionary.GENDER_LABEL}
                                value={this.state.gender}
                                // keyboardType={'email-address'}
                                // multiline={false}
                                // autoCorrect={false}
                                onChangeText={text => this.setState({
                                    gender: text,
                                    gender_error: ''
                                })}
                                editable={false}
                            />
                                {/* <Dropdown
                                    options={[{
                                        label:"Male",value:"male",
                                    },{
                                        label:"Female",value:"female",
                                    }]}
                                    value={''}
                                    title={Dictionary.GENDER_LABEL}
                                    onChange={(obj) => {
                                        this.setState({
                                            gender: obj,
                                            gender_error: ''
                                        })
                                    }}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.GENDER_LABEL}
                                        value={this.state.gender.label || ''}
                                        multiline={false}
                                        autoCorrect={false}
                                        editable={false}
                                    />
                                </Dropdown> */}
                                <Text style={FormStyle.formError}>{this.state.gender_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>

                           
                                <Dropdown
                                    options={this.state.marital_lists}
                                    value={''}
                                    title={Dictionary.MARITAL_STATUS_LABEL}
                                    onChange={(obj) => {
                                        this.setState({
                                            marital_status: obj,
                                            marital_status_error: ''
                                        })
                                    }}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.MARITAL_STATUS_LABEL}
                                        value={this.state.marital_status.label || ''}
                                        multiline={false}
                                        autoCorrect={false}
                                        editable={false}
                                    />
                                </Dropdown>
                                <Text style={FormStyle.formError}>{this.state.marital_status_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.STREET_LABEL}
                                    value={this.state.address}
                                    multiline={false}
                                    autoCorrect={false}
                                    onChangeText={text => this.setState({
                                        address: text,
                                        address_error: ''
                                    })}
                                    editable={!this.state.processing}
                                />
                                <Text style={FormStyle.formError}>{this.state.address_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.CITY_LABEL}
                                    value={this.state.city}
                                    multiline={false}
                                    autoCorrect={false}
                                    onChangeText={text => this.setState({
                                        city: text,
                                        city_error: ''
                                    })}
                                    editable={!this.state.processing}
                                />
                                <Text style={FormStyle.formError}>{this.state.city_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <Dropdown
                                    options={this.getDataFromStateOptions()}
                                    value={''}
                                    title={Dictionary.STATE_LABEL}
                                    onChange={(obj) => {
                                        this.getDataFromLgaOptions(obj.value)
                                        this.setState({
                                            state: obj,
                                            state_error: '',
                                            lga: ''
                                        })
                                    }}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.STATE_LABEL}
                                        value={this.state.state.label || ''}
                                        multiline={false}
                                        autoCorrect={false}
                                        editable={false}
                                    />
                                </Dropdown>
                                <Text style={FormStyle.formError}>{this.state.state_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <Dropdown
                                    options={this.state.lgas}
                                    value={''}
                                    title={Dictionary.LGA_LABEL}
                                    emptyListMessage={Dictionary.STATE_REQUIRED_FOR_LGA}
                                    onChange={(obj) => {
                                        this.setState({
                                            lga: obj,
                                            lga_error: ''
                                        })
                                    }}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.LGA_LABEL}
                                        value={this.state.lga.label || ''}
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
                                    onChangeText={text => this.setState({
                                        nearest_landmark: text,
                                        nearest_landmark_error: ''
                                    })}
                                    editable={!this.state.processing}
                                />
                                <Text style={FormStyle.formError}>{this.state.nearest_landmark_error}</Text>
                            </View>
                        </View>
                        <View style={SharedStyle.bottomPanel}>
                            <View style={FormStyle.formButton}>
                                <PrimaryButton
                                    loading={this.state.processing}
                                    title={Dictionary.UPDATE_BTN}
                                    icon="arrow-right"
                                    onPress={this.handleSubmit} />
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
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        config: state.config,
        initializing: state.config.loading_options || state.config.loading_states || state.config.loading_lgas
    };
};

const mapDispatchToProps = {
    showToast,
    getUserProfile,
    getDropdownOptions,
    getStateOptions,
    getLgaOptions
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(EditProfile));