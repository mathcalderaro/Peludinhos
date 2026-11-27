import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { MainHeader } from '../components/Header';
import { usePets } from '../context/PetsContext';

const PELUDINHOS_PIN_SVG = `<svg width="26" height="36" viewBox="0 0 190 284" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M94.0897 56.6395C94.8035 56.6397 127.641 54.6591 151.435 83.8651C171.423 108.398 173.164 133.679 169.043 147.723C165.802 158.764 122.066 242.853 103.511 278.309C99.9893 285.038 90.4402 285.11 86.8192 278.434C69.0341 245.647 28.9497 171.376 23.4198 157.87C16.2814 140.435 19.2416 108.368 30.5585 92.2802C56.6714 55.1586 93.2238 56.6391 94.0897 56.6395ZM96.0204 81.7723C81.0648 80.6169 72.7428 93.6853 72.7098 93.7372C72.7098 93.7372 68.666 101.457 64.8602 105.316C61.0544 109.176 52.0155 115.931 52.0155 115.931C51.9676 115.966 37.8972 126.378 47.7343 141.598C57.5878 156.843 78.1797 148.932 81.035 146.808C83.8893 144.686 86.0305 142.562 94.5936 142.562C103.156 142.562 103.632 144.492 107.676 146.615C111.719 148.738 126.467 157.422 138.599 144.878C150.728 132.335 141.691 120.177 139.788 118.054C137.885 115.931 131.462 112.264 125.991 107.054C120.52 101.843 116.476 93.7372 116.476 93.7372C116.439 93.6629 110.954 82.9262 96.0204 81.7723Z" fill="#1B898B"/><ellipse cx="23.1963" cy="56.8209" rx="17.793" ry="25.8668" transform="rotate(-13.1098 23.1963 56.8209)" fill="#1B898B"/><ellipse cx="67.0179" cy="27.5832" rx="17.793" ry="25.8668" transform="rotate(-5.99382 67.0179 27.5832)" fill="#1B898B"/><ellipse cx="125.392" cy="28.7435" rx="17.793" ry="25.8668" transform="rotate(6.80294 125.392 28.7435)" fill="#1B898B"/><ellipse cx="169.03" cy="58.1065" rx="17.793" ry="24.7748" transform="rotate(6.80294 169.03 58.1065)" fill="#1B898B"/></svg>`;

