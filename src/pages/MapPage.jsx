import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import MapCanvas from '../components/MapCanvas';

export default function MapPage() { return <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
<div className={"w-full sm:max-w-sm mx-auto min-h-screen flex flex-col font-sans bg-surface relative sm:shadow-2xl overflow-hidden"}>
<header className={"bg-brand-teal text-white z-20 relative pt-2 pb-4 px-4 rounded-b-3xl shadow-md flex flex-col gap-4"}>
<div className={"flex items-center justify-between"}>
<button aria-label={"Menu"} className={"text-2xl p-1"}>
<i className={"ri-menu-line"}></i>
</button>
<div className={"flex items-center gap-2"}>
<img src={"/assets/icons/peludinhos.svg"} alt={"Logo"} className={"h-6 w-auto brightness-0 invert"} />
<h1 className={"text-xl font-bold tracking-tight"}>{"Peludinhos"}</h1>
</div>
<button aria-label={"Notificações"} className={"text-2xl p-1 relative"}>
<i className={"ri-notification-3-line"}></i>
</button>
</div>
<div className={"flex items-center gap-3"}>
<div className={"relative flex-1"}>
<input className={"w-full pl-4 pr-10 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none border-none shadow-sm text-sm"} placeholder={"Buscar animais ou locais"} type={"text"} />
<i className={"ri-search-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"}></i>
</div>
<button aria-label={"Filtrar"} className={"bg-white p-3 rounded-xl text-gray-600 shadow-sm"}>
<i className={"ri-list-settings-line text-lg"}></i>
</button>
</div>
</header>
<main className={"flex-1 relative z-10 -mt-8 h-full min-h-[400px]"}>
<MapCanvas />

<div className={"absolute bottom-[275px] left-1/2 -translate-x-1/2 z-30 w-full px-8"}>
<Link to={"/novo-avistamento"} className={"bg-brand-teal text-white w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg text-lg hover:bg-teal-800 transition-colors"}>
<i className={"ri-add-line text-2xl"}></i>{"\n                Novo avistamento\n            "}</Link>
</div>

<div className={"absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-20 pb-20 pt-6 px-6 h-64 overflow-y-auto"}>
<div className={"flex justify-between items-center mb-4"}>
<h2 className={"text-lg font-bold text-gray-800"}>{"Avistamentos recentes"}</h2>
<Link to={"/animais"} className={"text-teal-700 text-sm font-semibold"}>{"Ver todos"}</Link>
</div>
<div className={"flex flex-col gap-4"}>

<Link to={"/detalhes-animal"} className={"border border-gray-100 rounded-2xl p-3 flex items-center justify-between shadow-sm"}>
<div className={"flex items-center gap-4"}>
<img src={"/assets/icons/peludinhos.svg"} alt={"Cachorro"} className={"w-16 h-16 rounded-xl object-cover"} />
<div>
<h3 className={"font-bold text-gray-800"}>{"Cachorro"}</h3>
<p className={"text-xs text-gray-500 mt-1"}>{"Visto há 2h • Bairro Aeroporto"}</p>
<span className={"inline-block mt-2 px-2 py-0.5 rounded border border-teal-600 text-teal-700 text-[10px] font-medium"}>{"Castrado"}</span>
</div>
</div>
<i className={"ri-arrow-right-s-line text-gray-400 text-xl"}></i>
</Link>

<Link to={"/detalhes-animal"} className={"border border-gray-100 rounded-2xl p-3 flex items-center justify-between shadow-sm"}>
<div className={"flex items-center gap-4"}>
<img src={"/assets/icons/peludinhos.svg"} alt={"Gato"} className={"w-16 h-16 rounded-xl object-cover"} />
<div>
<h3 className={"font-bold text-gray-800"}>{"Gato"}</h3>
<p className={"text-xs text-gray-500 mt-1"}>{"Visto há 4h • Av. Brasil"}</p>
<span className={"inline-block mt-2 px-2 py-0.5 rounded border border-orange-400 text-orange-500 text-[10px] font-medium"}>{"Não castrado"}</span>
</div>
</div>
<i className={"ri-arrow-right-s-line text-gray-400 text-xl"}></i>
</Link>
</div>
</div>
</main>



</div>


<Navigation /></div>; }
