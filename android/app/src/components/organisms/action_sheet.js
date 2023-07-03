import React, { Component } from 'react';

import { Image, Text, View, ScrollView, TouchableHighlight, TextInput } from 'react-native';
import Modal from "react-native-modal";
import { Ionicons } from '@expo/vector-icons';

import { TouchItem } from '_atoms';
import { Mixins, Typography } from '_styles';

class ActionSheet extends Component {
    constructor(props) {

        super(props);

        this.state = {
            searchTerm: '',
            options: [],
            filteredOptions: []
        }

        this.closeModal = this.closeModal.bind(this);

        this.setValue = this.setValue.bind(this);
    }

    componentDidMount() {
        this.setState({
            options: this.props.options
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.options.length !== nextProps.options.length) {
            this.setState({
                options: nextProps.options
            })
        }
    }

    render() {
        let optionItems = [];
        let options = this.state.searchTerm ? [...this.state.filteredOptions] : [...this.state.options]
        optionItems = options.map((item, index) => {
            let icon = { uri: item.imageUrl }

            return (
                <TouchableHighlight key={index} underlayColor="#f7f7f7" activeOpacity={0.75}
                    onPress={() => {
                        this.setValue(item)
                    }}>
                    <View style={{
                        borderBottomColor: '#eee',
                        borderBottomWidth: 1,
                        height: Mixins.scaleSize(50),
                        alignItems: 'center',
                        flexDirection: 'row'
                    }}>
                        {!!item.imageUrl && (
                            <Image
                                style={{
                                    ...Mixins.margin(10),
                                    width: Mixins.scaleSize(30),
                                    height: Mixins.scaleSize(30),
                                    borderRadius: Mixins.scaleSize(5)
                                }}
                                source={icon}
                                resizeMode={'contain'}
                            />
                        )}
                        <View style={{ flex: 1, paddingRight: Mixins.scaleSize(20) }}>
                            <Text
                                numberOfLines={1}
                                style={[styles.optionsTitle, { ...this.props.optionsStyle }]}>
                                {item.label}
                            </Text>
                            <Text
                                style={[styles.options, { ...this.props.optionsStyle }]}>
                                {item.subtitle}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        });

        return (
            <View style={[styles.container, this.props.style]}>
                <Modal
                    animationIn={'slideInUp'}
                    onBackdropPress={() => this.closeModal()}
                    isVisible={this.props.show}
                    style={{ margin: 0 }}>
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        top: Mixins.scaleSize(218),
                        borderTopLeftRadius: Mixins.scaleSize(10),
                        borderTopRightRadius: Mixins.scaleSize(10),
                        backgroundColor: "white"
                    }}>
                        <View style={{}}>
                            <View style={{
                                height: Mixins.scaleSize(48),
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottomWidth: 1,
                                borderBottomColor: '#eee',
                                paddingLeft: Mixins.scaleSize(20),
                                paddingRight: Mixins.scaleSize(5),
                            }}>
                                <Text
                                    style={styles.title}
                                    numberOfLines={1}>
                                    {this.props.title}
                                </Text>
                                <TouchItem onPress={this.closeModal}
                                    style={{ paddingHorizontal: Mixins.scaleSize(15) }}>
                                    <Ionicons name='ios-close'
                                        size={Mixins.scaleSize(30)}
                                        color={'rgba(0, 0, 0, 0.5400000214576721)'} />
                                </TouchItem>
                            </View>
                            <View style={{ ...Mixins.padding(20, 20, 0, 20), width: '100%' }}>
                                <TextInput
                                    style={[styles.search]}
                                    underlineColorAndroid={'transparent'}
                                    placeholder={'Search'}
                                    onChangeText={this.onSearchChange}
                                    value={this.state.searchTerm}
                                    multiline={false}
                                    autoCorrect={false}
                                />
                            </View>
                        </View>
                        {!!this.props.loading && (
                            <Text style={[styles.otherTitle, { paddingLeft: 20 }]}>Loading..</Text>
                        )}
                        {this.props.options.length === 0 && !this.props.loading && (
                            <Text style={[styles.otherTitle, { paddingLeft: 20 }]}>{this.props.emptyListMessage || 'No Items'}</Text>
                        )}
                        <ScrollView
                            style={{
                                /// elevation: 2,
                                borderWidth: Mixins.scaleSize(3),
                                minWidth: Mixins.scaleSize(300),
                                width: '100%',
                                paddingLeft: Mixins.scaleSize(20),
                                paddingRight: Mixins.scaleSize(20),
                                backgroundColor: 'white'
                            }}
                            contentContainerStyle={{ backgroundColor: "white" }}
                            scrollEnabled={true}
                            keyboardShouldPersistTaps={'always'}
                            enableOnAndroid={true}
                        >
                            {optionItems}
                        </ScrollView>
                    </View>
                </Modal>
            </View>
        );
    }

    setValue(valueObj) {
        if (this.props.onChange) {
            this.props.onChange(valueObj);
            this.closeModal();
        }
    }

    closeModal() {
        this.setState({
            showModal: false,
            searchTerm: '',
            filteredOptions: []
        }, () => {
            this.props.close();
        });
    }

    onSearchChange = (searchTerm) => {
        let options = [...this.state.options]
        let filteredOptions = options.filter((option) => {
            return option.label.toLowerCase().includes(searchTerm.toLowerCase())
        })

        this.setState({
            filteredOptions,
            searchTerm
        })

    }
}


let styles = {
    container: {},
    search: {
        borderColor: '#efefef',
        borderWidth: 1,
        height: Mixins.scaleSize(48),
        fontSize: Mixins.scaleFont(14),
        width: '100%',
        marginBottom: 20,
        letterSpacing: Mixins.scaleSize(-0.3),
        color: 'rgba(0, 0, 0, 0.699999988079071)',
        fontFamily: Typography.FONT_FAMILY_REGULAR,
        borderRadius: Mixins.scaleSize(5),
        paddingLeft: Mixins.scaleSize(10),
        paddingRight: Mixins.scaleSize(10),
        backgroundColor: '#EFF2F7',
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        color: '#00425F',
        fontFamily: Typography.FONT_FAMILY_REGULAR,
        fontSize: Mixins.scaleFont(16),
        letterSpacing: Mixins.scaleSize(-0.3),
        width: '87%'
    },
    options: {
        fontSize: Mixins.scaleFont(12),
        color: 'rgba(0, 0, 0, 0.5400000214576721)',
        fontFamily: Typography.FONT_FAMILY_REGULAR,
        width: '90%'
    },
    optionsTitle: {
        color: 'rgba(0, 0, 0, 0.8700000047683716)',
        fontFamily: Typography.FONT_FAMILY_REGULAR,
        fontSize: Mixins.scaleFont(16)
    }
}

export default ActionSheet; 