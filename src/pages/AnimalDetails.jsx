import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

export default function AnimalDetails() { return <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
<div className={"w-full sm:max-w-sm mx-auto min-h-screen flex flex-col font-sans bg-surface relative sm:shadow-2xl bg-white"}>
<header className={"bg-brand-teal text-white z-20 relative pt-2 pb-4 px-4 flex items-center justify-between"}>
<Link to={"/animais"} aria-label={"Voltar"} className={"text-2xl p-1"}>
<i className={"ri-arrow-left-line"}></i>
</Link>
<div className={"flex items-center gap-2 absolute left-1/2 -translate-x-1/2"}>
<img src={"/assets/icons/peludinhos.svg"} alt={"Logo"} className={"h-6 w-auto brightness-0 invert"} />
<h1 className={"text-xl font-bold tracking-tight"}>{"Peludinhos"}</h1>
</div>
<button aria-label={"Mais opções"} className={"text-2xl p-1"}>
<i className={"ri-more-2-fill"}></i>
</button>
</header>
<main className={"flex-1 w-full relative"}>

<div className={"relative w-full h-80 bg-gray-200"}>
<img src={"/assets/icons/peludinhos.svg"} alt={"Rex"} className={"w-full h-full object-cover"} />
<div className={"absolute bottom-10 right-4 bg-brand-teal text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md"}>
<i className={"ri-shield-check-fill text-sm"}></i>
<span className={"text-sm font-medium"}>{"Chipado"}</span>
</div>
</div>

<div className={"bg-white rounded-t-3xl -mt-6 relative z-10 px-6 pt-6 pb-24 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] w-full min-h-screen"}>
<div className={"flex items-center gap-2 mb-1"}>
<h1 className={"text-2xl font-bold text-gray-900"}>{"Rex"}</h1>
<i className={"ri-verified-badge-fill text-blue-500 text-xl"}></i>
</div>
<p className={"text-gray-600 font-medium text-sm"}>{"Cachorro • Vira-lata"}</p>
<div className={"flex justify-between items-center mt-4 pb-4 border-b border-gray-100"}>
<div className={"flex items-center gap-2 text-gray-500"}>
<i className={"ri-map-pin-line text-lg"}></i>
<span className={"text-sm"}>{"Av. Brasil, 1234 - Centro"}</span>
</div>
<span className={"text-xs text-gray-400"}>{"Visto há 1 hora"}</span>
</div>

<div className={"mt-6"}>
<h2 className={"text-lg font-bold text-gray-900 mb-4"}>{"Saúde"}</h2>
<div className={"flex flex-wrap gap-2"}>
<div className={"px-4 py-2 bg-teal-50 text-teal-800 rounded-full flex items-center gap-2 border border-teal-100"}>
<i className={"ri-checkbox-circle-fill text-teal-700"}></i>
<span className={"text-sm font-medium"}>{"Vacinado"}</span>
</div>
<div className={"px-4 py-2 bg-teal-50 text-teal-800 rounded-full flex items-center gap-2 border border-teal-100"}>
<i className={"ri-checkbox-circle-fill text-teal-700"}></i>
<span className={"text-sm font-medium"}>{"Castrado"}</span>
</div>
<div className={"px-4 py-2 bg-teal-50 text-teal-800 rounded-full flex items-center gap-2 border border-teal-100"}>
<i className={"ri-checkbox-circle-fill text-teal-700"}></i>
<span className={"text-sm font-medium"}>{"Chipado"}</span>
</div>
</div>

<div className={"mt-4 border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm"}>
<div className={"flex items-center gap-4"}>
<div className={"w-12 h-12 bg-teal-50 text-brand-teal rounded-xl flex items-center justify-center"}>
<i className={"ri-id-card-fill text-2xl"}></i>
</div>
<div>
<h3 className={"font-bold text-gray-900 text-sm"}>{"Carteira SinPatinhas"}</h3>
<p className={"text-xs text-gray-500"}>{"ID: SPN-2024-001234"}</p>
</div>
</div>
<a href={"#"} className={"text-brand-teal font-bold text-sm"}>{"Ver anexo"}</a>
</div>
</div>

<div className={"mt-8"}>
<h2 className={"text-lg font-bold text-gray-900 mb-4"}>{"Informações"}</h2>
<div className={"grid grid-cols-2 gap-4"}>
<div>
<p className={"text-xs text-gray-500 mb-1"}>{"Sexo"}</p>
<p className={"font-medium text-gray-900 text-sm"}>{"Macho"}</p>
</div>
<div>
<p className={"text-xs text-gray-500 mb-1"}>{"Idade"}</p>
<p className={"font-medium text-gray-900 text-sm"}>{"2 anos (aprox.)"}</p>
</div>
</div>
</div>
</div>
</main>



</div>
<Navigation /></div>; }
