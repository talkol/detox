import React, {Component} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Linking,
  Platform,
  NativeModules,
} from 'react-native';

import * as Screens from './Screens';

const isAndroid = Platform.OS === 'android';

const { NativeModule } = NativeModules;

class example extends Component {

  constructor(props) {
    super(props);
    this.state = {
      screen: undefined,
      screenProps: {},
      url: undefined,
      notification: undefined
    };

    Linking.addEventListener('url', (params) => this._handleOpenURL(params));
  }

  renderButton(title, onPressCallback) {
    return (
      <TouchableOpacity onPress={() => {
        onPressCallback();
      }}>
        <Text style={{color: 'blue', marginBottom: 10}}>{title}</Text>
      </TouchableOpacity>
    );
  }

  renderScreenButton(title, component) {
    if(component == null) {
      throw new Error("Got no component for " + title);
    }

    return this.renderButton(title, () => {
      this.setState({screen: component});
    });
  }

  renderText(text) {
    return (
      <View style={{flex: 1, paddingTop: 20, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 25}}>
          {text}
        </Text>
      </View>
    );
  }

  async componentDidMount() {
    Linking.addEventListener('url', (params) => this._handleOpenURL(params));

    const url = await Linking.getInitialURL();
    if (url) {
      console.log('App@didMount: Found pending URL', url);
      this.setState({url: url});
    }
  }

  render() {
    if (this.state.notification) {
      console.log("App@render: rendering a notification", this.state.notification);
      if (this.state.notification.title) {
        return this.renderText(this.state.notification.title);
      } else {
        return this.renderText(this.state.notification);
      }

    }

    else if (this.state.url) {
      console.log("App@render: rendering a URL:", this.state.url);
      return this.renderText(this.state.url);
    }

    if (!this.state.screen) {
		  console.log("App@render: JS rendering main screen");
      return (
        <View style={{flex: 1, paddingTop: 10, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontSize: 20, marginBottom: 10}}>
            Choose a test
          </Text>
          {this.renderScreenButton('Language', Screens.LanguageScreen)}
          {this.renderScreenButton('Sanity', Screens.SanityScreen)}
          {this.renderScreenButton('Matchers', Screens.MatchersScreen)}
          {this.renderScreenButton('Actions', Screens.ActionsScreen)}
          {this.renderScreenButton('Integrative Actions', Screens.IntegActionsScreen)}
          {this.renderScreenButton('FS Scroll Actions', Screens.ScrollActionsScreen)}
          {this.renderScreenButton('Assertions', Screens.AssertionsScreen)}
          {this.renderScreenButton('WaitFor', Screens.WaitForScreen)}
          {this.renderScreenButton('Stress', Screens.StressScreen)}
          {this.renderScreenButton('Switch Root', Screens.SwitchRootScreen)}
          {this.renderScreenButton('Timeouts', Screens.TimeoutsScreen)}
          {this.renderScreenButton('Orientation', Screens.Orientation)}
          {this.renderScreenButton('Permissions', Screens.Permissions)}
          {this.renderScreenButton('Network', Screens.NetworkScreen)}
          {this.renderAnimationScreenButtons()}
          {this.renderScreenButton('Device', Screens.DeviceScreen)}
          {this.renderScreenButton('Location', Screens.LocationScreen)}
          {!isAndroid && this.renderScreenButton('DatePicker', Screens.DatePickerScreen)}
          {!isAndroid && this.renderScreenButton('Picker', Screens.PickerViewScreen)}

          { /* TODO: Push this into a dedicated screen */ }
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            {this.renderButton('Crash', () => {
              // Note: this crashes the native-modules thread (and thus an *uncaught* exception, on Android).
              throw new Error('Simulated Crash');
            })}
            {isAndroid && <Text style={{width: 10}}> | </Text>}
            {isAndroid && this.renderButton('UI Crash', () => {
              // Killing main-thread while handling a tap will evidently cause
              // the tap-action itself to fail and thus for an error to be responded
              NativeModule.crashMainThread();
            })}
            {isAndroid && <Text style={{width: 10}}> | </Text>}
            {isAndroid && this.renderButton('ANR', () => {
              NativeModule.chokeMainThread();
            })}
          </View>

          {this.renderScreenButton('Shake', Screens.ShakeScreen)}
          {isAndroid && this.renderScreenButton('Launch Args', Screens.LaunchArgsScreen)}
        </View>
      );
    }
    const Screen = this.state.screen;
    return (
      <Screen/>
    );
  }

  renderAnimationScreenButtons() {
    return (
      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
        {this.renderScreenButton('RN Animations', Screens.RNAnimationsScreen)}
        {isAndroid && <Text style={{width: 10}}> | </Text>}
        {isAndroid && this.renderScreenButton('Native Animation', Screens.NativeAnimationsScreen)}
      </View>
    );
  }

  _handleOpenURL(params) {
    console.log('App@handleOpenURL:', params);
    this.setState({url: params.url});
  }
}

module.exports = example;
