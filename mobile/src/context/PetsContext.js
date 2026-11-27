import React, { createContext, useContext, useState } from 'react';

const PetsContext = createContext({});

const ANIMAIS_INICIAIS = [
  {
    id: '1',
    nome: 'Rex',
    especie: 'Cachorro',
    raca: 'Vira-lata (SRD)',
    tempo: 'Visto há 1h',
    dataAvistamento: 'Visto dia 10/10/2026',
    local: 'Centro',
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
    lat: -2.4400,
    lng: -54.7100,
    foto: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    descricao: 'Cachorro dócil de porte médio avistado próximo à praça central.',
  },
  {
    id: '2',
    nome: 'Mel',
    especie: 'Cachorro',
    raca: 'Vira-lata (SRD)',
    tempo: 'Visto há 3h',
    dataAvistamento: 'Visto há 3h',
    local: 'Parque da Cidade',
    endereco: 'Parque da Cidade - Santarém',
    sexo: 'Fêmea',
    idade: '1 ano (aprox.)',
    porte: 'Médio',
    cor: 'Caramelo',
    cadastradoPor: 'Projeto Peludinhos',
    cadastradoLocal: 'UFOPA',
    castrado: false,
    chipado: false,
    vacinado: true,
    sinPatinhasId: null,
    lat: -2.4450,
    lng: -54.7050,
    foto: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    descricao: 'Cachorrinha caramelo amigável vista perto da pista de caminhada.',
  },
  {
    id: '3',
    nome: 'Nina',
    especie: 'Gato',
    raca: 'Siamês',
    tempo: 'Visto há 5h',
    dataAvistamento: 'Visto há 5h',
    local: 'Ufopa',
    endereco: 'Campus Rondon - UFOPA',
    sexo: 'Fêmea',
    idade: '1 ano e meio',
    porte: 'Pequeno',
    cor: 'Rajada',
    cadastradoPor: 'Projeto Peludinhos',
    cadastradoLocal: 'UFOPA',
    castrado: true,
    chipado: true,
    vacinado: true,
    sinPatinhasId: 'SPN-2024-004891',
    lat: -2.4420,
    lng: -54.7150,
    foto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    descricao: 'Gatinha tranquila costumava ficar perto da biblioteca.',
  },
  {
    id: '4',
    nome: 'Thor',
    especie: 'Cachorro',
    raca: 'Vira-lata (SRD)',
    tempo: 'Visto há 1 dia',
    dataAvistamento: 'Visto há 1 dia',
    local: 'Parque da Cidade',
    endereco: 'Av. Bartolomeu de Gusmão - Parque da Cidade',
    sexo: 'Macho',
    idade: '3 anos (aprox.)',
    porte: 'Médio',
    cor: 'Preto e branco',
    cadastradoPor: 'Projeto Peludinhos',
    cadastradoLocal: 'UFOPA',
    castrado: true,
    chipado: false,
    vacinado: true,
    sinPatinhasId: null,
    lat: -2.4465,
    lng: -54.7115,
    foto: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    descricao: 'Animal calmo visto descansando na sombra.',
  },
];

const PERDIDOS_INICIAIS = [
  {
    id: 'p1',
    nome: 'Bidu',
    especie: 'Cachorro',
    vistoEm: 'Bairro Prainha',
    descricao: 'Desapareceu há 2 dias. Usava coleira azul.',
    telefoneContato: '(93) 99123-4567',
    foto: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'p2',
    nome: 'Mia',
    especie: 'Gato',
    vistoEm: 'Centro',
    descricao: 'Fugiu de casa na última chuva.',
    telefoneContato: '(93) 99234-5678',
    foto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
  },
];

