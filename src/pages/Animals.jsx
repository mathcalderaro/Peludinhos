import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

export default function Animals() { return <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
<div className={"w-full sm:max-w-sm mx-auto min-h-screen flex flex-col font-sans bg-surface relative sm:shadow-2xl"}>
<header className={"bg-brand-teal text-white z-20 relative pt-2 pb-6 px-4 rounded-b-[2rem] shadow-md flex flex-col gap-4"}>
<div className={"flex items-center justify-between"}>
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
<main className={"flex-1 overflow-y-auto z-10 px-4 pt-6 pb-24"}>
<div className={"flex gap-2 overflow-x-auto pb-4 no-scrollbar"}>
<button className={"px-5 py-2 rounded-full bg-brand-teal text-white text-sm font-medium whitespace-nowrap"}>{"Todos"}</button>
<button className={"px-5 py-2 rounded-full bg-white text-gray-600 text-sm font-medium whitespace-nowrap shadow-sm"}>{"Cachorros"}</button>
<button className={"px-5 py-2 rounded-full bg-white text-gray-600 text-sm font-medium whitespace-nowrap shadow-sm"}>{"Gatos"}</button>
<button className={"px-5 py-2 rounded-full bg-white text-gray-600 text-sm font-medium whitespace-nowrap shadow-sm"}>{"Chipados"}</button>
</div>
<div className={"flex flex-col gap-4 mt-2"}>

<Link to={"/detalhes-animal"} className={"bg-white rounded-2xl p-3 shadow-sm flex items-center gap-4 relative overflow-hidden"}>
<img src={"/assets/icons/peludinhos.svg"} alt={"Rex"} className={"w-20 h-20 rounded-xl object-cover"} />
<div className={"flex-1 relative z-10"}>
<div className={"flex justify-between items-start"}>
<div>
<h2 className={"text-lg font-bold text-gray-800"}>{"Rex"}</h2>
<p className={"text-xs text-gray-500 mt-1"}>{"Visto há 1h • Centro"}</p>
</div>
<button className={"text-gray-400 p-1"}><i className={"ri-more-2-fill text-xl"}></i></button>
</div>
<div className={"flex gap-2 mt-3"}>
<span className={"px-3 py-1 rounded-full border border-teal-600 text-teal-700 text-xs font-medium"}>{"Castrado"}</span>
<span className={"px-3 py-1 rounded-full border border-teal-600 text-teal-700 text-xs font-medium"}>{"Chipado"}</span>
</div>
</div>
<div className={"text-brand-orange opacity-20 absolute right-4 bottom-4 pointer-events-none z-0"}>
<i className={"ri-bear-smile-fill text-4xl"}></i>
</div>
</Link>

<Link to={"/detalhes-animal"} className={"bg-white rounded-2xl p-3 shadow-sm flex items-center gap-4 relative overflow-hidden"}>
<img src={"/assets/icons/peludinhos.svg"} alt={"Mel"} className={"w-20 h-20 rounded-xl object-cover"} />
<div className={"flex-1 relative z-10"}>
<div className={"flex justify-between items-start"}>
<div>
<h2 className={"text-lg font-bold text-gray-800"}>{"Mel"}</h2>
<p className={"text-xs text-gray-500 mt-1"}>{"Visto há 3h • Parque da Cidade"}</p>
</div>
<button className={"text-gray-400 p-1"}><i className={"ri-more-2-fill text-xl"}></i></button>
</div>
<div className={"flex gap-2 mt-3"}>
<span className={"px-3 py-1 rounded-full border border-orange-400 text-orange-500 text-xs font-medium"}>{"Não castrado"}</span>
</div>
</div>
<div className={"text-brand-orange opacity-20 absolute right-4 bottom-4 pointer-events-none z-0"}>
<i className={"ri-bear-smile-fill text-4xl"}></i>
</div>
</Link>

<Link to={"/detalhes-animal"} className={"bg-white rounded-2xl p-3 shadow-sm flex items-center gap-4 relative overflow-hidden"}>
<img src={"/assets/icons/peludinhos.svg"} alt={"Nina"} className={"w-20 h-20 rounded-xl object-cover"} />
<div className={"flex-1 relative z-10"}>
<div className={"flex justify-between items-start"}>
<div>
<h2 className={"text-lg font-bold text-gray-800"}>{"Nina"}</h2>
<p className={"text-xs text-gray-500 mt-1"}>{"Visto há 5h • Ufopa"}</p>
</div>
<button className={"text-gray-400 p-1"}><i className={"ri-more-2-fill text-xl"}></i></button>
</div>
<div className={"flex gap-2 mt-3"}>
<span className={"px-3 py-1 rounded-full border border-teal-600 text-teal-700 text-xs font-medium"}>{"Vacinada"}</span>
<span className={"px-3 py-1 rounded-full border border-teal-600 text-teal-700 text-xs font-medium"}>{"Chipado"}</span>
</div>
</div>
<div className={"text-brand-orange opacity-20 absolute right-4 bottom-2 pointer-events-none z-0"}>
<i className={"ri-bear-smile-fill text-4xl"}></i>
</div>
</Link>

<Link to={"/detalhes-animal"} className={"bg-white rounded-2xl p-3 shadow-sm flex items-center gap-4 relative overflow-hidden"}>
<img src={"/assets/icons/peludinhos.svg"} alt={"Thor"} className={"w-20 h-20 rounded-xl object-cover"} />
<div className={"flex-1 relative z-10"}>
<div className={"flex justify-between items-start"}>
<div>
<h2 className={"text-lg font-bold text-gray-800"}>{"Thor"}</h2>
<p className={"text-xs text-gray-500 mt-1"}>{"Visto há 1 dia • Parque da Cidade"}</p>
</div>
<button className={"text-gray-400 p-1"}><i className={"ri-more-2-fill text-xl"}></i></button>
</div>
<div className={"flex gap-2 mt-3"}>
<span className={"px-3 py-1 rounded-full border border-teal-600 text-teal-700 text-xs font-medium"}>{"Castrado"}</span>
</div>
</div>
<div className={"text-brand-orange opacity-10 absolute right-4 bottom-2 pointer-events-none z-0"}>
<i className={"ri-bear-smile-fill text-4xl"}></i>
</div>
</Link>
</div>
</main>

<div className={"fixed bottom-28 left-0 right-0 mx-auto w-full sm:max-w-sm pointer-events-none z-40"}>
<Link to={"/novo-avistamento"} className={"absolute right-4 w-14 h-14 bg-brand-teal hover:bg-teal-800 text-white rounded-full shadow-lg flex items-center justify-center transition-colors pointer-events-auto"}>
<i className={"ri-add-line text-2xl"}></i>
</Link>
</div>


</div>
<Navigation /></div>; }
