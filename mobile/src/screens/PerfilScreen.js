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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useAuth, formatarTelefone } from '../context/AuthContext';

function formatarMembroDesde(dataCadastro) {
  if (!dataCadastro) return '';
  const data = new Date(dataCadastro);
  if (isNaN(data)) return '';
  return 'Membro desde ' + data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export default function PerfilScreen() {
  const {
    usuario,
    carregarPerfil,
    atualizarPerfil,
    alterarSenha,
    resolverUrlFoto,
    sair,
  } = useAuth();

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
        <View style={styles.topBar}>
          <View style={{ width: 40 }} />
          <Image
            source={require('../../assets/logo.png')}
            style={styles.topLogo}
            resizeMode="contain"
          />
          <View style={{ width: 40 }} />
        </View>

        {carregando && !usuario ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.brandTeal} />
          </View>
        ) : null}

        {modo !== 'editar' && usuario ? (
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
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
            <Text style={styles.memberSince}>
              {formatarMembroDesde(usuario.data_cadastro)}
            </Text>
          </View>
        ) : null}

        {avisoSucesso ? (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>{avisoSucesso}</Text>
          </View>
        ) : null}

        {modo === 'visualizacao' && usuario ? (
          <View style={styles.viewModeContainer}>
            <View style={styles.infoList}>
              <View style={styles.infoCard}>
                <Ionicons name="mail-outline" size={20} color={COLORS.gray400} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>E-mail</Text>
                  <Text style={styles.infoValue}>{usuario.email}</Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Ionicons name="phone-portrait-outline" size={20} color={COLORS.gray400} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Celular</Text>
                  <Text style={styles.infoValue}>
                    {usuario.telefone ? formatarTelefone(usuario.telefone) : 'Não informado'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.orangeButton} onPress={abrirEdicao}>
              <Text style={styles.orangeButtonText}>Editar perfil</Text>
              <FontAwesome5 name="paw" size={15} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineButton} onPress={abrirAlterarSenha}>
              <Text style={styles.outlineButtonText}>Alterar senha</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={sair}>
              <Ionicons name="log-out-outline" size={18} color={COLORS.red500} />
              <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {modo === 'editar' ? (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Editar perfil</Text>

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

        {modo === 'senha' ? (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Alterar senha</Text>

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
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 90,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  topLogo: {
    width: 140,
    height: 48,
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 26,
  },
  avatarCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: COLORS.brandTeal,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.brandTeal,
    textAlign: 'center',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  successBanner: {
    backgroundColor: COLORS.teal50,
    borderWidth: 1,
    borderColor: COLORS.teal100,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  successBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.teal700,
  },
  viewModeContainer: {
    width: '100%',
  },
  infoList: {
    gap: 12,
    marginBottom: 28,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.gray50,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.gray400,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    marginTop: 1,
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
    marginTop: 14,
  },
  outlineButtonText: {
    color: COLORS.brandTeal,
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray200,
  },
  dividerText: {
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.gray500,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.red500,
  },
  formContainer: {
    gap: 14,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
    textAlign: 'center',
    marginBottom: 4,
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
});
