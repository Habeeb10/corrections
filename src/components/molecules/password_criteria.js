import React, { Component } from 'react';
import { View } from 'react-native';

import { Criteria } from '_atoms';

class PasswordCriteria extends Component {
    render() {
        return (
            <View>
                <Criteria text="8 or more characters" violated={this.props.lengthError} />
                <Criteria text="An uppercase letter" violated={this.props.uppercaseError} />
                <Criteria text="A lowercase letter" violated={this.props.lowercaseError} />
                <Criteria text="A symbol (=!@#&$%)" violated={this.props.symbolError} />
            </View>
        );
    }
}

export default PasswordCriteria;
