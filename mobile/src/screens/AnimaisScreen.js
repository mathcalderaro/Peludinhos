import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { MainHeader } from '../components/Header';
import { PataFilterIcon, DogFilterIcon, CatFilterIcon } from '../components/Icons';
import { usePets } from '../context/PetsContext';

const CATEGORIAS = [
  { key: 'Todos', label: 'Todos' },
  { key: 'Cachorros', label: 'Cachorros' },
  { key: 'Gatos', label: 'Gatos' },
  { key: 'Chipados', label: 'Chipados' },
];

export default function AnimaisScreen({ navigation }) {
  const { animais, removerAnimal } = usePets();
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [filtroSaude, setFiltroSaude] = useState('Todos');
  const [modalFiltroVisivel, setModalFiltroVisivel] = useState(false);
  const [animalOpcoes, setAnimalOpcoes] = useState(null);

  function confirmarExclusao(animal) {
    setAnimalOpcoes(null);
    Alert.alert(
      'Apagar registro',
      `Tem certeza que deseja apagar "${animal.nome}" da lista de avistamentos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => removerAnimal(animal.id),
        },
      ]
    );
  }

  const animaisFiltrados = useMemo(() => {
    return animais.filter((item) => {
      const matchCategoria =
        categoriaAtiva === 'Todos' ||
        (categoriaAtiva === 'Cachorros' && item.especie === 'Cachorro') ||
        (categoriaAtiva === 'Gatos' && item.especie === 'Gato') ||
        (categoriaAtiva === 'Chipados' && item.chipado);

      const matchSaude =
        filtroSaude === 'Todos' ||
        (filtroSaude === 'Castrado' && item.castrado) ||
        (filtroSaude === 'Vacinado' && item.vacinado) ||
        (filtroSaude === 'Chipado' && item.chipado);

      const termo = busca.trim().toLowerCase();
      const matchBusca =
        !termo ||
        item.nome.toLowerCase().includes(termo) ||
        item.local.toLowerCase().includes(termo) ||
        item.raca.toLowerCase().includes(termo);

      return matchCategoria && matchSaude && matchBusca;
    });
  }, [animais, busca, categoriaAtiva, filtroSaude]);

  function renderAnimalCard({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('DetalhesAnimal', { animal: item })}
      >
        <Image source={{ uri: item.foto }} style={styles.cardImage} />

        <View style={styles.cardBody}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.animalName}>{item.nome}</Text>
              <Text style={styles.animalMeta}>
                {item.tempo} • {item.local}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setAnimalOpcoes(item)}
              style={{ padding: 6 }}
              accessibilityLabel="Opções do animal"
            >
              <Ionicons name="ellipsis-vertical" size={18} color={COLORS.gray400} />
            </TouchableOpacity>
          </View>

          <View style={styles.tagsRow}>
            {item.castrado ? (
              <View style={styles.tagTeal}>
                <Text style={styles.tagTealText}>Castrado</Text>
              </View>
            ) : (
              <View style={styles.tagTeal}>
                <Text style={styles.tagTealText}>Não castrado</Text>
              </View>
            )}

            {item.vacinado && !item.castrado ? (
              <View style={styles.tagTeal}>
                <Text style={styles.tagTealText}>Vacinado</Text>
              </View>
            ) : null}

            {item.chipado ? (
              <View style={styles.tagTeal}>
                <Text style={styles.tagTealText}>Chipado</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.watermark} pointerEvents="none">
          <FontAwesome5 name="paw" size={32} color={COLORS.brandOrange} />
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

      <View style={styles.content}>
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterCirclesContainer}
          >
            {CATEGORIAS.map((cat) => {
              const ativo = categoriaAtiva === cat.key;
              const iconColor = ativo ? COLORS.white : COLORS.brandTeal;

              return (
                <TouchableOpacity
                  key={cat.key}
                  style={styles.filterCircleItem}
                  activeOpacity={0.8}
                  onPress={() => setCategoriaAtiva(cat.key)}
                >
                  <View
                    style={[
                      styles.filterCircle,
                      ativo ? styles.filterCircleActive : styles.filterCircleInactive,
                    ]}
                  >
                    {cat.key === 'Todos' ? (
                      <PataFilterIcon size={24} color={iconColor} />
                    ) : cat.key === 'Cachorros' ? (
                      <DogFilterIcon size={28} color={iconColor} />
                    ) : cat.key === 'Gatos' ? (
                      <CatFilterIcon size={26} color={iconColor} />
                    ) : (
                      <Ionicons name="shield-checkmark" size={22} color={iconColor} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.filterCircleLabel,
                      ativo ? styles.filterCircleLabelActive : styles.filterCircleLabelInactive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <FlatList
          data={animaisFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderAnimalCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Nenhum animal encontrado para esta busca.</Text>
            </View>
          }
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('NovoAvistamento')}
      >
        <Ionicons name="add" size={30} color={COLORS.white} />
      </TouchableOpacity>

      <Modal
        visible={Boolean(animalOpcoes)}
        transparent
        animationType="fade"
        onRequestClose={() => setAnimalOpcoes(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setAnimalOpcoes(null)}
        >
          <View style={styles.optionsCard}>
            <Text style={styles.optionsTitle}>{animalOpcoes?.nome}</Text>
            <Text style={styles.optionsSubtitle}>
              {animalOpcoes?.especie} • {animalOpcoes?.raca || 'SRD'}
            </Text>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                const alvo = animalOpcoes;
                setAnimalOpcoes(null);
                navigation.navigate('DetalhesAnimal', { animal: alvo });
              }}
            >
              <Ionicons name="eye-outline" size={20} color={COLORS.gray700} />
              <Text style={styles.optionText}>Ver detalhes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                const alvo = animalOpcoes;
                setAnimalOpcoes(null);
                navigation.navigate('NovoAvistamento', { animalParaEditar: alvo });
              }}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.brandTeal} />
              <Text style={[styles.optionText, { color: COLORS.brandTeal }]}>
                Editar informações
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionRow, { borderBottomWidth: 0 }]}
              onPress={() => confirmarExclusao(animalOpcoes)}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.red500} />
              <Text style={[styles.optionText, { color: COLORS.red500 }]}>
                Apagar registro
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de Filtros */}
      <Modal
        visible={modalFiltroVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalFiltroVisivel(false)}
      >
        <View style={styles.filterModalBackdrop}>
          <View style={styles.filterModalCard}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.optionsTitle}>Filtrar Animais</Text>
              <TouchableOpacity onPress={() => setModalFiltroVisivel(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray500} />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterGroupLabel}>Espécie</Text>
            <View style={styles.filterChipsWrap}>
              {['Todos', 'Cachorros', 'Gatos'].map((cat) => {
                const ativo = categoriaAtiva === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterChip, ativo && styles.filterChipActive]}
                    onPress={() => setCategoriaAtiva(cat)}
                  >
                    <Text style={[styles.filterChipText, ativo && styles.filterChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.filterGroupLabel}>Saúde</Text>
            <View style={styles.filterChipsWrap}>
              {['Todos', 'Castrado', 'Vacinado', 'Chipado'].map((saude) => {
                const ativo = filtroSaude === saude;
                return (
                  <TouchableOpacity
                    key={saude}
                    style={[styles.filterChip, ativo && styles.filterChipActive]}
                    onPress={() => setFiltroSaude(saude)}
                  >
                    <Text style={[styles.filterChipText, ativo && styles.filterChipTextActive]}>
                      {saude}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.filterModalActions}>
              <TouchableOpacity
                style={styles.filterClearBtn}
                onPress={() => {
                  setCategoriaAtiva('Todos');
                  setFiltroSaude('Todos');
                  setModalFiltroVisivel(false);
                }}
              >
                <Text style={styles.filterClearText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterApplyBtn}
                onPress={() => setModalFiltroVisivel(false)}
              >
                <Text style={styles.filterApplyText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
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
  content: {
    flex: 1,
  },
  filterCirclesContainer: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 22,
    alignItems: 'center',
  },
  filterCircleItem: {
    alignItems: 'center',
    gap: 6,
  },
  filterCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCircleActive: {
    backgroundColor: COLORS.brandTeal,
    elevation: 4,
    shadowColor: COLORS.brandTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  filterCircleInactive: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  filterCircleLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterCircleLabelActive: {
    color: COLORS.brandTeal,
    fontWeight: '700',
  },
  filterCircleLabelInactive: {
    color: COLORS.brandTeal,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 100,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    position: 'relative',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: COLORS.gray200,
  },
  cardBody: {
    flex: 1,
    zIndex: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  animalName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  animalMeta: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 3,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tagTeal: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.teal700,
  },
  tagTealText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.teal700,
  },
  tagOrange: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.orange400,
  },
  tagOrangeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.orange500,
  },
  watermark: {
    position: 'absolute',
    right: 14,
    bottom: 10,
    opacity: 0.14,
    zIndex: 1,
  },
  emptyBox: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.gray500,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 40,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 28,
  },
  optionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 20,
    elevation: 10,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  optionsSubtitle: {
    fontSize: 13,
    color: COLORS.gray500,
    marginTop: 2,
    marginBottom: 14,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  filterModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  filterModalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterGroupLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 10,
    marginTop: 6,
  },
  filterChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.gray50,
  },
  filterChipActive: {
    backgroundColor: COLORS.brandTeal,
    borderColor: COLORS.brandTeal,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  filterModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  filterClearBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    alignItems: 'center',
  },
  filterClearText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray600,
  },
  filterApplyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.brandTeal,
    alignItems: 'center',
  },
  filterApplyText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
