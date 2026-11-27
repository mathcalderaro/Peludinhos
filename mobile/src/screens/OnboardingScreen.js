import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
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
  const flatListRef = useRef(null);
  const [indiceAtual, setIndiceAtual] = useState(0);

  function avancar() {
    if (indiceAtual < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: indiceAtual + 1,
        animated: true,
      });
    } else {
      onFinish();
    }
  }

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

      <TouchableOpacity style={styles.skipBtn} onPress={onFinish}>
        <Text style={styles.skipText}>Pular</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setIndiceAtual(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.illustration} resizeMode="contain" />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={avancar} activeOpacity={0.85}>
          <Text style={styles.nextButtonText}>
            {indiceAtual === SLIDES.length - 1 ? 'Começar' : 'Próximo'}
          </Text>
        </TouchableOpacity>

        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === indiceAtual ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
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
  skipBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    zIndex: 10,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.brandTeal,
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
  dotActive: {
    backgroundColor: COLORS.orange500,
  },
  dotInactive: {
    backgroundColor: '#FCD9B6',
  },
});
