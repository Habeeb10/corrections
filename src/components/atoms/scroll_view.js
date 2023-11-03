import React, { Component } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Mixins } from '_styles';

export default class ScrollView extends Component {
    render() {
        let hasNavBar = typeof this.props.hasNavBar === 'undefined' || this.props.hasNavBar;
        let hasButtomButtons = typeof this.props.hasButtomButtons !== 'undefined' && this.props.hasButtomButtons;
        let minHeight = hasNavBar ? this.props.screenProps.scrollWithTabHeight : this.props.screenProps.scrollHeight;
        minHeight = this.props.noStatusBar ? minHeight + Mixins.STATUS_BAR_HEIGHT : minHeight;
        return (
            <KeyboardAwareScrollView
                contentContainerStyle={{
                    minHeight,
                    paddingBottom: hasButtomButtons ? Mixins.scaleSize(70) : Mixins.scaleSize(0)
                }}
                keyboardShouldPersistTaps={'handled'}
                alwaysBounceHorizontal={false}
                alwaysBounceVertical={false}
                enableResetScrollToCoords={false}
                bounces={false}
                ref={ref => {
                    if (this.props.setScrollRef) {
                        this.props.setScrollRef(ref);
                    }
                }}>
                {this.props.children}
            </KeyboardAwareScrollView>
        );
    }
}