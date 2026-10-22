import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

export default function NewSighting() { return <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
<div className={"w-full sm:max-w-sm mx-auto min-h-screen flex flex-col font-sans bg-surface relative sm:shadow-2xl"}>
<header className={"bg-brand-teal text-white z-20 relative pt-2 pb-6 px-4 rounded-b-[2rem] shadow-md flex items-center justify-between"}>
<Link to={"/mapa"} aria-label={"Voltar"} className={"text-2xl p-1"}>
<i className={"ri-arrow-left-line"}></i>
</Link>
<div className={"flex items-center gap-2 absolute left-1/2 -translate-x-1/2"}>
<img src={"/assets/icons/peludinhos.svg"} alt={"Logo"} className={"h-6 w-auto brightness-0 invert"} />
<h1 className={"text-xl font-bold tracking-tight"}>{"Peludinhos"}</h1>
</div>
<div className={"w-8"}></div>
</header>
<main className={"flex-1 overflow-y-auto z-10 px-6 pt-6 pb-24 flex flex-col gap-6"}>

<div className={"flex justify-between items-start relative px-2"}>
<div className={"absolute top-5 left-8 right-8 h-[1px] bg-gray-200 z-0"}></div>
<div className={"flex flex-col items-center gap-2 z-10 relative bg-surface"}>
<div className={"w-12 h-12 rounded-full bg-brand-teal text-white flex items-center justify-center border-2 border-surface shadow-sm"}>
<i className={"ri-camera-fill text-xl"}></i>
</div>
<span className={"text-xs font-bold text-brand-teal"}>{"Foto"}</span>
</div>
<div className={"flex flex-col items-center gap-2 z-10 relative bg-surface"}>
<div className={"w-12 h-12 rounded-full bg-white text-gray-400 border border-gray-200 flex items-center justify-center shadow-sm"}>
<i className={"ri-file-text-line text-xl"}></i>
</div>
<span className={"text-xs font-medium text-gray-500"}>{"Informações"}</span>
</div>
<div className={"flex flex-col items-center gap-2 z-10 relative bg-surface"}>
<div className={"w-12 h-12 rounded-full bg-white text-gray-400 border border-gray-200 flex items-center justify-center shadow-sm"}>
<i className={"ri-heart-line text-xl"}></i>
</div>
<span className={"text-xs font-medium text-gray-500"}>{"Saúde"}</span>
</div>
<div className={"flex flex-col items-center gap-2 z-10 relative bg-surface"}>
<div className={"w-12 h-12 rounded-full bg-white text-gray-400 border border-gray-200 flex items-center justify-center shadow-sm"}>
<i className={"ri-map-pin-line text-xl"}></i>
</div>
<span className={"text-xs font-medium text-gray-500"}>{"Localização"}</span>
</div>
</div>

<div className={"w-full h-36 border-2 border-dashed border-[#d8c7b8] rounded-2xl flex flex-col items-center justify-center gap-2 bg-[#fdfaf5] mt-2 cursor-pointer"}>
<div className={"w-12 h-12 rounded-full bg-brand-teal text-white flex items-center justify-center shadow-sm"}>
<i className={"ri-camera-fill text-xl"}></i>
</div>
<span className={"text-sm font-bold text-gray-800 w-32 text-center leading-tight"}>{"Adicionar foto do animal"}</span>
</div>
<form className={"flex flex-col gap-4"}>

<div>
<label className={"block text-sm font-bold text-gray-800 mb-2"}>{"Nome (opcional)"}</label>
<input type={"text"} placeholder={"Como podemos identificar?"} className={"w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-teal text-sm placeholder-gray-400 bg-white shadow-sm"} />
</div>

<div>
<label className={"block text-sm font-bold text-gray-800 mb-2"}>{"Espécie"}</label>
<div className={"flex rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white p-1 gap-1"}>
<button type={"button"} className={"flex-1 py-2 text-center rounded-lg bg-brand-teal text-white text-sm font-bold"}>{"Cachorro"}</button>
<button type={"button"} className={"flex-1 py-2 text-center rounded-lg bg-transparent text-gray-600 text-sm font-medium"}>{"Gato"}</button>
</div>
</div>

<div>
<label className={"block text-sm font-bold text-gray-800 mb-2"}>{"Raça (opcional)"}</label>
<input type={"text"} placeholder={"Ex: Vira-lata, SRD..."} className={"w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-teal text-sm placeholder-gray-400 bg-white shadow-sm"} />
</div>

<div>
<label className={"block text-sm font-bold text-gray-800 mb-2"}>{"Descrição"}</label>
<div className={"relative"}>
<textarea rows={"4"} placeholder={"Características marcantes, cor, comportamento, etc."} className={"w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-teal text-sm placeholder-gray-400 bg-white shadow-sm resize-none"}></textarea>
<span className={"absolute bottom-3 right-3 text-xs text-gray-400"}>{"0/300"}</span>
</div>
</div>

<button type={"button"} className={"w-full bg-brand-orange hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-md transition duration-150 mt-4 text-lg"}>{"\n                Próximo\n            "}</button>
</form>
</main>



</div>
<Navigation /></div>; }
