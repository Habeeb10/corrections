import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors, Mixins, Typography } from '_styles';
import { Tab } from '_atoms';

class Tabs extends Component {
    state = {
        activeTab: this.props.children[0].props.title
    }

    onClickTabItem = (tab) => {
        this.setState({ activeTab: tab });
    }

    render() {
        let children = this.props.children;
        return (
            <View>
                <View style={[styles.header, this.props.tabberStyle]}>
                    {children.map((child) => {
                        const { title } = child.props;
                        return (
                            <Tab
                                activeTab={this.state.activeTab}
                                key={title}
                                label={title}
                                onPress={this.onClickTabItem}
                                tabStyle={this.props.tabStyle}
                                tabTextStyle={this.props.tabTextStyle}
                                activeTabStyle={this.props.activeTabStyle}
                                activeTabTextStyle={this.props.activeTabTextStyle}
                            />
                        );
                    })}
                </View>
                <View style={styles.content}>
                    {children.map((child) => {
                        if (child.props.title !== this.state.activeTab) return null;
                        return child.props.children;
                    })}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: Colors.TAB_BG,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Mixins.scaleSize(8)
    },
    content: {
        ...Mixins.padding(24, 16, 60, 16)
    }
});

export default Tabs;