export function PetsProvider({ children }) {
  const [animais, setAnimais] = useState(ANIMAIS_INICIAIS);
  const [perdidos, setPerdidos] = useState(PERDIDOS_INICIAIS);

  function adicionarAvistamento(novo) {
    const hoje = new Date().toLocaleDateString('pt-BR');
    const novoAnimal = {
      id: String(Date.now()),
      nome: novo.nome?.trim() || novo.especie || 'Sem nome',
      especie: novo.especie || 'Cachorro',
      raca: novo.raca?.trim() || 'SRD',
      tempo: 'Visto agora',
      dataAvistamento: `Visto dia ${hoje}`,
      local: novo.local?.trim() || 'Santarém',
      endereco: novo.local?.trim() || 'Localização registrada pelo app',
      sexo: novo.sexo || 'Macho',
      idade: novo.idade?.trim() || '1 ano (aprox.)',
      porte: novo.porte || 'Médio',
      cor: novo.cor?.trim() || 'Não informada',
      cadastradoPor: novo.cadastradoPor?.trim() || 'Projeto Peludinhos',
      cadastradoLocal: novo.cadastradoLocal?.trim() || 'UFOPA',
      castrado: Boolean(novo.castrado),
      chipado: Boolean(novo.chipado),
      vacinado: Boolean(novo.vacinado),
      sinPatinhasId: novo.chipado ? `SPN-2026-${Math.floor(100000 + Math.random() * 900000)}` : null,
      lat: typeof novo.lat === 'number' ? novo.lat : -2.4430 + (Math.random() - 0.5) * 0.012,
      lng: typeof novo.lng === 'number' ? novo.lng : -54.7083 + (Math.random() - 0.5) * 0.012,
      foto:
        novo.foto ||
        (novo.especie === 'Gato'
          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
      descricao: novo.descricao?.trim() || '',
    };

    setAnimais((prev) => [novoAnimal, ...prev]);
    return novoAnimal;
  }

  function editarAnimal(id, dados) {
    let atualizado = null;
    setAnimais((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        atualizado = {
          ...item,
          nome: dados.nome?.trim() || dados.especie || item.nome,
          especie: dados.especie || item.especie,
          raca: dados.raca?.trim() || 'SRD',
          local: dados.local?.trim() || item.local,
          endereco: dados.local?.trim() || item.endereco,
          sexo: dados.sexo || item.sexo,
          idade: dados.idade?.trim() || item.idade,
          porte: dados.porte || item.porte,
          cor: dados.cor?.trim() || item.cor,
          cadastradoPor: dados.cadastradoPor?.trim() || item.cadastradoPor,
          cadastradoLocal: dados.cadastradoLocal?.trim() || item.cadastradoLocal,
          castrado: Boolean(dados.castrado),
          vacinado: Boolean(dados.vacinado),
          chipado: Boolean(dados.chipado),
          sinPatinhasId: dados.chipado
            ? item.sinPatinhasId || `SPN-2026-${Math.floor(100000 + Math.random() * 900000)}`
            : null,
          lat: typeof dados.lat === 'number' ? dados.lat : item.lat,
          lng: typeof dados.lng === 'number' ? dados.lng : item.lng,
          foto: dados.foto || item.foto,
          descricao: dados.descricao !== undefined ? dados.descricao.trim() : item.descricao,
        };
        return atualizado;
      })
    );
    return atualizado;
  }

  function removerAnimal(id) {
    setAnimais((prev) => prev.filter((item) => item.id !== id));
  }

  function adicionarPerdido(novo) {
    const novoPerdido = {
      id: 'p' + Date.now(),
      nome: novo.nome?.trim() || 'Animal sem nome',
      especie: novo.especie || 'Cachorro',
      vistoEm: novo.vistoEm?.trim() || 'Centro',
      descricao: novo.descricao?.trim() || 'Desaparecido recentemente.',
      telefoneContato: novo.telefoneContato || '(93) 99111-2222',
      foto:
        novo.foto ||
        (novo.especie === 'Gato'
          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
          : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'),
    };

    setPerdidos((prev) => [novoPerdido, ...prev]);
    return novoPerdido;
  }

  return (
    <PetsContext.Provider
      value={{
        animais,
        perdidos,
        adicionarAvistamento,
        editarAnimal,
        removerAnimal,
        adicionarPerdido,
      }}
    >
      {children}
    </PetsContext.Provider>
  );
}

export function usePets() {
  return useContext(PetsContext);
}
