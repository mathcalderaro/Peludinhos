import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useAuth, formatarTelefone } from '../context/AuthContext';
import DogLoadingOverlay from '../components/DogLoadingScreen';

export default function CadastroScreen({ navigation }) {
  const { cadastrar } = useAuth();

  const [fotoUri, setFotoUri] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);

  async function escolherFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso às suas fotos para escolher uma imagem de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setFotoUri(result.assets[0].uri);
      setErros((prev) => ({ ...prev, foto: null }));
    }
  }

  function validar() {
    const novosErros = {};
    const digitosCelular = celular.replace(/\D/g, '');

    if (nome.trim().length < 3) {
      novosErros.nome = 'Informe seu nome completo.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      novosErros.email = 'Informe um e-mail válido.';
    }
    if (digitosCelular.length < 10 || digitosCelular.length > 11) {
      novosErros.celular = 'Informe um celular válido com DDD.';
    }
    if (senha.length < 6) {
      novosErros.senha = 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (!confirmarSenha || confirmarSenha !== senha) {
      novosErros.confirmarSenha = 'As senhas não conferem.';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleCadastro() {
    if (!validar()) return;

    setCarregando(true);
    const resultado = await cadastrar({
      nome,
      email,
      telefone: celular,
      senha,
      fotoUri,
    });
    setCarregando(false);

    if (!resultado.ok) {
      if (resultado.status === 409) {
        setErros((prev) => ({ ...prev, email: resultado.erro }));
        return;
      }
      Alert.alert('Erro no cadastro', resultado.erro);
      return;
    }

    Alert.alert(
      'Sucesso!',
      'Cadastro realizado com sucesso! Faça login para continuar.',
      [{ text: 'Ir para o Login', onPress: () => navigation.navigate('Login') }]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <DogLoadingOverlay visible={carregando} message="Criando conta..." />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerSection}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Crie sua conta</Text>
            <Text style={styles.subtitle}>
              Cadastre-se para começar{'\n'}a ajudar os peludinhos.
            </Text>
          </View>

          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={escolherFoto} activeOpacity={0.8}>
              {fotoUri ? (
                <Image source={{ uri: fotoUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={42} color={COLORS.gray300} />
              )}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={16} color={COLORS.white} />
              </View>
            </TouchableOpacity>
            <Text style={styles.photoHint}>
              Foto de perfil <Text style={{ color: COLORS.gray400 }}>(opcional)</Text>
            </Text>
            {fotoUri ? (
              <TouchableOpacity onPress={() => setFotoUri(null)}>
                <Text style={styles.removePhotoText}>Remover foto</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.form}>
            <View>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={COLORS.gray400} style={styles.leftIcon} />
                <TextInput
                  style={[styles.input, erros.nome && styles.inputError]}
                  placeholder="Nome completo"
                  placeholderTextColor={COLORS.gray400}
                  value={nome}
                  onChangeText={(t) => {
                    setNome(t);
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
                  style={[styles.input, erros.email && styles.inputError]}
                  placeholder="E-mail"
                  placeholderTextColor={COLORS.gray400}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (erros.email) setErros((p) => ({ ...p, email: null }));
                  }}
                />
              </View>
              {erros.email ? <Text style={styles.errorText}>{erros.email}</Text> : null}
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
                  value={celular}
                  onChangeText={(t) => {
                    setCelular(formatarTelefone(t));
                    if (erros.celular) setErros((p) => ({ ...p, celular: null }));
                  }}
                />
              </View>
              {erros.celular ? <Text style={styles.errorText}>{erros.celular}</Text> : null}
            </View>

            <View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.gray400} style={styles.leftIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 44 }, erros.senha && styles.inputError]}
                  placeholder="Senha (mín. 6 caracteres)"
                  placeholderTextColor={COLORS.gray400}
                  secureTextEntry={!mostrarSenha}
                  value={senha}
                  onChangeText={(t) => {
                    setSenha(t);
                    if (erros.senha) setErros((p) => ({ ...p, senha: null }));
                  }}
                />
                <TouchableOpacity
                  style={styles.rightIcon}
                  onPress={() => setMostrarSenha(!mostrarSenha)}
                >
                  <Ionicons
                    name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.gray400}
                  />
                </TouchableOpacity>
              </View>
              {erros.senha ? <Text style={styles.errorText}>{erros.senha}</Text> : null}
            </View>

            <View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.gray400} style={styles.leftIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 44 }, erros.confirmarSenha && styles.inputError]}
                  placeholder="Confirmar senha"
                  placeholderTextColor={COLORS.gray400}
                  secureTextEntry={!mostrarConfirmar}
                  value={confirmarSenha}
                  onChangeText={(t) => {
                    setConfirmarSenha(t);
                    if (erros.confirmarSenha) setErros((p) => ({ ...p, confirmarSenha: null }));
                  }}
                />
                <TouchableOpacity
                  style={styles.rightIcon}
                  onPress={() => setMostrarConfirmar(!mostrarConfirmar)}
                >
                  <Ionicons
                    name={mostrarConfirmar ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.gray400}
                  />
                </TouchableOpacity>
              </View>
              {erros.confirmarSenha ? <Text style={styles.errorText}>{erros.confirmarSenha}</Text> : null}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCadastro}
              disabled={carregando}
              activeOpacity={0.85}
            >
              {carregando ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Criar conta</Text>
                  <FontAwesome5 name="paw" size={15} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.backToLoginText}>Já tenho uma conta</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 190,
    height: 80,
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.brandTeal,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.brandTeal,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 54,
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
  form: {
    width: '100%',
    gap: 14,
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
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.gray800,
  },
  inputError: {
    borderColor: COLORS.red500,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.red500,
    marginTop: 4,
    paddingLeft: 4,
  },
  submitButton: {
    backgroundColor: COLORS.orange500,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
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
  backToLoginButton: {
    borderWidth: 2,
    borderColor: COLORS.brandTeal,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backToLoginText: {
    color: COLORS.brandTeal,
    fontSize: 16,
    fontWeight: '700',
  },
});
