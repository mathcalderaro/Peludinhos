import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { SubHeader } from '../components/Header';
import { PataFilterIcon } from '../components/Icons';

export default function DetalhesAnimalScreen({ route, navigation }) {
  const animal = route.params?.animal || {
    nome: 'Rex',
    especie: 'Cachorro',
    raca: 'Vira-lata',
    tempo: 'Visto há 1 hora',
    dataAvistamento: 'Visto dia 10/10/2026',
    endereco: 'Av. Brasil, 1234 - Centro',
    sexo: 'Macho',
    idade: '1 ano',
    porte: 'Médio',
    cor: 'Caramelo',
    cadastradoPor: 'Projeto Peludinhos',
    cadastradoLocal: 'UFOPA',
    castrado: true,
    chipado: true,
    vacinado: true,
    sinPatinhasId: 'SPN-2024-001234',
    foto: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    descricao: '',
  };

  const fotos = Array.isArray(animal.fotos) && animal.fotos.length > 0
    ? animal.fotos
    : [animal.foto];

  async function compartilharAnimal() {
    try {
      await Share.share({
        message: `${animal.nome} (${animal.especie} • ${animal.raca})\nLocal: ${animal.endereco || animal.local}\n${animal.tempo} - App Peludinhos`,
      });
    } catch (e) {
      // ignora
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <SubHeader
        onBack={() => navigation.goBack()}
        rightIcon="share-social-outline"
        onRightPress={compartilharAnimal}
        rounded={false}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Imagem Principal + Dots (só se houver mais de 1 foto) + Badge Chipado */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: fotos[0] }} style={styles.heroImage} />

          {fotos.length > 1 ? (
            <View style={styles.photoDotsRow}>
              {fotos.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.photoDot, idx === 0 && styles.photoDotActive]}
                />
              ))}
            </View>
          ) : null}

          {animal.chipado ? (
            <View style={styles.chipadoFloatingBadge}>
              <Ionicons name="shield-checkmark" size={15} color={COLORS.white} />
              <Text style={styles.chipadoFloatingText}>Chipado</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.detailsSheet}>
          <View style={styles.titleRow}>
            <Text style={styles.animalName}>{animal.nome}</Text>
            <Ionicons name="checkmark-circle" size={22} color={COLORS.blue500} />
          </View>

          <Text style={styles.breedText}>
            {animal.especie} • {animal.raca || 'SRD'}
          </Text>

          {/* Cards Laranja Claro: Sexo e Idade (igual referência) */}
          <View style={styles.highlightCardsRow}>
            <View style={styles.highlightCard}>
              <View style={styles.highlightWatermark} pointerEvents="none">
                <PataFilterIcon size={34} color="#F3A64C" />
              </View>
              <Text style={styles.highlightValue}>{animal.sexo || 'Macho'}</Text>
              <Text style={styles.highlightLabel}>Sexo</Text>
            </View>

            <View style={styles.highlightCard}>
              <View style={styles.highlightWatermark} pointerEvents="none">
                <PataFilterIcon size={34} color="#F3A64C" />
              </View>
              <Text style={styles.highlightValue}>{animal.idade || '1 ano'}</Text>
              <Text style={styles.highlightLabel}>Idade</Text>
            </View>
          </View>

          {/* Localização e Data */}
          <View style={styles.locationRow}>
            <View style={styles.locationLeft}>
              <Ionicons name="location" size={16} color={COLORS.gray400} />
              <Text style={styles.locationText}>
                {animal.endereco || animal.local}
              </Text>
            </View>
            <Text style={styles.timeText}>
              {animal.dataAvistamento || animal.tempo}
            </Text>
          </View>

          {/* Quem cadastrou */}
          <View style={styles.authorCard}>
            <View style={styles.authorLeft}>
              <View style={styles.authorAvatar}>
                <Image
                  source={require('../../assets/favicon.png')}
                  style={styles.authorAvatarImg}
                  resizeMode="cover"
                />
              </View>
              <View>
                <Text style={styles.authorName}>
                  {animal.cadastradoPor || 'Projeto Peludinhos'}
                </Text>
                <Text style={styles.authorOrg}>
                  {animal.cadastradoLocal || 'UFOPA'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Contato do Cadastrador',
                  `Registrado por: ${animal.cadastradoPor || 'Projeto Peludinhos'} (${animal.cadastradoLocal || 'UFOPA'})`
                )
              }
              style={styles.chatIconBtn}
            >
              <Ionicons name="chatbox-ellipses" size={24} color={COLORS.gray300} />
            </TouchableOpacity>
          </View>

          {animal.descricao ? (
            <Text style={styles.descriptionText}>{animal.descricao}</Text>
          ) : null}

          {/* Seção Saúde */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saúde</Text>

            <View style={styles.healthBadgesRow}>
              {animal.vacinado ? (
                <View style={styles.healthBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.teal700} />
                  <Text style={styles.healthBadgeText}>Vacinado</Text>
                </View>
              ) : null}

              {animal.castrado ? (
                <View style={styles.healthBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.teal700} />
                  <Text style={styles.healthBadgeText}>Castrado</Text>
                </View>
              ) : null}

              {animal.chipado ? (
                <View style={styles.healthBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.teal700} />
                  <Text style={styles.healthBadgeText}>Chipado</Text>
                </View>
              ) : null}

              {!animal.vacinado && !animal.castrado && !animal.chipado ? (
                <Text style={{ fontSize: 13, color: COLORS.gray400 }}>
                  Nenhuma informação de saúde registrada.
                </Text>
              ) : null}
            </View>

            <View style={styles.sinPatinhasCard}>
              <View style={styles.sinPatinhasLeft}>
                <View style={styles.sinPatinhasIconBox}>
                  <Ionicons name="card" size={24} color={COLORS.brandTeal} />
                </View>
                <View>
                  <Text style={styles.sinPatinhasTitle}>Carteira SinPatinhas</Text>
                  <Text style={styles.sinPatinhasId}>
                    ID: {animal.sinPatinhasId || 'SPN-2024-001234'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Carteira SinPatinhas',
                    `Registro oficial verificado: ${animal.sinPatinhasId || 'SPN-2024-001234'}\nAnimal: ${animal.nome} (${animal.especie})`
                  )
                }
              >
                <Text style={styles.sinPatinhasLink}>Ver anexo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Seção Informações */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Sexo</Text>
                <Text style={styles.infoValue}>{animal.sexo || 'Macho'}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Idade</Text>
                <Text style={styles.infoValue}>{animal.idade || '1 ano'}</Text>
              </View>
            </View>

            <View style={[styles.infoGrid, { marginTop: 16 }]}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Porte</Text>
                <Text style={styles.infoValue}>{animal.porte || 'Médio'}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Cor</Text>
                <Text style={styles.infoValue}>{animal.cor || 'Caramelo'}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    width: '100%',
    height: 290,
    backgroundColor: COLORS.gray200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  photoDotsRow: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  photoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  photoDotActive: {
    backgroundColor: COLORS.brandOrange,
  },
  chipadoFloatingBadge: {
    position: 'absolute',
    bottom: 34,
    right: 16,
    backgroundColor: COLORS.brandTeal,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 4,
  },
  chipadoFloatingText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  detailsSheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  animalName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  breedText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray600,
    marginBottom: 16,
  },
  highlightCardsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  highlightCard: {
    width: 112,
    height: 76,
    backgroundColor: '#FDE8CD',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 8,
  },
  highlightWatermark: {
    position: 'absolute',
    left: -4,
    bottom: -4,
    opacity: 0.75,
  },
  highlightValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray900,
    zIndex: 2,
  },
  highlightLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 2,
    zIndex: 2,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingRight: 8,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.gray400,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  authorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  authorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0E4F4F',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarImg: {
    width: 52,
    height: 52,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  authorOrg: {
    fontSize: 13,
    color: COLORS.gray500,
    marginTop: 2,
  },
  chatIconBtn: {
    padding: 8,
  },
  descriptionText: {
    marginTop: 14,
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  section: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 14,
  },
  healthBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.teal50,
    borderWidth: 1,
    borderColor: COLORS.teal100,
  },
  healthBadgeWarning: {
    backgroundColor: COLORS.orange50,
    borderColor: '#fed7aa',
  },
  healthBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.teal800,
  },
  sinPatinhasCard: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  sinPatinhasLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sinPatinhasIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.teal50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sinPatinhasTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  sinPatinhasId: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },
  sinPatinhasLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.brandTeal,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
  },
});
