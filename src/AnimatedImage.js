import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  Platform
} from "react-native";
import ImagePinchZoom from './ImagePinchZoom';
import Transition, { measurePropTypes } from './Transition';
import { calculateDestModalImageMeasure } from './utils';

const isAndroid = Platform.select({
  android: true,
  ios: false
});

const { width, height } = Dimensions.get('screen');

export default class AnimatedImage extends React.Component {
  state = {
    isAnimating: true,
    swipedY: 0,
    showMenu: true,
    imageWidth: this.props.imageSize.width,
    imageHeight: this.props.imageSize.height
  }

  static defaultProps = {
    sourceMeasure: {
      pageX: 0,
      pageY: 0,
      width: 1,
      height: 1
    },
    imageSize: {
      width: 1,
      height: 1
    },
    Menu: null,
    translucentStatusBar: true
  }

  animatedValue = new Animated.Value(0);

  close = () => this._onSwipeDown(0);

  _startAnimation = (value, callback, timer = 100) => setTimeout(() => {
    const { animationDuration } = this.props;
    Animated.timing(this.animatedValue, {
      toValue: value,
      duration: animationDuration || 200,
      useNativeDriver: true
    }).start(callback);
  }, timer);

  _showImageViewer = () => this.setState({ isAnimating: false });

  _onSwipeDown = (pageY) => {
    this.animatedValue.setValue(1);
    this.setState({swipedY: pageY, isAnimating: true}, () => {
      this._startAnimation(0, this.props.onClose, 0);
    });
  };

  _showMenuToggle = () => this.setState({ showMenu: !this.state.showMenu });

  _setImageSize = (width, height) => {
    this.setState({
      imageWidth: width,
      imageHeight: height
    }, () => this._startAnimation(1, this._showImageViewer, 50));
  }

  componentDidMount () {
    const { imageSize, source } = this.props;
    if (!source) return this.props.onClose();
    if (imageSize.width && imageSize.height) {
      this._startAnimation(1, this._showImageViewer, 50);
    } else {
      Image.getSize(source, this._setImageSize);
    }
  }

  render () {
    const { isAnimating, swipedY, showMenu, imageHeight, imageWidth } = this.state;
    const { source, sourceMeasure, Menu, translucentStatusBar } = this.props;
    const imageSize = {
      width: imageWidth,
      height: imageHeight
    };

    const destMeasure = calculateDestModalImageMeasure(imageSize, {width, height}, swipedY);
    const sourcePageY = (translucentStatusBar && isAndroid)
      ? sourceMeasure.pageY - StatusBar.currentHeight
      : sourceMeasure.pageY;

    const imageViewerStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1,
      backgroundColor: (isAnimating && swipedY === 0) ? 'black' : 'transparent',
      opacity: isAnimating ? 0 : 1
    };

    const menuElement = Menu
      ? <View style={{
          position: 'absolute',
          zIndex: 2,
          left: 0,
          top: 0
        }}>
          {Menu}
        </View>
      : <View />;

    if (!source) return <View />;

    return (
      <View style={{flex: 1, backgroundColor: 'transparent'}}>
        <StatusBar
          backgroundColor='black'
          barStyle='light-content'
          translucent={!isAndroid}
          hidden={!isAndroid}
        />

        {/* Transition components */}
        <Animated.View
          style={{
            ...imageViewerStyle,
            zIndex: 0,
            opacity: this.animatedValue
          }}
        />

        <Transition
          source={source}
          animatedValue={this.animatedValue}
          destMeasure={destMeasure}
          sourceMeasure={{...sourceMeasure, pageY: sourcePageY}}
          isAnimating={isAnimating}
        />

        <View style={imageViewerStyle}>
          {(!isAnimating && showMenu) && menuElement}
          <ImagePinchZoom
            onClick={this._showMenuToggle}
            cropWidth={width}
            cropHeight={height}
            maxOverflow={300}
            imageWidth={destMeasure.width}
            imageHeight={destMeasure.height}
            enableSwipeDown
            onSwipeDown={this._onSwipeDown}
          >
            <Image
              style={{
                width: destMeasure.width,
                height: destMeasure.height
              }}
              source={source}
            />
          </ImagePinchZoom>
        </View>

      </View>
    );
  }
}

const imageSizePropTypes = {
  width: PropTypes.number,
  height: PropTypes.number
};

AnimatedImage.propTypes = {
  onClose: PropTypes.func.isRequired,
  source: PropTypes.shape({uri: PropTypes.string.isRequired}),
  sourceMeasure: PropTypes.shape(measurePropTypes),
  imageSize: PropTypes.shape(imageSizePropTypes),
  Menu: PropTypes.element,
  animationDuration: PropTypes.number,
  translucentStatusBar: PropTypes.bool
};
