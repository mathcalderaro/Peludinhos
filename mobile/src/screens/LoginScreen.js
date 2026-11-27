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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import DogLoadingOverlay from '../components/DogLoadingScreen';

export default function LoginScreen({ navigation }) {
  const { login, loginDemonstracao, baseUrl, alterarBaseUrl } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);
  const [novoIp, setNovoIp] = useState(baseUrl);

  async function handleLogin() {
    if (!email.trim() || !senha) {
      Alert.alert('Atenção', 'Preencha o e-mail e a senha.');
      return;
    }

    setCarregando(true);
    const resultado = await login(email, senha);
    setCarregando(false);

    if (!resultado.ok) {
      Alert.alert('Erro no login', resultado.erro, [
        { text: 'Tentar novamente', style: 'cancel' },
        {
          text: 'Entrar em Modo Demo',
          onPress: () => loginDemonstracao(),
        },
      ]);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <DogLoadingOverlay visible={carregando} message="Carregando..." />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.configBtn}
            onPress={() => {
              setNovoIp(baseUrl);
              setModalConfig(true);
            }}
          >
            <Ionicons name="server-outline" size={18} color={COLORS.gray400} />
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeTitle}>Bem-vindo!</Text>
            <Text style={styles.welcomeSubtitle}>
              Faça login para continuar{'\n'}ajudando os peludinhos.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={COLORS.gray400} style={styles.leftIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor={COLORS.gray400}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.gray400} style={styles.leftIcon} />
              <TextInput
                style={[styles.input, { paddingRight: 44 }]}
                placeholder="Senha"
                placeholderTextColor={COLORS.gray400}
                secureTextEntry={!mostrarSenha}
                value={senha}
                onChangeText={setSenha}
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

            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() =>
                Alert.alert(
                  'Recuperação de senha',
                  'Entre em contato com o suporte ou redefina sua senha após entrar no aplicativo.'
                )
              }
            >
              <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={carregando}
              activeOpacity={0.85}
            >
              {carregando ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Entrar</Text>
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
            style={styles.createAccountButton}
            onPress={() => navigation.navigate('Cadastro')}
            activeOpacity={0.8}
          >
            <Text style={styles.createAccountText}>Criar conta</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalConfig} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Endereço do Servidor API</Text>
            <Text style={styles.modalSubtitle}>
              Para conectar ao PostgreSQL pelo celular físico, informe o IP do seu computador:
            </Text>
            <TextInput
              style={styles.modalInput}
              value={novoIp}
              onChangeText={setNovoIp}
              placeholder="http://192.168.1.43:3001"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalConfig(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={async () => {
                  await alterarBaseUrl(novoIp);
                  setModalConfig(false);
                }}
              >
                <Text style={styles.modalSaveText}>Salvar</Text>
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
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  configBtn: {
    position: 'absolute',
    top: 12,
    right: 20,
    padding: 8,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 260,
    height: 110,
    marginBottom: 28,
  },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.brandTeal,
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 21,
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
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.gray800,
  },
  forgotLink: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.brandTeal,
  },
  loginButton: {
    backgroundColor: COLORS.orange500,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: COLORS.white,
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
  createAccountButton: {
    borderWidth: 2,
    borderColor: COLORS.brandTeal,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAccountText: {
    color: COLORS.brandTeal,
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.gray500,
    marginBottom: 14,
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.gray800,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: COLORS.gray500,
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: COLORS.brandTeal,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalSaveText: {
    color: COLORS.white,
    fontWeight: '700',
  },
});
