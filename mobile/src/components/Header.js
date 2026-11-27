import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { PeludinhosPinLogo } from './Icons';

export function MainHeader({
  searchValue = '',
  onSearchChange,
  placeholder = 'Buscar animais ou locais',
  showMenuButton = true,
  onFilterPress,
}) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        {showMenuButton ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => Alert.alert('Peludinhos', 'Navegue pelas abas inferiores para acessar Animais, Mapa, Perdidos e seu Perfil.')}
            accessibilityLabel="Menu"
          >
            <Ionicons name="menu-outline" size={26} color={COLORS.white} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.brandRow}>
          <PeludinhosPinLogo width={18} height={24} color={COLORS.white} />
          <Text style={styles.brandTitle}>Peludinhos</Text>
        </View>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => Alert.alert('Notificações', 'Você não possui novas notificações no momento.')}
          accessibilityLabel="Notificações"
        >
          <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor={COLORS.gray400}
            value={searchValue}
            onChangeText={onSearchChange}
          />
          <Ionicons name="search-outline" size={20} color={COLORS.gray400} style={styles.searchIcon} />
        </View>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={onFilterPress}
          accessibilityLabel="Filtrar"
        >
          <Ionicons name="options-outline" size={20} color={COLORS.gray600} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function SubHeader({ onBack, rightIcon, onRightPress, rounded = true }) {
  return (
    <View style={[styles.subHeaderContainer, rounded && styles.subHeaderRounded]}>
      <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityLabel="Voltar">
        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
      </TouchableOpacity>

      <View style={styles.brandRow}>
        <PeludinhosPinLogo width={18} height={24} color={COLORS.white} />
        <Text style={styles.brandTitle}>Peludinhos</Text>
      </View>

      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={styles.iconBtn}>
          <Ionicons name={rightIcon} size={22} color={COLORS.white} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 32 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.brandTeal,
    paddingTop: 10,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  iconBtn: {
    padding: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInputWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingLeft: 16,
    paddingRight: 38,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.gray800,
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
  },
  filterBtn: {
    backgroundColor: COLORS.white,
    padding: 11,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subHeaderContainer: {
    backgroundColor: COLORS.brandTeal,
    paddingTop: 10,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  subHeaderRounded: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
});
