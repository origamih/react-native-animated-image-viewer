![](https://media.giphy.com/media/628qktJyimaNYGU22U/giphy.gif)
## Note
### `resizeMode`
This doesn't support all `resizeMode` of the source (pre-zoomed) Image component yet.
To have a proper animation effect, please render the Image in the original aspect rario.
Otherwise, please try either `cover` or `contain`.
Now landscape images will work with `resizeMode: contain` and portrait images will work with `resizeMode: cover`

### Status Bar on Android
[There is a famoust known issue](https://github.com/facebook/react-native/issues/7474) about status bar isn't hidden on Adnroid Modal. So I need a props to know if the source (pre-zoomed) image is rendered in `translucent` status bar or not. Default will be `true` to be consistent with iOS.

## Try it out
https://snack.expo.io/@origamih/animated-image-viewer

## Getting Started

### Installation

```bash
npm i react-native-animated-image-viewer --save
```
or
```bash
yarn add react-native-animated-image
```

### Basic Usage
- Get the actual image `width` and `height` using `Image` component:

```javascript
import { Image } from 'react-native';

...

_imageSize = {
  width: 0,
  height: 0
};
componentDidMount () {
  Image.getSize(source, (width, height) => {
    this._imageSize = {
      width,
      height
    }
  });
}
```


- Measure the absolute position of the Image to be shown right before zooming it in (as position might change. Eg: ScrollView):

```javascript
import { View, Image } from 'react-native';
import React from 'react';


_sourceMeasure = {
  width: 0,
  height: 0,
  pageX: 0,
  pageY: 0
}
_showImage = () => {
  this.image.measure((x, y, width, height, pageX, pageY) => {
    this._sourceMeasure = {
      width,
      height,
      pageX,
      pageY
    };
    this._showImageModal();
  });
};

return (
  <TouchableOpacity ref={image => (this.image = image)} onPress={this._showImage}>
    <Image source={source} style={{width: 100, height: 100}}/>
  </TouchableOpacity>
);

```
I don't use state for `_imageSize` and `_sourceMeasure`, this is more optimized since they don't trigger any UI update.


- Then show the Image in a `transparent Modal`:

```javascript
import { Modal, Image, TouchableOpacity, View } from 'react-native';
import React from 'react';

export default class App extends React.Component {
  state = {
    visible: false
  }
  _imageSize = {
    width: 0,
    height: 0
  };
  _sourceMeasure = {
    width: 0,
    height: 0,
    pageX: 0,
    pageY: 0
  }
  _showImageModal = () => this.setState({ visible: true });
  _hideImageModal = () => this.setState({ visible: false });
  _requestClose = () => this.imageModal.close();
  _showImage = () => {
    this.image.measure((x, y, width, height, pageX, pageY) => {
      this._sourceMeasure = {
        width,
        height,
        pageX,
        pageY
      };
      this._showImageModal();
    });
  };
  componentDidMount () {
    Image.getSize(source.uri, (width, height) => {
      this._imageSize = {
        width,
        height
      }
    });
  }
  render () {
    return (
      <View>
        <TouchableOpacity
          ref={image => (this.image = image)}
          onPress={this._showImage}
        >
          <Image source={source} style={{width: 100, height: 100}}/>
        </TouchableOpacity>

        <Modal visible={this.state.visible} transparent onRequestClose={this._requestClose}>
          <AnimatedImage
            ref={imageModal => (this.imageModal = imageModal)}
            source={source}
            sourceMeasure={this._sourceMeasure}
            imageSize={this._imageSize}
            onClose={this._hideImageModal}
          />
        </Modal>
      </View>
    )
  }
}
```

### Props

| name                   | type                                                                                   | required | description                                                                                                                            | default                                                   |
| :--------------------- | :------------------------------------------------------------------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------| :-------------------------------------------------------- |
| onClose                | function<br>`() => void`                                                               | yes      | Invoked when close transition is done. Usually this is used to close Modal                                                             |                                                           |
| source                 | object                                                                                 | yes      | `source` for Image                                                                                                                     |                                                           |
| sourceMeasure          | object<br>`{pageX: number, pageY: number, width: number, height: number}`              | yes      | Absolute position and dimension of the source image component                                                                          |                                                           |
| imageSize              | object<br>`{width: number, height: number}`                                            | no       | Actual image size                                                                                                                      |                                                           |
| Menu                   | React Element                                                                          | no       | Header menu for the zoomed in image                                                                                                    | `null`                                                    |
| animationDuration      | number                                                                                 | no       | Animation duration                                                                                                                     | `200`                                                     |
| translucentStatusBar   | bool                                                                                   | no       | Android only. Used to calculated the top padding caused by non-translucent status bar                                                  | `true`                                                    |

### Methods
| name                   | description                                                                                                     |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------|
| close()                | Close Modal with animation. Useful for Android `onRequestClose`                                                 |



### Credit

> `ImagePinchZoom` component is rewritten from [react-native-image-pan-zoom](https://github.com/ascoders/react-native-image-zoom). <br> The original package is TypeScript which I'm not familiar with. So I transpiled it into ES6, then made some modifications to match the need.

> Inspired by [Narendra N Shetty](https://github.com/narendrashetty)

