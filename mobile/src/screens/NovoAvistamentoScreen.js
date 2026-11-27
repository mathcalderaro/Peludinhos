import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { SubHeader } from '../components/Header';
import { usePets } from '../context/PetsContext';
import { useAuth } from '../context/AuthContext';
import { RACAS_CACHORRO, RACAS_GATO } from '../data/racas';

const STEPS = [
  { key: 'foto', label: 'Foto', icon: 'camera' },
  { key: 'info', label: 'Informações', icon: 'document-text-outline' },
  { key: 'saude', label: 'Saúde', icon: 'heart-outline' },
  { key: 'local', label: 'Localização', icon: 'location-outline' },
];

export default function NovoAvistamentoScreen({ route, navigation }) {
  const { adicionarAvistamento, editarAnimal } = usePets();
  const { usuario } = useAuth();
  const animalParaEditar = route.params?.animalParaEditar || null;
  const modoEdicao = Boolean(animalParaEditar);

  const [fotoUri, setFotoUri] = useState(animalParaEditar?.foto || null);
  const [nome, setNome] = useState(animalParaEditar?.nome || '');
  const [especie, setEspecie] = useState(animalParaEditar?.especie || 'Cachorro');
  const [raca, setRaca] = useState(animalParaEditar?.raca || '');
  const [mostrarRacas, setMostrarRacas] = useState(false);

  const [sexo, setSexo] = useState(animalParaEditar?.sexo || 'Macho');
  const [idade, setIdade] = useState(animalParaEditar?.idade || '');
  const [porte, setPorte] = useState(animalParaEditar?.porte || 'Médio');
  const [cor, setCor] = useState(animalParaEditar?.cor || '');
  const [cadastradoPor, setCadastradoPor] = useState(
    animalParaEditar?.cadastradoPor || usuario?.nome || 'Projeto Peludinhos'
  );

  const [local, setLocal] = useState(
    animalParaEditar?.endereco || animalParaEditar?.local || ''
  );
  const [coords, setCoords] = useState(
    animalParaEditar?.lat && animalParaEditar?.lng
      ? { lat: animalParaEditar.lat, lng: animalParaEditar.lng }
      : null
  );
  const [buscandoLocal, setBuscandoLocal] = useState(false);

  const [castrado, setCastrado] = useState(Boolean(animalParaEditar?.castrado));
  const [vacinado, setVacinado] = useState(Boolean(animalParaEditar?.vacinado));
  const [chipado, setChipado] = useState(Boolean(animalParaEditar?.chipado));
  const [descricao, setDescricao] = useState(animalParaEditar?.descricao || '');

  const racasDisponiveis = useMemo(() => {
    const base = especie === 'Gato' ? RACAS_GATO : RACAS_CACHORRO;
    const termo = raca.trim().toLowerCase();
    if (!termo) return base;
    return base.filter((item) => item.toLowerCase().includes(termo));
  }, [especie, raca]);

  async function escolherFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso às fotos para anexar a imagem do animal.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!res.canceled && res.assets?.[0]?.uri) {
      setFotoUri(res.assets[0].uri);
    }
  }

  async function obterLocalizacaoAtual() {
    setBuscandoLocal(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão de localização',
          'Ative a permissão de localização para preencher onde você está agora.'
        );
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lng: longitude });

      try {
        const enderecos = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (enderecos && enderecos.length > 0) {
          const e = enderecos[0];
          const partes = [
            e.street ? (e.streetNumber ? `${e.street}, ${e.streetNumber}` : e.street) : null,
            e.district || e.subregion,
            e.city,
          ].filter(Boolean);

          if (partes.length > 0) {
            setLocal(partes.join(' - '));
            return;
          }
        }
      } catch (geoErr) {
        // Fallback para coordenadas
      }

      setLocal(`Local atual (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
    } catch (erro) {
      Alert.alert(
        'Não foi possível obter o GPS',
        'Verifique se o GPS do dispositivo está ativado ou digite o endereço manualmente.'
      );
    } finally {
      setBuscandoLocal(false);
    }
  }

  function handleSalvar() {
    if (modoEdicao) {
      const atualizado = editarAnimal(animalParaEditar.id, {
        nome,
        especie,
        raca,
        sexo,
        idade,
        porte,
        cor,
        cadastradoPor,
        local: local || 'Centro',
        lat: coords?.lat,
        lng: coords?.lng,
        castrado,
        vacinado,
        chipado,
        foto: fotoUri,
        descricao,
      });

      Alert.alert(
        'Alterações salvas!',
        `As informações de ${atualizado?.nome || nome} foram atualizadas.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    const novoAnimal = adicionarAvistamento({
      nome,
      especie,
      raca,
      sexo,
      idade,
      porte,
      cor,
      cadastradoPor,
      local: local || 'Centro',
      lat: coords?.lat,
      lng: coords?.lng,
      castrado,
      vacinado,
      chipado,
      foto: fotoUri,
      descricao,
    });

    Alert.alert(
      'Avistamento registrado!',
      `O registro de ${novoAnimal.nome} foi salvo com sucesso.`,
      [
        {
          text: 'Ver Animal',
          onPress: () => navigation.replace('DetalhesAnimal', { animal: novoAnimal }),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <SubHeader onBack={() => navigation.goBack()} rounded={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.stepsContainer}>
          <View style={styles.stepsLine} />
          {STEPS.map((step, index) => {
            const ativo =
              index === 0 ||
              (index === 1 && (nome.length > 0 || raca.length > 0 || idade.length > 0 || descricao.length > 0)) ||
              (index === 2 && (castrado || vacinado || chipado)) ||
              (index === 3 && local.length > 0);
            return (
              <View key={step.key} style={styles.stepItem}>
                <View style={[styles.stepCircle, ativo ? styles.stepCircleActive : styles.stepCircleInactive]}>
                  <Ionicons
                    name={step.icon}
                    size={20}
                    color={ativo ? COLORS.white : COLORS.gray400}
                  />
                </View>
                <Text style={[styles.stepLabel, ativo && styles.stepLabelActive]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.uploadBox} onPress={escolherFoto} activeOpacity={0.8}>
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={styles.uploadedImage} />
          ) : (
            <>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="camera" size={22} color={COLORS.white} />
              </View>
              <Text style={styles.uploadText}>Adicionar foto{'\n'}do animal</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>Nome (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Como podemos identificar?"
              placeholderTextColor={COLORS.gray400}
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View>
            <Text style={styles.label}>Espécie</Text>
            <View style={styles.speciesBox}>
              {['Cachorro', 'Gato'].map((esp) => {
                const ativo = especie === esp;
                return (
                  <TouchableOpacity
                    key={esp}
                    style={[styles.speciesBtn, ativo && styles.speciesBtnActive]}
                    onPress={() => {
                      setEspecie(esp);
                      setMostrarRacas(false);
                    }}
                  >
                    <Text style={[styles.speciesText, ativo && styles.speciesTextActive]}>
                      {esp}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Raça com Seleção / Autocomplete */}
          <View>
            <Text style={styles.label}>Raça (opcional)</Text>
            <View style={styles.inputActionWrapper}>
              <TextInput
                style={[styles.input, { paddingRight: 44 }]}
                placeholder={
                  especie === 'Gato'
                    ? 'Digite ou selecione (ex: Siamês, SRD...)'
                    : 'Digite ou selecione (ex: Golden, Vira-lata...)'
                }
                placeholderTextColor={COLORS.gray400}
                value={raca}
                onFocus={() => setMostrarRacas(true)}
                onChangeText={(texto) => {
                  setRaca(texto);
                  setMostrarRacas(true);
                }}
              />
              <TouchableOpacity
                style={styles.inputRightBtn}
                onPress={() => setMostrarRacas((prev) => !prev)}
                accessibilityLabel="Listar raças"
              >
                <Ionicons
                  name={mostrarRacas ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.brandTeal}
                />
              </TouchableOpacity>
            </View>

            {mostrarRacas && racasDisponiveis.length > 0 ? (
              <View style={styles.dropdownBox}>
                <ScrollView
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  style={styles.dropdownScroll}
                >
                  {racasDisponiveis.map((item) => {
                    const selecionada = raca.toLowerCase() === item.toLowerCase();
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.dropdownItem,
                          selecionada && styles.dropdownItemSelected,
                        ]}
                        onPress={() => {
                          setRaca(item);
                          setMostrarRacas(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            selecionada && styles.dropdownItemTextSelected,
                          ]}
                        >
                          {item}
                        </Text>
                        {selecionada ? (
                          <Ionicons name="checkmark" size={16} color={COLORS.brandTeal} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}
          </View>

          {/* Gênero e Idade */}
          <View style={styles.twoColRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Gênero</Text>
              <View style={styles.speciesBox}>
                {['Macho', 'Fêmea'].map((gen) => {
                  const ativo = sexo === gen;
                  return (
                    <TouchableOpacity
                      key={gen}
                      style={[styles.speciesBtn, ativo && styles.speciesBtnActive]}
                      onPress={() => setSexo(gen)}
                    >
                      <Text style={[styles.speciesText, ativo && styles.speciesTextActive]}>
                        {gen}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Idade (aprox.)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 1 ano, 6 meses"
                placeholderTextColor={COLORS.gray400}
                value={idade}
                onChangeText={setIdade}
              />
            </View>
          </View>

          {/* Porte e Cor */}
          <View style={styles.twoColRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Porte</Text>
              <View style={styles.speciesBox}>
                {['Pequeno', 'Médio', 'Grande'].map((p) => {
                  const ativo = porte === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[styles.speciesBtn, ativo && styles.speciesBtnActive]}
                      onPress={() => setPorte(p)}
                    >
                      <Text style={[styles.speciesText, { fontSize: 12 }, ativo && styles.speciesTextActive]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <View>
            <Text style={styles.label}>Cor (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Caramelo, Preto, Rajado..."
              placeholderTextColor={COLORS.gray400}
              value={cor}
              onChangeText={setCor}
            />
          </View>

          {/* Saúde */}
          <View>
            <Text style={styles.label}>Saúde (opcional)</Text>
            <View style={styles.healthRow}>
              <TouchableOpacity
                style={[styles.healthChip, castrado && styles.healthChipActive]}
                onPress={() => setCastrado(!castrado)}
              >
                <Ionicons
                  name={castrado ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={castrado ? COLORS.brandTeal : COLORS.gray400}
                />
                <Text style={[styles.healthChipText, castrado && styles.healthChipTextActive]}>
                  Castrado
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.healthChip, vacinado && styles.healthChipActive]}
                onPress={() => setVacinado(!vacinado)}
              >
                <Ionicons
                  name={vacinado ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={vacinado ? COLORS.brandTeal : COLORS.gray400}
                />
                <Text style={[styles.healthChipText, vacinado && styles.healthChipTextActive]}>
                  Vacinado
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.healthChip, chipado && styles.healthChipActive]}
                onPress={() => setChipado(!chipado)}
              >
                <Ionicons
                  name={chipado ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={chipado ? COLORS.brandTeal : COLORS.gray400}
                />
                <Text style={[styles.healthChipText, chipado && styles.healthChipTextActive]}>
                  Chipado
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Localização com Pin */}
          <View>
            <Text style={styles.label}>Localização</Text>
            <View style={styles.locationInputRow}>
              <View style={[styles.inputActionWrapper, { flex: 1 }]}>
                <TextInput
                  style={[styles.input, { paddingRight: 44 }]}
                  placeholder="Ex: Av. Brasil, Campus UFOPA, Parque da Cidade..."
                  placeholderTextColor={COLORS.gray400}
                  value={local}
                  onChangeText={setLocal}
                />
                <TouchableOpacity
                  style={styles.pinButton}
                  onPress={obterLocalizacaoAtual}
                  disabled={buscandoLocal}
                  accessibilityLabel="Usar localização atual"
                >
                  {buscandoLocal ? (
                    <ActivityIndicator size="small" color={COLORS.brandTeal} />
                  ) : (
                    <Ionicons name="location-sharp" size={20} color={COLORS.brandTeal} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.gpsHintRow}
              onPress={obterLocalizacaoAtual}
              disabled={buscandoLocal}
            >
              <Ionicons name="navigate-circle-outline" size={15} color={COLORS.brandTeal} />
              <Text style={styles.gpsHintText}>
                {buscandoLocal
                  ? 'Obtendo localização atual...'
                  : 'Toque no pin para preencher com sua localização atual'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quem cadastrou */}
          <View>
            <Text style={styles.label}>Quem cadastrou</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome ou projeto (ex: Projeto Peludinhos)"
              placeholderTextColor={COLORS.gray400}
              value={cadastradoPor}
              onChangeText={setCadastradoPor}
            />
          </View>

          {/* Descrição */}
          <View>
            <Text style={styles.label}>Descrição</Text>
            <View style={styles.textareaWrapper}>
              <TextInput
                style={styles.textarea}
                placeholder="Características marcantes, cor, comportamento, etc."
                placeholderTextColor={COLORS.gray400}
                multiline
                maxLength={300}
                value={descricao}
                onChangeText={setDescricao}
              />
              <Text style={styles.counterText}>{descricao.length}/300</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.85}
            onPress={handleSalvar}
          >
            <Text style={styles.submitButtonText}>
              {modoEdicao ? 'Salvar alterações' : 'Próximo'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 40,
    gap: 20,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    paddingHorizontal: 6,
  },
  stepsLine: {
    position: 'absolute',
    top: 24,
    left: 34,
    right: 34,
    height: 1.5,
    backgroundColor: COLORS.gray200,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: COLORS.brandTeal,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  stepCircleInactive: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.gray500,
  },
  stepLabelActive: {
    fontWeight: '700',
    color: COLORS.brandTeal,
  },
  uploadBox: {
    width: '100%',
    height: 148,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d8c7b8',
    borderRadius: 18,
    backgroundColor: '#fdfaf5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray800,
    textAlign: 'center',
    lineHeight: 18,
  },
  form: {
    gap: 16,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 8,
  },
  inputActionWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.gray800,
  },
  inputRightBtn: {
    position: 'absolute',
    right: 10,
    padding: 6,
  },
  dropdownBox: {
    marginTop: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 14,
    maxHeight: 185,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 185,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.teal50,
  },
  dropdownItemText: {
    fontSize: 14,
    color: COLORS.gray700,
  },
  dropdownItemTextSelected: {
    color: COLORS.brandTeal,
    fontWeight: '700',
  },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinButton: {
    position: 'absolute',
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.teal50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingLeft: 2,
  },
  gpsHintText: {
    fontSize: 12,
    color: COLORS.brandTeal,
    fontWeight: '600',
  },
  speciesBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  speciesBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  speciesBtnActive: {
    backgroundColor: COLORS.brandTeal,
  },
  speciesText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  speciesTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  healthRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  healthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  healthChipActive: {
    borderColor: COLORS.brandTeal,
    backgroundColor: COLORS.teal50,
  },
  healthChipText: {
    fontSize: 13,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  healthChipTextActive: {
    color: COLORS.teal800,
    fontWeight: '700',
  },
  textareaWrapper: {
    position: 'relative',
  },
  textarea: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    fontSize: 14,
    color: COLORS.gray800,
    height: 110,
    textAlignVertical: 'top',
  },
  counterText: {
    position: 'absolute',
    right: 12,
    bottom: 8,
    fontSize: 11,
    color: COLORS.gray400,
  },
  submitButton: {
    backgroundColor: COLORS.brandOrange,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
