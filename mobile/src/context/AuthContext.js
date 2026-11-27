import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const AuthContext = createContext({});

function getDefaultBaseUrl() {
  const debuggerHost =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    const hostIp = debuggerHost.split(':')[0];
    return `http://${hostIp}:3001`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }

  return 'http://localhost:3001';
}

export function formatarTelefone(valor) {
  let numeros = (valor || '').replace(/\D/g, '').slice(0, 11);

  if (numeros.length > 10) {
    numeros = numeros.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3');
  } else if (numeros.length > 6) {
    numeros = numeros.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
  } else if (numeros.length > 2) {
    numeros = numeros.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
  } else if (numeros.length > 0) {
    numeros = numeros.replace(/^(\d{0,2})$/, '($1');
  }

  return numeros;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [mostrarBoasVindas, setMostrarBoasVindas] = useState(false);
  const [baseUrl, setBaseUrl] = useState(getDefaultBaseUrl());

  useEffect(() => {
    restaurarSessao();
  }, []);

  async function restaurarSessao() {
    try {
      const savedUrl = await AsyncStorage.getItem('@peludinhos:baseUrl');
      if (savedUrl) {
        setBaseUrl(savedUrl);
      }

      const savedToken = await AsyncStorage.getItem('@peludinhos:token');
      const savedUser = await AsyncStorage.getItem('@peludinhos:usuario');

      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          setUsuario(JSON.parse(savedUser));
        }
      }
    } catch (e) {
      console.warn('Erro ao restaurar sessão:', e);
    } finally {
      setCarregandoSessao(false);
    }
  }

  async function alterarBaseUrl(novaUrl) {
    const limpa = novaUrl.trim().replace(/\/+$/, '');
    setBaseUrl(limpa);
    await AsyncStorage.setItem('@peludinhos:baseUrl', limpa);
  }

  function resolverUrlFoto(fotoPerfil) {
    if (!fotoPerfil) return null;
    if (/^(https?:\/\/|file:\/\/|content:\/\/|data:)/i.test(fotoPerfil)) {
      return fotoPerfil;
    }
    return `${baseUrl}${fotoPerfil.startsWith('/') ? '' : '/'}${fotoPerfil}`;
  }

  async function fetchAutenticado(caminho, opcoes = {}) {
    if (!token) {
      await sair();
      throw new Error('Sem token');
    }

    const headers = Object.assign({}, opcoes.headers, {
      Authorization: `Bearer ${token}`,
    });

    if (opcoes.body && typeof opcoes.body === 'string' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const resposta = await fetch(`${baseUrl}/api${caminho}`, {
      ...opcoes,
      headers,
    });

    if (resposta.status === 401) {
      await sair();
      throw new Error('Sessão expirada');
    }

    return resposta;
  }

  async function login(email, senha) {
    try {
      const resposta = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        return { ok: false, erro: dados.erro || 'Não foi possível realizar o login.' };
      }

      const emailNorm = email.trim().toLowerCase();
      const pendente = await AsyncStorage.getItem(`@peludinhos:boas_vindas_pendente:${emailNorm}`);

      await AsyncStorage.setItem('@peludinhos:token', dados.token);
      await AsyncStorage.setItem('@peludinhos:usuario', JSON.stringify(dados.usuario));
      setToken(dados.token);
      setUsuario(dados.usuario);
      if (pendente === 'true') {
        setMostrarBoasVindas(true);
      }

      return { ok: true };
    } catch (erro) {
      const localUsersRaw = await AsyncStorage.getItem('@peludinhos:usuarios_locais');
      const localUsers = localUsersRaw ? JSON.parse(localUsersRaw) : [];
      const encontrado = localUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.senha === senha
      );

      if (encontrado) {
        const emailNorm = email.trim().toLowerCase();
        const pendente = await AsyncStorage.getItem(`@peludinhos:boas_vindas_pendente:${emailNorm}`);
        const demoToken = 'local-jwt-token';
        await AsyncStorage.setItem('@peludinhos:token', demoToken);
        await AsyncStorage.setItem('@peludinhos:usuario', JSON.stringify(encontrado));
        setToken(demoToken);
        setUsuario(encontrado);
        if (pendente === 'true') {
          setMostrarBoasVindas(true);
        }
        return { ok: true, modoLocal: true };
      }

      return {
        ok: false,
        erro: `Não foi possível conectar ao servidor (${baseUrl}). Verifique se o backend está rodando com "npm start" ou crie uma conta no modo demonstração.`,
      };
    }
  }

  async function loginDemonstracao() {
    const demoUser = {
      id_usuario: 1,
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      telefone: '93991234567',
      foto_perfil: null,
      tipo_usuario: 'usuario',
      data_cadastro: new Date().toISOString(),
    };
    const demoToken = 'local-jwt-token';
    await AsyncStorage.setItem('@peludinhos:token', demoToken);
    await AsyncStorage.setItem('@peludinhos:usuario', JSON.stringify(demoUser));
    setToken(demoToken);
    setUsuario(demoUser);
  }

  async function cadastrar({ nome, email, telefone, senha, fotoUri }) {
    try {
      const resposta = await fetch(`${baseUrl}/api/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
          telefone: telefone.replace(/\D/g, ''),
          senha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        return {
          ok: false,
          status: resposta.status,
          erro: dados.erro || 'Não foi possível realizar o cadastro.',
        };
      }

      const emailNorm = email.trim().toLowerCase();
      await AsyncStorage.setItem(`@peludinhos:boas_vindas_pendente:${emailNorm}`, 'true');

      return { ok: true, usuario: dados.usuario };
    } catch (erro) {
      const localUsersRaw = await AsyncStorage.getItem('@peludinhos:usuarios_locais');
      const localUsers = localUsersRaw ? JSON.parse(localUsersRaw) : [];

      if (localUsers.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
        return { ok: false, status: 409, erro: 'Este e-mail já está cadastrado.' };
      }

      const novoUsuario = {
        id_usuario: Date.now(),
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.replace(/\D/g, ''),
        senha,
        foto_perfil: fotoUri || null,
        tipo_usuario: 'usuario',
        data_cadastro: new Date().toISOString(),
      };

      localUsers.push(novoUsuario);
      await AsyncStorage.setItem('@peludinhos:usuarios_locais', JSON.stringify(localUsers));
      await AsyncStorage.setItem(
        `@peludinhos:boas_vindas_pendente:${email.trim().toLowerCase()}`,
        'true'
      );
      return { ok: true, usuario: novoUsuario, modoLocal: true };
    }
  }

  async function carregarPerfil() {
    if (token === 'local-jwt-token' && usuario) {
      return { ok: true, usuario };
    }

    try {
      const resposta = await fetchAutenticado('/usuarios/me');
      if (resposta.status === 404) {
        await sair();
        return { ok: false, erro: 'Usuário não encontrado.' };
      }
      if (!resposta.ok) {
        throw new Error('Erro ' + resposta.status);
      }
      const dados = await resposta.json();
      setUsuario(dados.usuario);
      await AsyncStorage.setItem('@peludinhos:usuario', JSON.stringify(dados.usuario));
      return { ok: true, usuario: dados.usuario };
    } catch (erro) {
      if (usuario) {
        return { ok: true, usuario };
      }
      return { ok: false, erro: 'Não foi possível carregar seu perfil.' };
    }
  }

  async function atualizarPerfil({ nome, telefone, novaFotoUri, removerFotoAtual }) {
    if (token === 'local-jwt-token') {
      const atualizado = {
        ...usuario,
        nome: nome.trim(),
        telefone: telefone.replace(/\D/g, ''),
        foto_perfil: removerFotoAtual ? null : novaFotoUri !== undefined ? novaFotoUri : usuario?.foto_perfil,
      };
      setUsuario(atualizado);
      await AsyncStorage.setItem('@peludinhos:usuario', JSON.stringify(atualizado));
      return { ok: true, usuario: atualizado };
    }

    try {
      const resposta = await fetchAutenticado('/usuarios/me', {
        method: 'PATCH',
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefone.replace(/\D/g, ''),
        }),
      });

      const dados = await resposta.json();
      if (!resposta.ok) {
        return { ok: false, erro: dados.erro || 'Não foi possível salvar as alterações.' };
      }

      let usuarioFinal = dados.usuario;

      if (removerFotoAtual) {
        const respDel = await fetchAutenticado('/usuarios/me/foto', { method: 'DELETE' });
        if (respDel.ok) {
          const dadosDel = await respDel.json();
          usuarioFinal = dadosDel.usuario;
        }
      } else if (novaFotoUri) {
        const imgResponse = await fetch(novaFotoUri);
        const blob = await imgResponse.blob();
        const respFoto = await fetchAutenticado('/usuarios/me/foto', {
          method: 'PUT',
          headers: { 'Content-Type': blob.type || 'image/jpeg' },
          body: blob,
        });
        if (respFoto.ok) {
          const dadosFoto = await respFoto.json();
          usuarioFinal = dadosFoto.usuario;
        }
      }

      setUsuario(usuarioFinal);
      await AsyncStorage.setItem('@peludinhos:usuario', JSON.stringify(usuarioFinal));
      return { ok: true, usuario: usuarioFinal };
    } catch (erro) {
      return { ok: false, erro: 'Não foi possível conectar ao servidor. Tente novamente.' };
    }
  }

  async function alterarSenha(senhaAtual, novaSenha) {
    if (token === 'local-jwt-token') {
      return { ok: true };
    }

    try {
      const resposta = await fetchAutenticado('/usuarios/me/senha', {
        method: 'PATCH',
        body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha }),
      });

      const dados = await resposta.json();
      if (!resposta.ok) {
        return { ok: false, erro: dados.erro || 'Não foi possível alterar a senha.' };
      }
      return { ok: true };
    } catch (erro) {
      return { ok: false, erro: 'Não foi possível conectar ao servidor. Tente novamente.' };
    }
  }

  async function concluirBoasVindas() {
    setMostrarBoasVindas(false);
    if (usuario?.email) {
      await AsyncStorage.removeItem(
        `@peludinhos:boas_vindas_pendente:${usuario.email.toLowerCase()}`
      );
    }
  }

  async function sair() {
    await AsyncStorage.removeItem('@peludinhos:token');
    await AsyncStorage.removeItem('@peludinhos:usuario');
    setToken(null);
    setUsuario(null);
    setMostrarBoasVindas(false);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        carregandoSessao,
        mostrarBoasVindas,
        concluirBoasVindas,
        baseUrl,
        alterarBaseUrl,
        resolverUrlFoto,
        login,
        loginDemonstracao,
        cadastrar,
        carregarPerfil,
        atualizarPerfil,
        alterarSenha,
        sair,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
