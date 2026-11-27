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
import { usePets } from '../context/PetsContext';

const CATEGORIAS = ['Todos', 'Cachorros', 'Gatos', 'Chipados'];

export default function AnimaisScreen({ navigation }) {
  const { animais, removerAnimal } = usePets();
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
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

      const termo = busca.trim().toLowerCase();
      const matchBusca =
        !termo ||
        item.nome.toLowerCase().includes(termo) ||
        item.local.toLowerCase().includes(termo) ||
        item.raca.toLowerCase().includes(termo);

      return matchCategoria && matchBusca;
    });
  }, [animais, busca, categoriaAtiva]);

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
              <View style={styles.tagOrange}>
                <Text style={styles.tagOrangeText}>Não castrado</Text>
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
        onFilterPress={() => {
          const proxIndex = (CATEGORIAS.indexOf(categoriaAtiva) + 1) % CATEGORIAS.length;
          setCategoriaAtiva(CATEGORIAS[proxIndex]);
        }}
      />

      <View style={styles.content}>
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContainer}
          >
            {CATEGORIAS.map((cat) => {
              const ativo = categoriaAtiva === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.pill, ativo ? styles.pillActive : styles.pillInactive]}
                  onPress={() => setCategoriaAtiva(cat)}
                >
                  <Text style={[styles.pillText, ativo ? styles.pillTextActive : styles.pillTextInactive]}>
                    {cat}
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
  pillsContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillActive: {
    backgroundColor: COLORS.brandTeal,
  },
  pillInactive: {
    backgroundColor: COLORS.white,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: COLORS.white,
  },
  pillTextInactive: {
    color: COLORS.gray600,
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
});
