import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Lock, Map as MapIcon } from 'lucide-react';

// Conserta o path padrão dos ícones do Leaflet no React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Dados mockados para demonstração do cluster
const MOCK_INNOVATION_HUBS = [
  { id: 1, name: 'Inatel - Prédio NGTI', lat: -22.2568, lng: -45.7027, type: 'ICT' },
  { id: 2, name: 'Wireless & AI Lab (WAI Lab)', lat: -22.2575, lng: -45.7032, type: 'Laboratório' },
  { id: 3, name: 'Centro de Radiocomunicações (CRR)', lat: -22.2560, lng: -45.7020, type: 'Pesquisa' },
];

interface ProRadarMapProps {
  isPremium: boolean;
  onUpgradeClick: () => void;
}

export function ProRadarMap({ isPremium, onUpgradeClick }: ProRadarMapProps) {
  // Coordenadas centrais (Santa Rita do Sapucaí - MG)
  const centerPosition: [number, number] = [-22.2568, -45.7027];

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-inner">
      
      {/* Container do Mapa */}
      <div className={`w-full h-full transition-all duration-700 ${!isPremium ? 'blur-md grayscale opacity-40' : ''}`}>
        <MapContainer 
          center={centerPosition} 
          zoom={13} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          
          {MOCK_INNOVATION_HUBS.map((hub) => (
            <Marker key={hub.id} position={[hub.lat, hub.lng]}>
              <Popup className="custom-popup">
                <div className="p-3 bg-slate-900 text-slate-200 border border-slate-700 rounded-lg shadow-xl min-w-[180px]">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{hub.type}</span>
                  <h3 className="text-sm font-bold text-white mt-1">{hub.name}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Polo estratégico com alta densidade de projetos e patentes registradas.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-emerald-400 font-bold">2 Projetos Ativos</span>
                    <button className="text-[10px] text-indigo-400 hover:text-white transition font-bold uppercase">Ver Detalhes</button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Overlay de Paywall (A Isca) */}
      {!isPremium && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-md p-8 text-center animate-in fade-in duration-500">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse" />
            <div className="relative bg-slate-900 p-5 rounded-3xl border border-indigo-500/30 shadow-2xl">
              <MapIcon className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
          
          <div className="space-y-3 max-w-sm">
            <h3 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-3">
              Radar de Inovação <Lock className="w-5 h-5 text-indigo-500" />
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Descubra onde estão os clusters de tecnologia mais promissores e conecte-se com ICTs estrategicamente localizadas.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <button 
              onClick={onUpgradeClick}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all transform hover:scale-105 active:scale-95"
            >
              Assinar Orizon Pro
            </button>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Acesso instantâneo após confirmação</p>
          </div>
        </div>
      )}

      {/* Mini Legend for Premium Users */}
      {isPremium && (
        <div className="absolute bottom-4 left-4 z-[1000] p-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 shadow-2xl text-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-slate-300">Pólos Tecnológicos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300">ICTs Ativas</span>
          </div>
        </div>
      )}
    </div>
  );
}
