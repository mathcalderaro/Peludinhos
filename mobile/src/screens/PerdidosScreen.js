import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { MainHeader } from '../components/Header';
import { usePets } from '../context/PetsContext';

export default function PerdidosScreen() {
  const { perdidos, adicionarPerdido } = usePets();
  const [busca, setBusca] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('Todos');
  const [modalFiltroVisivel, setModalFiltroVisivel] = useState(false);
  const [animalSelecionado, setAnimalSelecionado] = useState(null);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('Cachorro');
  const [vistoEm, setVistoEm] = useState('');
  const [descricao, setDescricao] = useState('');
  const [telefoneContato, setTelefoneContato] = useState('');
  const [fotoUri, setFotoUri] = useState(null);

  const perdidosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return perdidos.filter((p) => {
      const matchEspecie =
        filtroEspecie === 'Todos' || p.especie === filtroEspecie;
      const matchBusca =
        !termo ||
        p.nome.toLowerCase().includes(termo) ||
        p.vistoEm.toLowerCase().includes(termo) ||
        p.descricao.toLowerCase().includes(termo);
      return matchEspecie && matchBusca;
    });
  }, [perdidos, busca, filtroEspecie]);

  async function compartilhar(item) {
    try {
      await Share.share({
        message: `PROCURA-SE: ${item.nome} (${item.especie})\nVisto por último em: ${item.vistoEm}\n${item.descricao}\nContato: ${item.telefoneContato} - App Peludinhos`,
      });
    } catch (e) {
      // ignora
    }
  }

  async function escolherFotoPerdido() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets?.[0]?.uri) {
      setFotoUri(res.assets[0].uri);
    }
  }

  function handleSalvarFuga() {
    if (!nome.trim() || !vistoEm.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe o nome do animal e o bairro onde foi visto.');
      return;
    }

    adicionarPerdido({
      nome,
      especie,
      vistoEm,
      descricao,
      telefoneContato: telefoneContato || '(93) 99123-4567',
      foto: fotoUri,
    });

    setNome('');
    setVistoEm('');
    setDescricao('');
    setTelefoneContato('');
    setFotoUri(null);
    setModalVisivel(false);
    Alert.alert('Anúncio publicado!', 'A divulgação de fuga foi adicionada à lista.');
  }

  function renderPerdidoCard({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => setAnimalSelecionado(item)}
      >
        <View style={styles.procuraSeBadge}>
          <Text style={styles.procuraSeText}>Procura-se</Text>
        </View>

        <View style={styles.cardRow}>
          <Image source={{ uri: item.foto }} style={styles.cardImage} />

          <View style={styles.cardInfo}>
            <Text style={styles.animalName}>{item.nome}</Text>

            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={COLORS.red500} />
              <Text style={styles.locationText}>Visto em: {item.vistoEm}</Text>
            </View>

            <Text style={styles.descriptionText} numberOfLines={2}>
              {item.descricao}
            </Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.cluesButton}
                onPress={() =>
                  Alert.alert(
                    `Entrar em contato sobre ${item.nome}`,
                    `Telefone do tutor: ${item.telefoneContato || '(93) 99123-4567'}`,
                    [{ text: 'Fechar' }]
                  )
                }
              >
                <Ionicons name="call-outline" size={14} color={COLORS.red600} />
                <Text style={styles.cluesButtonText}>Tenho pistas</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => compartilhar(item)}
              >
                <Ionicons name="share-social-outline" size={16} color={COLORS.gray500} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <MainHeader
        searchValue={busca}
        onSearchChange={setBusca}
        showMenuButton={false}
        onFilterPress={() => setModalFiltroVisivel(true)}
      />

      <FlatList
        data={perdidosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderPerdidoCard}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.sectionSubtitle}>
            Animais que precisam voltar para casa:
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => setModalVisivel(true)}
      >
        <Ionicons name="megaphone" size={20} color={COLORS.white} />
        <Text style={styles.fabText}>Divulgar Fuga</Text>
      </TouchableOpacity>

      <Modal
        visible={Boolean(animalSelecionado)}
        transparent
        animationType="slide"
        onRequestClose={() => setAnimalSelecionado(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.detailModalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailImageWrapper}>
                {animalSelecionado?.foto ? (
                  <Image source={{ uri: animalSelecionado.foto }} style={styles.detailImage} />
                ) : null}
                <View style={styles.detailBadge}>
                  <Text style={styles.procuraSeText}>Procura-se</Text>
                </View>
                <TouchableOpacity
                  style={styles.detailCloseBtn}
                  onPress={() => setAnimalSelecionado(null)}
                >
                  <Ionicons name="close" size={22} color={COLORS.gray800} />
                </TouchableOpacity>
              </View>

              <View style={styles.detailBody}>
                <Text style={styles.detailTitle}>{animalSelecionado?.nome}</Text>
                <Text style={styles.detailSpecies}>{animalSelecionado?.especie}</Text>

                <View style={styles.detailInfoBox}>
                  <View style={styles.detailInfoRow}>
                    <Ionicons name="location" size={18} color={COLORS.red500} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailInfoLabel}>Último local visto</Text>
                      <Text style={styles.detailInfoValue}>{animalSelecionado?.vistoEm}</Text>
                    </View>
                  </View>

                  <View style={styles.detailInfoRow}>
                    <Ionicons name="call" size={18} color={COLORS.brandTeal} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailInfoLabel}>Contato do tutor</Text>
                      <Text style={styles.detailInfoValue}>
                        {animalSelecionado?.telefoneContato || '(93) 99123-4567'}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.detailDescLabel}>Detalhes e características</Text>
                <Text style={styles.detailDescText}>
                  {animalSelecionado?.descricao || 'Nenhuma descrição adicional informada.'}
                </Text>

                <View style={styles.detailActions}>
                  <TouchableOpacity
                    style={styles.detailCluesBtn}
                    onPress={() =>
                      Alert.alert(
                        `Contato sobre ${animalSelecionado?.nome}`,
                        `Ligue ou envie mensagem para: ${animalSelecionado?.telefoneContato || '(93) 99123-4567'}`
                      )
                    }
                  >
                    <Ionicons name="call" size={18} color={COLORS.white} />
                    <Text style={styles.detailCluesBtnText}>Tenho pistas</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailShareBtn}
                    onPress={() => animalSelecionado && compartilhar(animalSelecionado)}
                  >
                    <Ionicons name="share-social-outline" size={20} color={COLORS.gray700} />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisivel} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Divulgar Animal Perdido</Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray500} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.photoPicker} onPress={escolherFotoPerdido}>
              {fotoUri ? (
                <Image source={{ uri: fotoUri }} style={styles.photoPreview} />
              ) : (
                <>
                  <Ionicons name="camera" size={24} color={COLORS.red500} />
                  <Text style={styles.photoPickerText}>Escolher foto do animal</Text>
                </>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Nome do animal (ex: Bidu)"
              placeholderTextColor={COLORS.gray400}
              value={nome}
              onChangeText={setNome}
            />

            <View style={styles.speciesToggle}>
              {['Cachorro', 'Gato'].map((esp) => (
                <TouchableOpacity
                  key={esp}
                  style={[styles.speciesBtn, especie === esp && styles.speciesBtnActive]}
                  onPress={() => setEspecie(esp)}
                >
                  <Text style={[styles.speciesBtnText, especie === esp && styles.speciesBtnTextActive]}>
                    {esp}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Último local visto (ex: Bairro Prainha)"
              placeholderTextColor={COLORS.gray400}
              value={vistoEm}
              onChangeText={setVistoEm}
            />

            <TextInput
              style={styles.input}
              placeholder="Telefone para contato"
              placeholderTextColor={COLORS.gray400}
              keyboardType="phone-pad"
              value={telefoneContato}
              onChangeText={setTelefoneContato}
            />

            <TextInput
              style={[styles.input, { height: 76, textAlignVertical: 'top' }]}
              placeholder="Características, coleira, quando desapareceu..."
              placeholderTextColor={COLORS.gray400}
              multiline
              value={descricao}
              onChangeText={setDescricao}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSalvarFuga}>
              <Text style={styles.submitBtnText}>Publicar Alerta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Modal de Filtro de Perdidos */}
      <Modal
        visible={modalFiltroVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalFiltroVisivel(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar Perdidos</Text>
              <TouchableOpacity onPress={() => setModalFiltroVisivel(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray500} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.gray800 }}>
              Espécie
            </Text>
            <View style={styles.speciesToggle}>
              {['Todos', 'Cachorro', 'Gato'].map((esp) => {
                const ativo = filtroEspecie === esp;
                return (
                  <TouchableOpacity
                    key={esp}
                    style={[
                      styles.speciesBtn,
                      ativo && { backgroundColor: COLORS.brandTeal },
                    ]}
                    onPress={() => setFiltroEspecie(esp)}
                  >
                    <Text
                      style={[
                        styles.speciesBtnText,
                        ativo && styles.speciesBtnTextActive,
                      ]}
                    >
                      {esp}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: COLORS.brandTeal }]}
              onPress={() => setModalFiltroVisivel(false)}
            >
              <Text style={styles.submitBtnText}>Aplicar Filtro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 110,
    gap: 14,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray500,
    marginBottom: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.red100,
    position: 'relative',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  procuraSeBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.red500,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
    zIndex: 2,
  },
  procuraSeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 14,
  },
  cardImage: {
    width: 96,
    height: 96,
    borderRadius: 14,
    backgroundColor: COLORS.gray200,
  },
  cardInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.red500,
  },
  descriptionText: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 4,
    lineHeight: 17,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  cluesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.red50,
    borderWidth: 1,
    borderColor: COLORS.red100,
  },
  cluesButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.red600,
  },
  shareButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 22,
    backgroundColor: COLORS.red500,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 40,
  },
  fabText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  photoPicker: {
    height: 96,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.red500,
    backgroundColor: COLORS.red50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 4,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPickerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.red600,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.gray800,
    backgroundColor: COLORS.gray50,
  },
  speciesToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    padding: 4,
    gap: 6,
  },
  speciesBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  speciesBtnActive: {
    backgroundColor: COLORS.red500,
  },
  speciesBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  speciesBtnTextActive: {
    color: COLORS.white,
  },
  submitBtn: {
    backgroundColor: COLORS.red500,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  detailModalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  detailImageWrapper: {
    width: '100%',
    height: 240,
    backgroundColor: COLORS.gray200,
    position: 'relative',
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  detailBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: COLORS.red500,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  detailCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBody: {
    padding: 22,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  detailSpecies: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray500,
    marginTop: 2,
    marginBottom: 16,
  },
  detailInfoBox: {
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    marginBottom: 18,
  },
  detailInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailInfoLabel: {
    fontSize: 11,
    color: COLORS.gray400,
  },
  detailInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  detailDescLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 6,
  },
  detailDescText: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
    marginBottom: 22,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 10,
  },
  detailCluesBtn: {
    flex: 1,
    backgroundColor: COLORS.red500,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  detailCluesBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  detailShareBtn: {
    width: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
