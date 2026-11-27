import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import Svg, { Path, Ellipse } from 'react-native-svg';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TILE_SIZE = 120;

const DOG_SVG_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    svg {
      width: 100%;
      height: 100%;
      max-width: 170px;
      max-height: 140px;
    }
  </style>
</head>
<body>
  <svg class="dog-svg motion-trot" width="360" height="295" viewBox="-65 -55 360 295" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      .dog-svg .dog-root, .dog-svg .dog-body-pivot, .dog-svg .tail, .dog-svg .head, .dog-svg .ear, .dog-svg .leg, .dog-svg .paw { transform-box: view-box; will-change: transform; }
      .dog-svg .dog-root { transform-origin: 115px 200px; }
      .dog-svg .dog-body-pivot { transform-origin: 115px 115px; }
      .dog-svg .tail { transform-origin: 36px 81px; }
      .dog-svg .head { transform-origin: 156px 68px; }
      .dog-svg .ear { transform-origin: 149px 6px; }
      .dog-svg .leg-front-near { transform-origin: 130px 118px; }
      .dog-svg .paw-front-near { transform-origin: 128px 196px; }
      .dog-svg .leg-front-far { transform-origin: 152px 114px; }
      .dog-svg .paw-front-far { transform-origin: 151px 183px; }
      .dog-svg .leg-hind-near { transform-origin: 42px 104px; }
      .dog-svg .paw-hind-near { transform-origin: 23px 194px; }
      .dog-svg .leg-hind-far { transform-origin: 78px 98px; }
      .dog-svg .paw-hind-far { transform-origin: 58px 191px; }
      .motion-trot .dog-root { animation: 0.56s ease 0s infinite normal none running trotRoot; }
      .motion-trot .dog-body-pivot { animation: 0.56s ease 0s infinite normal none running trotBody; }
      .motion-trot .tail { animation: 0.28s ease-in-out 0s infinite alternate none running trotTail; }
      .motion-trot .head { animation: 0.56s ease 0s infinite normal none running trotHead; }
      .motion-trot .ear { animation: 0.56s ease 0s infinite normal none running trotEar; }
      .motion-trot .leg-front-near { animation: 0.56s ease 0s infinite normal none running trotLegFrontA; }
      .motion-trot .paw-front-near { animation: 0.56s ease 0s infinite normal none running trotPawFrontA; }
      .motion-trot .leg-hind-far { animation: 0.56s ease 0s infinite normal none running trotLegHindA; }
      .motion-trot .paw-hind-far { animation: 0.56s ease 0s infinite normal none running trotPawHindA; }
      .motion-trot .leg-front-far { animation: 0.56s ease 0s infinite normal none running trotLegFrontB; }
      .motion-trot .paw-front-far { animation: 0.56s ease 0s infinite normal none running trotPawFrontB; }
      .motion-trot .leg-hind-near { animation: 0.56s ease 0s infinite normal none running trotLegHindB; }
      .motion-trot .paw-hind-near { animation: 0.56s ease 0s infinite normal none running trotPawHindB; }
      @keyframes trotRoot {
        0%, 100% { transform: translate(0px, -6px); animation-timing-function: ease-in; }
        22% { transform: translate(2px, 4px); animation-timing-function: ease-out; }
        50% { transform: translate(0px, -6px); animation-timing-function: ease-in; }
        72% { transform: translate(2px, 4px); animation-timing-function: ease-out; }
      }
      @keyframes trotBody {
        0%, 100% { transform: rotate(-1.5deg) scaleX(1.02) scaleY(0.98); animation-timing-function: ease-in-out; }
        22% { transform: rotate(2deg) scaleX(0.99) scaleY(1.01); animation-timing-function: ease-in-out; }
        50% { transform: rotate(-1.5deg) scaleX(1.02) scaleY(0.98); animation-timing-function: ease-in-out; }
        72% { transform: rotate(2deg) scaleX(0.99) scaleY(1.01); animation-timing-function: ease-in-out; }
      }
      @keyframes trotTail {
        0% { transform: rotate(-12deg); }
        100% { transform: rotate(16deg); }
      }
      @keyframes trotHead {
        0%, 100% { transform: translate(0px, -1px) rotate(-2deg); animation-timing-function: ease-in-out; }
        28% { transform: translate(1px, 2px) rotate(3deg); animation-timing-function: ease-in-out; }
        50% { transform: translate(0px, -1px) rotate(-2deg); animation-timing-function: ease-in-out; }
        78% { transform: translate(1px, 2px) rotate(3deg); animation-timing-function: ease-in-out; }
      }
      @keyframes trotEar {
        0%, 100% { transform: rotate(8deg); animation-timing-function: ease-in-out; }
        32% { transform: rotate(-14deg); animation-timing-function: ease-in-out; }
        50% { transform: rotate(8deg); animation-timing-function: ease-in-out; }
        82% { transform: rotate(-14deg); animation-timing-function: ease-in-out; }
      }
      @keyframes trotLegFrontA {
        0%, 100% { transform: translate(0px, 2px) rotate(26deg); animation-timing-function: ease-in; }
        25% { transform: translate(1px, -14px) rotate(-2deg); animation-timing-function: ease-out; }
        50% { transform: translate(1px, -2px) rotate(-30deg); animation-timing-function: ease-in; }
        75% { transform: translate(0px, 4px) rotate(2deg); animation-timing-function: ease-out; }
      }
      @keyframes trotPawFrontA {
        0%, 100% { transform: rotate(-18deg); }
        25% { transform: rotate(28deg); }
        50% { transform: rotate(10deg); }
        75% { transform: rotate(-2deg); }
      }
      @keyframes trotLegHindA {
        0%, 100% { transform: translate(-1px, 2px) rotate(28deg); animation-timing-function: ease-in; }
        25% { transform: translate(2px, -13px) rotate(-2deg); animation-timing-function: ease-out; }
        50% { transform: translate(3px, -3px) rotate(-28deg); animation-timing-function: ease-in; }
        75% { transform: translate(0px, 4px) rotate(3deg); animation-timing-function: ease-out; }
      }
      @keyframes trotPawHindA {
        0%, 100% { transform: rotate(-14deg); }
        25% { transform: rotate(26deg); }
        50% { transform: rotate(12deg); }
        75% { transform: rotate(-3deg); }
      }
      @keyframes trotLegFrontB {
        0%, 100% { transform: translate(1px, -2px) rotate(-28deg); animation-timing-function: ease-in; }
        25% { transform: translate(0px, 4px) rotate(2deg); animation-timing-function: ease-out; }
        50% { transform: translate(-1px, 2px) rotate(24deg); animation-timing-function: ease-in; }
        75% { transform: translate(1px, -14px) rotate(-2deg); animation-timing-function: ease-out; }
      }
      @keyframes trotPawFrontB {
        0%, 100% { transform: rotate(10deg); }
        25% { transform: rotate(-2deg); }
        50% { transform: rotate(-16deg); }
        75% { transform: rotate(26deg); }
      }
      @keyframes trotLegHindB {
        0%, 100% { transform: translate(2px, -3px) rotate(-26deg); animation-timing-function: ease-in; }
        25% { transform: translate(0px, 4px) rotate(2deg); animation-timing-function: ease-out; }
        50% { transform: translate(-1px, 2px) rotate(28deg); animation-timing-function: ease-in; }
        75% { transform: translate(2px, -13px) rotate(-2deg); animation-timing-function: ease-out; }
      }
      @keyframes trotPawHindB {
        0%, 100% { transform: rotate(12deg); }
        25% { transform: rotate(-2deg); }
        50% { transform: rotate(-14deg); }
        75% { transform: rotate(26deg); }
      }
      .fur-main { fill: #FEF7ED; }
      .fur-far { fill: #FEF7ED; }
      .fur-ear { fill: #FEF7ED; }
      .fur-belly { fill: #FEF7ED; }
      .dog-nose { fill: #FEF7ED; }
      .dog-eye { fill: #FEF7ED; }
    </style>
    <defs>
      <mask id="mask0_158_225_export" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="22" y="53" width="155" height="88">
        <path d="M33.3625 77.0499C22.4834 90.1049 22.4834 111.863 22.4834 111.863L62.7361 126.731C62.7361 126.731 94.6482 137.973 118.22 140.149C141.791 142.325 160.648 135.435 166.45 120.929C172.253 106.424 176.604 77.0499 176.604 77.0499C176.604 77.0499 163.549 75.962 154.121 68.7093C144.692 61.4565 135.989 53.4785 135.989 53.4785C135.989 53.4785 125.11 70.5225 96.0988 68.7093C67.0878 66.8961 44.2416 63.995 33.3625 77.0499Z" fill="#B87138"/>
      </mask>
      <mask id="mask1_158_225_export" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="138" y="0" width="92" height="79">
        <path d="M209.16 75.606C218.583 72.6985 226.561 66.1711 227.649 63.27C228.737 60.3689 230.55 50.5777 226.561 45.8634C222.572 41.1491 217.495 39.6985 213.506 34.2661C209.517 28.8336 209.517 16.1271 205.528 11.7755C201.539 7.42383 193.918 0.534642 174.341 0.53418C154.764 0.533718 141.335 11.7755 138.796 29.5452C136.258 47.3149 152.227 71.9859 166.369 75.606C180.511 79.226 199.738 78.5134 209.16 75.606Z" fill="#B9723E"/>
      </mask>
    </defs>
    <g class="dog-root">
      <g class="dog-body-pivot">
        <g class="tail">
          <path class="fur-main" d="M0.175914 49.1707C1.9891 66.2146 30.6376 88.6982 30.6376 88.6982L41.1541 77.0938C41.1541 77.0938 18.3078 66.9399 16.4946 47.3575C14.6814 27.7751 20.4836 14.7202 15.7695 13.6322C11.0553 12.5443 -1.63727 32.1267 0.175914 49.1707Z"/>
        </g>
        <g class="leg leg-front-far">
          <path class="fur-far" d="M142.153 189.106V118.407L163.59 103.523L159.75 178.408H152.392L142.153 189.106Z"/>
          <g class="paw paw-front-far">
            <path class="fur-far" d="M147.34 194.49C145.861 193.652 142.409 191.136 142.162 189.739C141.915 188.341 148.473 179.624 151.432 178.227C154.392 176.829 159.751 178.226 159.751 178.226C159.751 178.226 166.328 181.354 166.081 187.223C165.835 193.093 161.396 194.49 161.396 194.49C161.396 194.49 148.82 195.329 147.34 194.49Z"/>
          </g>
        </g>
        <g class="leg leg-hind-far">
          <path class="fur-far" d="M57.238 102.023C57.5292 88.6272 61.6062 78.4348 78.2054 78.1435C94.8045 77.8523 99.4639 90.6638 102.085 103.477C104.706 116.291 102.085 145.121 93.9309 154.148C85.7769 163.176 73.5459 161.724 70.0514 166.964C66.5568 172.203 68.3041 187.348 68.3041 187.348C68.3041 187.348 61.315 187.055 57.238 189.385C53.161 191.715 47.9191 197.248 47.9191 197.248C47.9191 197.248 46.1719 164.341 47.9192 160.266C49.6665 156.191 61.315 150.652 63.0623 138.714C64.8095 126.776 56.9468 115.419 57.238 102.023Z"/>
          <g class="paw paw-hind-far">
            <path class="fur-far" d="M53.7441 202.489C51.9967 201.615 47.9198 198.994 47.6286 197.538C47.3374 196.082 53.8503 188.51 57.3449 187.054C60.8394 185.598 68.5959 187.054 68.5959 187.054C68.5959 187.054 76.1675 188.802 75.8763 194.917C75.5851 201.033 70.3432 202.489 70.3432 202.489C70.3432 202.489 55.4914 203.362 53.7441 202.489Z"/>
          </g>
        </g>
        <g class="leg leg-hind-near">
          <path class="fur-main" d="M21.414 108.957C21.6259 96.2765 25.4874 86.6086 41.4169 86.2481C57.3464 85.8876 61.8828 97.9897 64.4628 110.104C67.0429 122.218 64.6728 149.519 56.8926 158.105C49.1124 166.691 37.3664 165.379 34.039 170.356C30.7115 175.334 32.4648 189.659 32.4648 189.659C32.4648 189.659 25.7556 189.418 21.8544 191.643C17.9533 193.869 12.9504 199.133 12.9504 199.133C12.9504 199.133 11.1075 167.996 12.7639 164.13C14.4203 160.264 25.572 154.962 27.1888 143.654C28.8055 132.347 21.202 121.637 21.414 108.957Z"/>
          <g class="paw paw-hind-near">
            <path class="fur-main" d="M18.5667 204.064C16.8853 203.246 12.9593 200.787 12.6724 199.41C12.3856 198.033 18.508 193.039 21.8545 191.643C25.201 190.247 32.7429 189.38 32.7429 189.38C32.7429 189.38 40.0184 190.995 39.7698 196.785C39.5211 202.574 34.4976 203.979 34.4976 203.979C34.4976 203.979 20.2481 204.882 18.5667 204.064Z"/>
          </g>
        </g>
        <g class="torso">
          <path class="fur-main" d="M33.3625 77.0499C22.4834 90.1049 22.4834 111.863 22.4834 111.863L62.7361 126.731C62.7361 126.731 94.6482 137.973 118.22 140.149C141.791 142.325 160.648 135.435 166.45 120.929C172.253 106.424 176.604 77.0499 176.604 77.0499C176.604 77.0499 163.549 75.962 154.121 68.7093C144.692 61.4565 135.989 53.4785 135.989 53.4785C135.989 53.4785 125.11 70.5225 96.0988 68.7093C67.0878 66.8961 44.2416 63.995 33.3625 77.0499Z"/>
          <g mask="url(#mask0_158_225_export)">
            <path class="fur-belly" d="M67.2027 118.062C59.6598 117.772 62.6092 124.711 65.0268 128.216L70.8287 148.886L158.95 142.721C167.901 121.292 174.429 94.7523 172.978 95.9127C171.165 97.3633 168.741 99.5674 157.499 114.436C146.257 129.304 127.763 128.216 115.796 128.941C103.829 129.666 76.6312 118.425 67.2027 118.062Z"/>
          </g>
        </g>
        <g class="leg leg-front-near">
          <path class="fur-main" d="M117.494 202.924V123.805L141.791 107.148L137.439 190.952H129.099L117.494 202.924Z"/>
          <g class="paw paw-front-near">
            <path class="fur-main" d="M123.372 208.952C121.695 208.013 117.782 205.198 117.503 203.634C117.223 202.07 124.656 192.315 128.01 190.751C131.364 189.187 137.439 190.75 137.439 190.75C137.439 190.75 144.893 194.251 144.614 200.819C144.334 207.388 139.303 208.952 139.303 208.952C139.303 208.952 125.049 209.89 123.372 208.952Z"/>
          </g>
        </g>
        <g class="head">
          <path class="fur-main" d="M209.16 75.606C218.583 72.6985 226.561 66.1711 227.649 63.27C228.737 60.3689 230.55 50.5777 226.561 45.8634C222.572 41.1491 217.495 39.6985 213.506 34.2661C209.517 28.8336 209.517 16.1271 205.528 11.7755C201.539 7.42383 193.918 0.534642 174.341 0.53418C154.764 0.533718 141.335 11.7755 138.797 29.5452C137.766 36.7583 136.352 38.9737 135.989 55.2924C140.194 66.7513 153.698 74.5374 162.1 76.688C176.242 80.3081 199.738 78.5134 209.16 75.606Z"/>
          <path class="fur-ear" d="M160.667 58.3944C152.326 58.3944 139.271 30.8335 140.722 23.2185C142.172 15.6036 176.26 2.54822 178.436 7.98778C180.612 13.4273 169.007 58.3944 160.667 58.3944Z"/>
          <path class="fur-belly" d="M193.93 19.7539C189.215 19.7539 183.776 21.2045 183.413 33.1715C183.051 45.1385 191.028 45.8624 196.468 45.1385C201.908 44.4147 206.985 37.5245 206.259 31.3583C205.534 25.192 198.645 19.7539 193.93 19.7539Z"/>
          <g mask="url(#mask1_158_225_export)">
            <path class="fur-belly" d="M199.357 60.7317C199.357 71.2482 210.961 74.1493 211.686 74.5119L229.455 76.3251L240.334 53.8416L206.972 14.6768C206.972 14.6768 209.511 36.435 208.423 41.8746C207.335 47.3141 199.358 50.2152 199.357 60.7317Z"/>
          </g>
          <path class="dog-nose" d="M222.566 42.9644C222.204 44.7759 227.281 53.1199 228.731 53.4808C230.182 53.8418 233.808 48.7634 230.907 44.4131C228.006 40.0627 222.929 41.1528 222.566 42.9644Z"/>
          <ellipse class="dog-eye" cx="198.632" cy="33.8084" rx="3.62637" ry="4.62675"/>
          <g class="ear">
            <path class="fur-ear" d="M137.5 3.53377C139.9 -2.86623 155.166 0.867104 162.5 3.53377L161 25.0342C158.667 33.5342 150.7 49.6342 137.5 46.0342C121 41.5342 134.5 11.5338 137.5 3.53377Z"/>
          </g>
        </g>
      </g>
    </g>
  </svg>
</body>
</html>
`;

function PataIcon({ size = 34, opacity = 0.22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 24" fill="none" style={{ opacity }}>
      <Path
        d="M12.275 12.2378C15.1034 12.0005 16.6474 14.208 16.6474 14.208L18.9958 17.3729C18.9958 17.3729 20.0788 19.1005 20.468 20.226C20.8572 21.3515 20.1879 22.4558 19.3517 23.0861C18.5155 23.7164 16.8232 23.0354 16.3611 22.6143C15.8989 22.1933 15.7343 21.6017 13.1506 21.3734C10.5668 21.1451 9.95871 22.1329 9.65764 22.4798C9.35657 22.8267 7.70891 22.8525 6.53641 22.6525C5.36391 22.4525 5.03708 21.1518 5.28878 20.3333C5.54047 19.5148 6.08624 18.7021 6.58261 17.4179C7.07898 16.1337 8.10694 14.7425 8.10694 14.7425C8.10694 14.7425 9.44659 12.4752 12.275 12.2378Z"
        fill="white"
      />
      <Ellipse cx="4.36955" cy="11.4862" rx="2.80204" ry="4.05446" transform="rotate(-21.3001 4.36955 11.4862)" fill="white" />
      <Ellipse cx="9.04815" cy="4.80716" rx="2.80204" ry="4.05446" transform="rotate(-13.5868 9.04815 4.80716)" fill="white" />
      <Ellipse cx="16.5637" cy="4.9536" rx="2.80204" ry="4.05446" transform="rotate(15.7064 16.5637 4.9536)" fill="white" />
      <Ellipse cx="21.261" cy="11.2827" rx="2.80204" ry="4.05446" transform="rotate(15.7064 21.261 11.2827)" fill="white" />
    </Svg>
  );
}

export function DogLoadingContent({ message = 'Carregando...' }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -TILE_SIZE],
  });

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -TILE_SIZE],
  });

  const cols = Math.ceil(SCREEN_WIDTH / TILE_SIZE) + 3;
  const rows = Math.ceil(SCREEN_HEIGHT / TILE_SIZE) + 3;

  return (
    <View style={styles.container}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.patternContainer,
          {
            width: cols * TILE_SIZE,
            height: rows * TILE_SIZE,
            transform: [{ translateX }, { translateY }],
          },
        ]}
      >
        {Array.from({ length: rows }).map((_, r) => (
          <View key={r} style={styles.patternRow}>
            {Array.from({ length: cols }).map((__, c) => (
              <View
                key={c}
                style={[
                  styles.patternCell,
                  { transform: [{ rotate: '-20deg' }, { translateY: c % 2 === 0 ? 0 : 28 }] },
                ]}
              >
                <PataIcon size={40} opacity={0.18} />
              </View>
            ))}
          </View>
        ))}
      </Animated.View>

      <View style={styles.centerContent}>
        <View style={styles.dogWrapper}>
          {Platform.OS === 'web' ? (
            <iframe
              title="Dog Loading"
              srcDoc={DOG_SVG_HTML}
              style={{
                width: 170,
                height: 140,
                border: 'none',
                backgroundColor: 'transparent',
                pointerEvents: 'none',
              }}
            />
          ) : (
            <WebView
              originWhitelist={['*']}
              source={{ html: DOG_SVG_HTML }}
              style={styles.webview}
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              androidLayerType="hardware"
              pointerEvents="none"
            />
          )}
        </View>

        {message ? <Text style={styles.loadingText}>{message}</Text> : null}
      </View>
    </View>
  );
}

export default function DogLoadingOverlay({ visible, message = 'Carregando...' }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="fade" statusBarTranslucent>
      <DogLoadingContent message={message} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#70ACAC',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternContainer: {
    position: 'absolute',
    top: -TILE_SIZE,
    left: -TILE_SIZE,
  },
  patternRow: {
    flexDirection: 'row',
    height: TILE_SIZE,
  },
  patternCell: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dogWrapper: {
    width: 170,
    height: 140,
    backgroundColor: 'transparent',
  },
  webview: {
    width: 170,
    height: 140,
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 12,
    color: '#FEF7ED',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
