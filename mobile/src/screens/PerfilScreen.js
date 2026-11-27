import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useAuth, formatarTelefone } from '../context/AuthContext';
import { usePets } from '../context/PetsContext';

function formatarMembroDesde(dataCadastro) {
  if (!dataCadastro) return 'Membro ativo';
  const data = new Date(dataCadastro);
  if (isNaN(data)) return 'Membro ativo';
  return 'Membro desde ' + data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export default function PerfilScreen({ navigation }) {
  const {
    usuario,
    carregarPerfil,
    atualizarPerfil,
    alterarSenha,
    resolverUrlFoto,
    sair,
  } = useAuth();
  const { animais, perdidos } = usePets();

  const meusAvistamentosCount = animais.filter((a) => a.cadastradoPeloUsuario).length;
  const meusPerdidosCount = perdidos.filter((p) => p.cadastradoPeloUsuario).length;

  const [modo, setModo] = useState('visualizacao');
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [avisoSucesso, setAvisoSucesso] = useState('');
  const [erros, setErros] = useState({});

  const [nomeEdit, setNomeEdit] = useState('');
  const [celularEdit, setCelularEdit] = useState('');
  const [novaFotoUri, setNovaFotoUri] = useState(undefined);
  const [removerFotoAtual, setRemoverFotoAtual] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  useEffect(() => {
    atualizarDados();
  }, []);

  async function atualizarDados() {
    setCarregando(true);
    await carregarPerfil();
    setCarregando(false);
  }

  function abrirEdicao() {
    setAvisoSucesso('');
    setErros({});
    setNomeEdit(usuario?.nome || '');
    setCelularEdit(formatarTelefone(usuario?.telefone || ''));
    setNovaFotoUri(undefined);
    setRemoverFotoAtual(false);
    setModo('editar');
  }

  function abrirAlterarSenha() {
    setAvisoSucesso('');
    setErros({});
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarNovaSenha('');
    setModo('senha');
  }

  async function escolherNovaFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!res.canceled && res.assets?.[0]?.uri) {
      setNovaFotoUri(res.assets[0].uri);
      setRemoverFotoAtual(false);
    }
  }

  async function handleSalvarPerfil() {
    const novosErros = {};
    const digitos = celularEdit.replace(/\D/g, '');

    if (nomeEdit.trim().length < 3) {
      novosErros.nome = 'Informe seu nome completo.';
    }
    if (digitos.length < 10 || digitos.length > 11) {
      novosErros.celular = 'Informe um celular válido com DDD.';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setSalvando(true);
    const res = await atualizarPerfil({
      nome: nomeEdit,
      telefone: celularEdit,
      novaFotoUri,
      removerFotoAtual,
    });
    setSalvando(false);

    if (!res.ok) {
      setErros({ form: res.erro });
      return;
    }

    setModo('visualizacao');
    setAvisoSucesso('Perfil atualizado com sucesso!');
  }

  async function handleSalvarSenha() {
    const novosErros = {};
    if (!senhaAtual) {
      novosErros.senhaAtual = 'Informe sua senha atual.';
    }
    if (novaSenha.length < 6) {
      novosErros.novaSenha = 'A nova senha deve ter pelo menos 6 caracteres.';
    }
    if (!confirmarNovaSenha || confirmarNovaSenha !== novaSenha) {
      novosErros.confirmarNovaSenha = 'As senhas não conferem.';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setSalvando(true);
    const res = await alterarSenha(senhaAtual, novaSenha);
    setSalvando(false);

    if (!res.ok) {
      setErros({ formSenha: res.erro });
      return;
    }

    setModo('visualizacao');
    setAvisoSucesso('Senha alterada com sucesso!');
  }

  const fotoExibida = removerFotoAtual
    ? null
    : novaFotoUri !== undefined
    ? novaFotoUri
    : resolverUrlFoto(usuario?.foto_perfil);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {carregando && !usuario ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.brandTeal} />
          </View>
        ) : null}

        {avisoSucesso ? (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.teal700} />
            <Text style={styles.successBannerText}>{avisoSucesso}</Text>
          </View>
        ) : null}

        {/* MODO VISUALIZAÇÃO (Tela com visual autêntico de Perfil) */}
        {modo === 'visualizacao' && usuario ? (
          <View>
            {/* Card Principal do Usuário */}
            <View style={styles.profileCard}>
              <View style={styles.avatarWrapper}>
                {resolverUrlFoto(usuario.foto_perfil) ? (
                  <Image
                    source={{ uri: resolverUrlFoto(usuario.foto_perfil) }}
                    style={styles.avatarImg}
                  />
                ) : (
                  <Ionicons name="person" size={44} color={COLORS.gray300} />
                )}
              </View>

              <Text style={styles.userName}>{usuario.nome}</Text>
              <Text style={styles.userEmail}>{usuario.email}</Text>
              <Text style={styles.memberSince}>
                {formatarMembroDesde(usuario.data_cadastro)}
              </Text>

              <TouchableOpacity
                style={styles.editProfilePill}
                activeOpacity={0.8}
                onPress={abrirEdicao}
              >
                <Ionicons name="create-outline" size={16} color={COLORS.teal700} />
                <Text style={styles.editProfilePillText}>Editar Perfil</Text>
              </TouchableOpacity>
            </View>

            {/* Estatísticas Rápidas */}
            <View style={styles.statsRow}>
              <TouchableOpacity
                style={styles.statBox}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Animais')}
              >
                <Text style={styles.statNumber}>{meusAvistamentosCount}</Text>
                <Text style={styles.statLabel}>Avistamentos</Text>
              </TouchableOpacity>

              <View style={styles.statDivider} />

              <TouchableOpacity
                style={styles.statBox}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Perdidos')}
              >
                <Text style={styles.statNumber}>{meusPerdidosCount}</Text>
                <Text style={styles.statLabel}>Perdidos</Text>
              </TouchableOpacity>
            </View>

            {/* Informações de Contato */}
            <View style={styles.contactCard}>
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={18} color={COLORS.brandTeal} />
                <Text style={styles.contactText}>
                  {usuario.telefone ? formatarTelefone(usuario.telefone) : 'Celular não informado'}
                </Text>
              </View>
            </View>

            {/* Lista de Opções do Perfil */}
            <View style={styles.menuList}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('Animais')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: COLORS.orange50 }]}>
                    <FontAwesome5 name="paw" size={18} color={COLORS.brandOrange} />
                  </View>
                  <Text style={styles.menuItemText}>Meus Avistamentos</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('Perdidos')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: COLORS.red50 }]}>
                    <Ionicons name="megaphone" size={20} color={COLORS.red500} />
                  </View>
                  <Text style={styles.menuItemText}>Meus Anúncios (Perdidos)</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.75}
                onPress={abrirAlterarSenha}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: COLORS.teal50 }]}>
                    <Ionicons name="lock-closed" size={20} color={COLORS.brandTeal} />
                  </View>
                  <Text style={styles.menuItemText}>Alterar Senha</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.75}
                onPress={() =>
                  Alert.alert(
                    'Ajuda e Suporte',
                    'Projeto Peludinhos - UFOPA.\nPara dúvidas ou sugestões, procure a equipe do projeto.'
                  )
                }
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: COLORS.gray100 }]}>
                    <Ionicons name="help-circle" size={20} color={COLORS.gray600} />
                  </View>
                  <Text style={styles.menuItemText}>Ajuda e Suporte</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.logoutCard]}
                activeOpacity={0.75}
                onPress={sair}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: COLORS.red100 }]}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.red600} />
                  </View>
                  <Text style={[styles.menuItemText, { color: COLORS.red600 }]}>Sair da Conta</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* MODO EDITAR PERFIL */}
        {modo === 'editar' ? (
          <View style={styles.formContainer}>
            <View style={styles.subModeHeader}>
              <TouchableOpacity onPress={() => setModo('visualizacao')} style={styles.backIconBtn}>
                <Ionicons name="arrow-back" size={22} color={COLORS.gray700} />
              </TouchableOpacity>
              <Text style={styles.formTitle}>Editar Perfil</Text>
              <View style={{ width: 30 }} />
            </View>

            <View style={styles.editPhotoSection}>
              <TouchableOpacity style={styles.editAvatarCircle} onPress={escolherNovaFoto}>
                {fotoExibida ? (
                  <Image source={{ uri: fotoExibida }} style={styles.avatarImg} />
                ) : (
                  <Ionicons name="person" size={44} color={COLORS.gray300} />
                )}
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={16} color={COLORS.white} />
                </View>
              </TouchableOpacity>
              <Text style={styles.photoHint}>
                Toque para {fotoExibida ? 'trocar a foto' : 'adicionar uma foto'}
              </Text>
              {fotoExibida ? (
                <TouchableOpacity
                  onPress={() => {
                    setNovaFotoUri(null);
                    setRemoverFotoAtual(true);
                  }}
                >
                  <Text style={styles.removePhotoText}>Remover foto</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={COLORS.gray400} style={styles.leftIcon} />
                <TextInput
                  style={[styles.input, erros.nome && styles.inputError]}
                  placeholder="Nome completo"
                  placeholderTextColor={COLORS.gray400}
                  value={nomeEdit}
                  onChangeText={(t) => {
                    setNomeEdit(t);
                    if (erros.nome) setErros((p) => ({ ...p, nome: null }));
                  }}
                />
              </View>
              {erros.nome ? <Text style={styles.errorText}>{erros.nome}</Text> : null}
            </View>

            <View>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={COLORS.gray400} style={styles.leftIcon} />
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={usuario?.email || ''}
                  editable={false}
                />
                <Ionicons name="lock-closed" size={16} color={COLORS.gray300} style={styles.rightIcon} />
              </View>
              <Text style={styles.readonlyHint}>
                O e-mail é usado no login e não pode ser alterado aqui.
              </Text>
            </View>

            <View>
              <View style={styles.inputWrapper}>
                <Ionicons name="phone-portrait-outline" size={18} color={COLORS.gray400} style={styles.leftIcon} />
                <TextInput
                  style={[styles.input, erros.celular && styles.inputError]}
                  placeholder="Celular (00) 00000-0000"
                  placeholderTextColor={COLORS.gray400}
                  keyboardType="phone-pad"
                  maxLength={15}
                  value={celularEdit}
                  onChangeText={(t) => {
                    setCelularEdit(formatarTelefone(t));
                    if (erros.celular) setErros((p) => ({ ...p, celular: null }));
                  }}
                />
              </View>
              {erros.celular ? <Text style={styles.errorText}>{erros.celular}</Text> : null}
            </View>

            {erros.form ? <Text style={styles.errorTextCenter}>{erros.form}</Text> : null}

            <TouchableOpacity
              style={styles.orangeButton}
              onPress={handleSalvarPerfil}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.orangeButtonText}>Salvar alterações</Text>
                  <FontAwesome5 name="paw" size={15} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => setModo('visualizacao')}
            >
              <Text style={styles.outlineButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* MODO ALTERAR SENHA */}
        {modo === 'senha' ? (
          <View style={styles.formContainer}>
            <View style={styles.subModeHeader}>
              <TouchableOpacity onPress={() => setModo('visualizacao')} style={styles.backIconBtn}>
                <Ionicons name="arrow-back" size={22} color={COLORS.gray700} />
              </TouchableOpacity>
              <Text style={styles.formTitle}>Alterar Senha</Text>
              <View style={{ width: 30 }} />
            </View>

            <View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.gray400} style={styles.leftIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 42 }, erros.senhaAtual && styles.inputError]}
                  placeholder="Senha atual"
                  placeholderTextColor={COLORS.gray400}
                  secureTextEntry={!mostrarSenhaAtual}
                  value={senhaAtual}
                  onChangeText={(t) => {
                    setSenhaAtual(t);
                    if (erros.senhaAtual) setErros((p) => ({ ...p, senhaAtual: null }));
                  }}
                />
                <TouchableOpacity
                  style={styles.rightIcon}
                  onPress={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                >
                  <Ionicons
                    name={mostrarSenhaAtual ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.gray400}
                  />
                </TouchableOpacity>
              </View>
              {erros.senhaAtual ? <Text style={styles.errorText}>{erros.senhaAtual}</Text> : null}
            </View>

            <View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.gray400} style={styles.leftIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 42 }, erros.novaSenha && styles.inputError]}
                  placeholder="Nova senha (mín. 6 caracteres)"
                  placeholderTextColor={COLORS.gray400}
                  secureTextEntry={!mostrarNovaSenha}
                  value={novaSenha}
                  onChangeText={(t) => {
                    setNovaSenha(t);
                    if (erros.novaSenha) setErros((p) => ({ ...p, novaSenha: null }));
                  }}
                />
                <TouchableOpacity
                  style={styles.rightIcon}
                  onPress={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                >
                  <Ionicons
                    name={mostrarNovaSenha ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.gray400}
                  />
                </TouchableOpacity>
              </View>
              {erros.novaSenha ? <Text style={styles.errorText}>{erros.novaSenha}</Text> : null}
            </View>

            <View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.gray400} style={styles.leftIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 42 }, erros.confirmarNovaSenha && styles.inputError]}
                  placeholder="Confirmar nova senha"
                  placeholderTextColor={COLORS.gray400}
                  secureTextEntry={!mostrarConfirmarSenha}
                  value={confirmarNovaSenha}
                  onChangeText={(t) => {
                    setConfirmarNovaSenha(t);
                    if (erros.confirmarNovaSenha) setErros((p) => ({ ...p, confirmarNovaSenha: null }));
                  }}
                />
                <TouchableOpacity
                  style={styles.rightIcon}
                  onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                >
                  <Ionicons
                    name={mostrarConfirmarSenha ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.gray400}
                  />
                </TouchableOpacity>
              </View>
              {erros.confirmarNovaSenha ? (
                <Text style={styles.errorText}>{erros.confirmarNovaSenha}</Text>
              ) : null}
            </View>

            {erros.formSenha ? <Text style={styles.errorTextCenter}>{erros.formSenha}</Text> : null}

            <TouchableOpacity
              style={styles.orangeButton}
              onPress={handleSalvarSenha}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.orangeButtonText}>Salvar nova senha</Text>
                  <FontAwesome5 name="paw" size={15} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => setModo('visualizacao')}
            >
              <Text style={styles.outlineButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : null}
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
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 90,
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.teal50,
    borderWidth: 1,
    borderColor: COLORS.teal100,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  successBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.teal700,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginBottom: 14,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: COLORS.teal100,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 21,
    fontWeight: '700',
    color: COLORS.gray900,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.gray500,
    marginTop: 2,
  },
  memberSince: {
    fontSize: 12,
    color: COLORS.gray400,
    marginTop: 4,
  },
  editProfilePill: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.teal50,
    borderWidth: 1,
    borderColor: COLORS.teal100,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
  },
  editProfilePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.teal700,
  },
  statsRow: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.brandTeal,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.gray100,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  menuList: {
    gap: 10,
  },
  menuItem: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.gray100,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray700,
  },
  logoutCard: {
    marginTop: 8,
    borderColor: COLORS.red100,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  subModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backIconBtn: {
    padding: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  editPhotoSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  editAvatarCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.brandTeal,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.orange500,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHint: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 10,
  },
  removePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.brandTeal,
    marginTop: 4,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  leftIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: 14,
    padding: 4,
    zIndex: 1,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 14,
    paddingLeft: 42,
    paddingRight: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.gray800,
  },
  inputDisabled: {
    backgroundColor: COLORS.gray100,
    color: COLORS.gray500,
  },
  inputError: {
    borderColor: COLORS.red500,
  },
  readonlyHint: {
    fontSize: 11,
    color: COLORS.gray400,
    marginTop: 4,
    paddingLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.red500,
    marginTop: 4,
    paddingLeft: 4,
  },
  errorTextCenter: {
    fontSize: 13,
    color: COLORS.red500,
    textAlign: 'center',
  },
  orangeButton: {
    backgroundColor: COLORS.orange500,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
  },
  orangeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: COLORS.brandTeal,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: COLORS.brandTeal,
    fontSize: 16,
    fontWeight: '700',
  },
});
