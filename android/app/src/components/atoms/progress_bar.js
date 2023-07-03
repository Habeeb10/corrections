import React, { Component } from 'react';
import * as Progress from 'react-native-progress';

import { Colors, Mixins } from '_styles';

class ProgressBar extends Component {

    render() {
        return (
            <Progress.Bar
                animated={false}
                progress={this.props.progress ? this.props.progress : 0}
                width={null}
                height={this.props.height ? this.props.height : Mixins.scaleSize(8)}
                unfilledColor={this.props.unfilledColor ? this.props.unfilledColor : Colors.PROGRESS_BG}
                color={this.props.color ? this.props.color : Colors.YELLOW_PROGRESS}
                borderWidth={0} />
        );
    }
}

export default ProgressBar;