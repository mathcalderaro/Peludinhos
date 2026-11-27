import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { PataFilterIcon } from '../components/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    image: require('../../assets/entrada1.png'),
    title: 'Olá, seja bem vindo ao Peludinhos',
    subtitle: 'Ajude os animaizinhos sem donos da sua cidade.',
  },
  {
    key: '2',
    image: require('../../assets/entrada2.png'),
    title: 'Encontre e ajude animais de rua',
    subtitle: 'Registre avistamentos no mapa e acompanhe os cuidados de cada animal.',
  },
  {
    key: '3',
    image: require('../../assets/entrada3.png'),
    title: 'Ajude animais perdidos a voltar',
    subtitle: 'Divulgue alertas de fuga e ajude tutores a reencontrarem seus peludinhos.',
  },
];

export default function OnboardingScreen({ onFinish }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const [indiceAtual, setIndiceAtual] = useState(0);

  const isLastSlide = indiceAtual === SLIDES.length - 1;

  useEffect(() => {
    Animated.timing(buttonAnim, {
      toValue: isLastSlide ? 1 : 0,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [isLastSlide, buttonAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Patinhas decorativas no fundo */}
      <View pointerEvents="none" style={styles.pawsTopLeft}>
        <PataFilterIcon size={44} color="#CBE5E5" />
      </View>
      <View pointerEvents="none" style={styles.pawsTopRight}>
        <PataFilterIcon size={44} color="#CBE5E5" />
      </View>
      <View pointerEvents="none" style={styles.pawsBottomRight}>
        <PataFilterIcon size={44} color="#CBE5E5" />
      </View>
      <View pointerEvents="none" style={styles.pawsBottomRight2}>
        <PataFilterIcon size={40} color="#CBE5E5" />
      </View>

      <Animated.FlatList
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setIndiceAtual(index);
        }}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.35, 1, 0.35],
            extrapolate: 'clamp',
          });

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
          });

          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [18, 0, 18],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={[
                styles.slide,
                { opacity, transform: [{ scale }, { translateY }] },
              ]}
            >
              <Image source={item.image} style={styles.illustration} resizeMode="contain" />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </Animated.View>
          );
        }}
      />

      <View style={styles.footer}>
        {/* Botão aparece suavemente apenas na última tela */}
        <Animated.View
          pointerEvents={isLastSlide ? 'auto' : 'none'}
          style={{
            width: '100%',
            opacity: buttonAnim,
            transform: [
              {
                translateY: buttonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [14, 0],
                }),
              },
            ],
          }}
        >
          <TouchableOpacity style={styles.nextButton} onPress={onFinish} activeOpacity={0.85}>
            <Text style={styles.nextButtonText}>Começar</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => {
            const inputRange = [
              (idx - 1) * SCREEN_WIDTH,
              idx * SCREEN_WIDTH,
              (idx + 1) * SCREEN_WIDTH,
            ];
            const dotScale = scrollX.interpolate({
              inputRange,
              outputRange: [1, 1.25, 1],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={idx}
                style={[
                  styles.dot,
                  {
                    backgroundColor: COLORS.orange500,
                    opacity: dotOpacity,
                    transform: [{ scale: dotScale }],
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    position: 'relative',
  },
  pawsTopLeft: {
    position: 'absolute',
    top: 68,
    left: 36,
    transform: [{ rotate: '-18deg' }],
    opacity: 0.7,
  },
  pawsTopRight: {
    position: 'absolute',
    top: 44,
    right: 32,
    transform: [{ rotate: '-12deg' }],
    opacity: 0.7,
  },
  pawsBottomRight: {
    position: 'absolute',
    bottom: 190,
    right: 26,
    transform: [{ rotate: '-20deg' }],
    opacity: 0.7,
  },
  pawsBottomRight2: {
    position: 'absolute',
    bottom: 125,
    right: 52,
    transform: [{ rotate: '-10deg' }],
    opacity: 0.65,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  illustration: {
    width: SCREEN_WIDTH * 0.82,
    height: 260,
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray900,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 34,
    alignItems: 'center',
    gap: 22,
  },
  nextButton: {
    width: '100%',
    backgroundColor: COLORS.orange500,
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
});
