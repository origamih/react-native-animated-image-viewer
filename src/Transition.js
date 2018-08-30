import { Animated } from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import { calculateTransformation } from './utils';

const Transition = ({ source, sourceMeasure, destMeasure, animatedValue, isAnimating }) => {
  const transformation = calculateTransformation(sourceMeasure, destMeasure);
  return (
    <Animated.Image
      style={{
        opacity: isAnimating ? 1 : 0,
        backgroundColor: 'transparent',
        position: 'absolute',
        width: destMeasure.width,
        height: destMeasure.height,
        left: destMeasure.pageX,
        top: destMeasure.pageY,
        transform: [
          {
            translateX: animatedValue.interpolate({
              inputRange: [0.0001, 1],
              outputRange: [transformation.translateX, 0]
            })
          },
          {
            translateY: animatedValue.interpolate({
              inputRange: [0.001, 1],
              outputRange: [transformation.translateY, 0]
            })
          },
          {
            scale: animatedValue.interpolate({
              inputRange: [0.001, 1],
              outputRange: [transformation.scale, 1]
            })
          }
        ]
      }}
      source={source}
    />
  );
};

export const measurePropTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  pageX: PropTypes.number.isRequired,
  pageY: PropTypes.number.isRequired
};

Transition.propTypes = {
  source: PropTypes.shape({uri: PropTypes.string.isRequired}),
  animatedValue: PropTypes.instanceOf(Animated.Value).isRequired,
  isAnimating: PropTypes.bool.isRequired,
  sourceMeasure: PropTypes.shape(measurePropTypes),
  destMeasure: PropTypes.shape(measurePropTypes)
};

export default Transition;
