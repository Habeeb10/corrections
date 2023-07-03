import React, { Component } from "react";
import {  Text } from 'react-native';
import { connect } from "react-redux";
import { Colors, Mixins, Typography, SharedStyle } from '_styles';

import moment from 'moment';

class VersionNumber extends Component {
  state = {
    isFocused: false,
  };

  render() {
    const v_date = this.props.settings.app_version_date ?  'Build ID - ' + moment(parseInt(this.props.settings.app_version_date)).format(
        "YYYYDDMM-HHMM"
      ) : '';
      
    return (
      <Text
        style={[{
          color: Colors.GRAY_DARK,
        ...Typography.FONT_MEDIUM,
          fontSize: Mixins.scaleFont(14),
          textAlign: "center",
          marginVertical: 10,
        }, this.props.style]}
      >{` v${this.props.settings.app_version} ${v_date}`}</Text>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    settings: state.settings,
  };
};

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VersionNumber);