export default function MapaScreen({ navigation }) {
  const { animais } = usePets();
  const [busca, setBusca] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('Todos');
  const [filtroSaude, setFiltroSaude] = useState('Todos');
  const [modalFiltroVisivel, setModalFiltroVisivel] = useState(false);

  const animaisFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return animais.filter((a) => {
      const matchEspecie =
        filtroEspecie === 'Todos' ||
        (filtroEspecie === 'Cachorros' && a.especie === 'Cachorro') ||
        (filtroEspecie === 'Gatos' && a.especie === 'Gato');

      const matchSaude =
        filtroSaude === 'Todos' ||
        (filtroSaude === 'Castrado' && a.castrado) ||
        (filtroSaude === 'Chipado' && a.chipado);

      const matchBusca =
        !termo ||
        a.nome.toLowerCase().includes(termo) ||
        a.local.toLowerCase().includes(termo) ||
        a.especie.toLowerCase().includes(termo);

      return matchEspecie && matchSaude && matchBusca;
    });
  }, [animais, busca, filtroEspecie, filtroSaude]);

  const leafletHtml = useMemo(() => {
    const markersJson = JSON.stringify(animaisFiltrados);
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; font-family: sans-serif; }
          .leaflet-popup-content-wrapper { border-radius: 16px; padding: 4px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
          .leaflet-popup-content { margin: 10px 12px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([-2.4430, -54.7083], 14);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

          const pawIcon = L.divIcon({
            html: '<div style="background-color: white; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.22); border: 2px solid #1B898B;">${PELUDINHOS_PIN_SVG}</div>',
            className: '',
            iconSize: [44, 44],
            iconAnchor: [22, 22],
            popupAnchor: [0, -22]
          });

          const sightings = ${markersJson};

          sightings.forEach(s => {
            const marker = L.marker([s.lat, s.lng], { icon: pawIcon }).addTo(map);
            const popupHtml = \`
              <div style="text-align: center; min-width: 130px;">
                <img src="\${s.foto}" style="width: 58px; height: 58px; border-radius: 50%; object-fit: cover; margin: 0 auto 8px auto; display: block;" />
                <h3 style="margin: 0; font-size: 15px; font-weight: bold; color: #1f2937;">\${s.nome}</h3>
                <p style="margin: 4px 0 10px 0; font-size: 11px; color: #6b7280;">\${s.tempo} • \${s.local}</p>
                <button onclick="verDetalhes('\${s.id}')" style="width: 100%; border: none; background-color: #1a8d8d; color: white; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer;">
                  Ver Detalhes
                </button>
              </div>
            \`;

            marker.bindPopup(popupHtml, { offset: [0, -10], closeButton: false });
            marker.on('click', function(e) {
              map.flyTo(e.latlng, 16, { animate: true, duration: 0.5 });
            });
          });

          function verDetalhes(id) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'OPEN_ANIMAL', id }));
            }
          }
        </script>
      </body>
      </html>
    `;
  }, [animaisFiltrados]);

  function handleWebViewMessage(event) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'OPEN_ANIMAL') {
        const animal = animais.find((a) => a.id === data.id);
        if (animal) {
          navigation.navigate('DetalhesAnimal', { animal });
        }
      }
    } catch (e) {
      // ignora
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <MainHeader
        searchValue={busca}
        onSearchChange={setBusca}
        showMenuButton={false}
        onFilterPress={() => setModalFiltroVisivel(true)}
      />

      <View style={styles.mapWrapper}>
        {Platform.OS === 'web' ? (
          <iframe
            title="Mapa Peludinhos"
            srcDoc={leafletHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html: leafletHtml }}
            style={styles.webview}
            onMessage={handleWebViewMessage}
          />
        )}

        <View style={styles.actionButtonWrapper}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('NovoAvistamento')}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Novo avistamento</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Avistamentos recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Animais')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetList}
          >
            {animaisFiltrados.slice(0, 4).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.sightingCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('DetalhesAnimal', { animal: item })}
              >
                <View style={styles.sightingLeft}>
                  <Image source={{ uri: item.foto }} style={styles.sightingImage} />
                  <View>
                    <Text style={styles.sightingName}>{item.nome} ({item.especie})</Text>
                    <Text style={styles.sightingMeta}>
                      {item.tempo} • {item.local}
                    </Text>
                    <View style={[styles.sightingBadge, styles.badgeTeal]}>
                      <Text style={[styles.sightingBadgeText, styles.badgeTealText]}>
                        {item.castrado ? 'Castrado' : 'Não castrado'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Modal de Filtros do Mapa */}
      <Modal
        visible={modalFiltroVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalFiltroVisivel(false)}
      >
        <View style={styles.filterModalBackdrop}>
          <View style={styles.filterModalCard}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filtrar Mapa</Text>
              <TouchableOpacity onPress={() => setModalFiltroVisivel(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray500} />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterGroupLabel}>Espécie</Text>
            <View style={styles.filterChipsWrap}>
              {['Todos', 'Cachorros', 'Gatos'].map((esp) => {
                const ativo = filtroEspecie === esp;
                return (
                  <TouchableOpacity
                    key={esp}
                    style={[styles.filterChip, ativo && styles.filterChipActive]}
                    onPress={() => setFiltroEspecie(esp)}
                  >
                    <Text style={[styles.filterChipText, ativo && styles.filterChipTextActive]}>
                      {esp}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.filterGroupLabel}>Saúde</Text>
            <View style={styles.filterChipsWrap}>
              {['Todos', 'Castrado', 'Chipado'].map((saude) => {
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
                  setFiltroEspecie('Todos');
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
                <Text style={styles.filterApplyText}>Aplicar</Text>
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
  mapWrapper: {
    flex: 1,
    marginTop: -20,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  actionButtonWrapper: {
    position: 'absolute',
    bottom: 242,
    left: 28,
    right: 28,
    zIndex: 30,
  },
  actionButton: {
    backgroundColor: COLORS.brandTeal,
    paddingVertical: 14,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 228,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 10,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.brandTeal,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.teal700,
  },
  sheetList: {
    gap: 10,
    paddingBottom: 14,
  },
  sightingCard: {
    borderWidth: 1,
    borderColor: COLORS.gray100,
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
  },
  sightingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sightingImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.gray200,
  },
  sightingName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  sightingMeta: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },
  sightingBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeTeal: {
    borderColor: COLORS.teal700,
  },
  badgeTealText: {
    color: COLORS.teal700,
  },
  badgeOrange: {
    borderColor: COLORS.orange400,
  },
  badgeOrangeText: {
    color: COLORS.orange500,
  },
  sightingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
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
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
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
