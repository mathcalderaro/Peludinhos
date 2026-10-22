import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapCanvas() {
  const element = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const map = L.map(element.current, { zoomControl: false }).setView([-2.443, -54.7083], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    const icon = L.divIcon({ html: '<img src="/assets/icons/peludinhos.svg" alt="" style="width:32px;height:32px;background:white;border-radius:50%;padding:5px">', className: '', iconSize: [32, 32] });
    for (const [lat, lng, name] of [[-2.44, -54.71, 'Rex'], [-2.445, -54.705, 'Mel'], [-2.442, -54.715, 'Nina']]) {
      const content = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = name;
      const button = document.createElement('button');
      button.textContent = 'Ver detalhes';
      button.className = 'block text-teal-700 mt-2';
      button.onclick = () => navigate('/detalhes-animal');
      content.append(title, button);
      L.marker([lat, lng], { icon }).addTo(map).bindPopup(content);
    }
    const resize = new ResizeObserver(() => map.invalidateSize());
    resize.observe(element.current);
    return () => { resize.disconnect(); map.remove(); };
  }, [navigate]);
  return <div ref={element} id="map" className="absolute inset-0" />;
}
