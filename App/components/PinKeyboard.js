import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { InteractionManager, View } from 'react-native';
import VirtualKeyboard from 'react-native-virtual-keyboard';

export default class PinKeyboard extends Component {
  render() {
    return (
      <View style={{ flex: 1, width: '100%' }}>
        <VirtualKeyboard
          color="black"
          pressMode="char"
          onPress={val =>
            InteractionManager.runAfterInteractions(() => this.onChange(val))
          }
          decimal={false}
          {...this.props}
        />
      </View>
    );
  }

  onChange(value) {
    if (this.props.onChange) this.props.onChange(value);
  }

  onSubmit() {
    if (this.props.onSubmit) this.props.onSubmit();
  }
}

PinKeyboard.propTypes = {
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  buttonTitle: PropTypes.string.isRequired
};

PinKeyboard.defaultProps = {
  buttonTitle: 'Unlock'
};
