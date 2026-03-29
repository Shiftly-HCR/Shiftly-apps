"use client";

import { useState } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
});

type SectorType =
  | "hotellerie"
  | "restauration"
  | "cafes-bistrots"
  | "traiteurs-evenementiel"
  | "bien-etre-spa"
  | "groupes-multi-sites";

export default function SecteurHero() {
  const [activeSector, setActiveSector] = useState<SectorType>("hotellerie");

  const sectors = [
    {
      id: "hotellerie" as SectorType,
      icon: "🏨",
      label: "Hôtellerie",
    },
    {
      id: "restauration" as SectorType,
      icon: "🍽️",
      label: "Restauration",
    },
    {
      id: "cafes-bistrots" as SectorType,
      icon: "☕",
      label: "Cafés & Bistrots",
    },
    {
      id: "traiteurs-evenementiel" as SectorType,
      icon: "🎪",
      label: "Traiteurs & Événementiel",
    },
    {
      id: "bien-etre-spa" as SectorType,
      icon: "🌿",
      label: "Bien-être & Spa",
    },
    {
      id: "groupes-multi-sites" as SectorType,
      icon: "🏢",
      label: "Groupes & Multi-sites",
    },
  ];

  const sectorContent: Record<
    SectorType,
    {
      title: string;
      subtitle: string;
      description: string;
      profiles: Array<{ icon: string; title: string; description: string }>;
      tags: string[];
      stats: { rating: string; label: string };
      cardStats?: Array<{ value: string; label: string }>;
      missions: Array<{ title: string; location: string; status: string; statusColor: string }>;
      ctaButton: string;
      bottomCard: { value: string; label: string };
    }
  > = {
    hotellerie: {
      title: "La qualité de service commence par",
      subtitle: "les bonnes équipes.",
      description:
        "Dans un hôtel, chaque interaction client est un moment de vérité. La réception à l'arrivée, la chambre au réveil, le service du petit-déjeuner — tout repose sur des équipes stables, formées et disponibles. Shiftly vous donne accès aux profils HCR qualifiés dont vous avez besoin, dans les délais que votre exploitation impose.",
      profiles: [
        {
          icon: "👥",
          title: "Réceptionnistes, chefs de réception, night auditors",
          description:
            "des profils maîtrisant les standards d'accueil, les PMS courants et la gestion des situations imprévues.",
        },
        {
          icon: "🛏️",
          title: "Équipes housekeeping et gouvernantes",
          description:
            "disponibles pour les renforts ponctuels comme pour les remplacements durables, avec une connaissance des exigences de propreté et de présentation.",
        },
        {
          icon: "🔍",
          title: "Service F&B, room service, petit-déjeuner",
          description:
            "des profils opérationnels qui comprennent les rythmes spécifiques à l'hôtellerie et ses standards de service.",
        },
        {
          icon: "⚡",
          title: "Réactivité adaptée aux imprévus",
          description:
            "absence de dernière minute, pic de remplissage, ouverture de saison : nous répondons en moins de 48h.",
        },
      ],
      tags: [
        "Réception",
        "Night audit",
        "Housekeeping",
        "Gouvernante",
        "F&B hôtel",
        "Petit-déjeuner",
        "Concierge",
        "Bagagiste",
      ],
      stats: {
        rating: "4.9/5",
        label: "Satisfaction profils hôtellerie",
      },
      cardStats: [
        { value: "18", label: "Missions / an" },
        { value: "98%", label: "Honoration" },
        { value: "36h", label: "Délai moyen" },
      ],
      missions: [
        {
          title: "Hôtel Indépendant 4★",
          location: "Direction — Paris 8e",
          status: "Suivi actif en cours",
          statusColor: "text-emerald-400",
        },
        {
          title: "Réceptionniste nuit",
          location: "Pourvu en 24h",
          status: "",
          statusColor: "",
        },
        {
          title: "Gouvernante de chambre",
          location: "Pourvu en 48h",
          status: "",
          statusColor: "",
        },
        {
          title: "Chef de réception",
          location: "Pourvu en 72h",
          status: "",
          statusColor: "",
        },
      ],
      ctaButton: "Trouver des profils hôtellerie",
      bottomCard: { value: "+350", label: "Hôtels accompagnés" },
    },
    restauration: {
      title: "Du coup de feu du midi à",
      subtitle: "la brigade complète.",
      description:
        "En restauration, une équipe incomplète se voit immédiatement — dans les assiettes, dans le service, dans l'ambiance. Shiftly vous connecte à des profils de salle et de cuisine qui connaissent le rythme d'un service, les exigences d'un chef et les standards d'une maison.",
      profiles: [
        {
          icon: "👨‍🍳",
          title: "Brigade de cuisine complète",
          description:
            "chef de partie, commis, plongeur, pâtissier. Des profils qui s'intègrent immédiatement au rythme de votre cuisine, avec ou sans briefing prolongé.",
        },
        {
          icon: "🍷",
          title: "Service en salle et bar",
          description:
            "serveurs, chefs de rang, sommeliers, barmans. Des profils à l'aise sur le floor, capables de porter votre style de service.",
        },
        {
          icon: "🔥",
          title: "Réactivité au coup de feu",
          description:
            "un renfort de dernière minute, un absent non anticipé : Shiftly vous donne une réponse opérationnelle, pas une liste de profils à trier.",
        },
        {
          icon: "⭐",
          title: "Profils évalués au standard Accor",
          description:
            "via notre partenariat avec Tami, chaque profil est pré-sélectionné selon une méthode d'évaluation validée à 100% de satisfaction.",
        },
      ],
      tags: [
        "Chef de partie",
        "Commis de cuisine",
        "Plongeur",
        "Chef de rang",
        "Serveur",
        "Sommelier",
        "Barman",
        "Maître d'hôtel",
      ],
      stats: { rating: "2 min", label: "Publication" },
      cardStats: [
        { value: "32", label: "Missions / an" },
        { value: "5★", label: "Satisfaction" },
      ],
      missions: [
        {
          title: "Brasserie Gastronomique",
          location: "Chef propriétaire — Lyon 2e",
          status: "Partenaire actif depuis 2 saisons",
          statusColor: "text-[#782478]",
        },
        {
          title: "Chef de partie saucier",
          location: "Pourvu en 36h",
          status: "",
          statusColor: "",
        },
        {
          title: "Chef de rang senior",
          location: "Pourvu en 24h",
          status: "",
          statusColor: "",
        },
      ],
      ctaButton: "Trouver des profils restauration",
      bottomCard: { value: "73%", label: "Établissements en tension de recrutement" },
    },
    "cafes-bistrots": {
      title: "Un format plus petit.",
      subtitle: "Pas moins d'exigence.",
      description:
        "Un café qui tourne, c'est une machine bien huilée. Un serveur absent le mardi matin peut dérégler une journée entière. Shiftly propose un accès au même niveau de qualité et de réactivité pour les établissements plus petits — avec un tarif accessible et un interlocuteur local qui connaît votre quartier.",
      profiles: [
        {
          icon: "☕",
          title: "Baristas, serveurs polyvalents, gérants de salle",
          description:
            "des profils à l'aise dans les formats café et bistrot, habitués à gérer les flux de clientèle en toute autonomie.",
        },
        {
          icon: "📍",
          title: "Réseau hyper-local",
          description:
            "nos talents sont dans votre bassin d'emploi. Pas de temps de trajet excessif, pas de profils qui ne connaissent pas le quartier ou la clientèle.",
        },
        {
          icon: "💶",
          title: "50€/mois, tout compris",
          description:
            "même tarif que pour un groupe. Parce que votre établissement mérite le même niveau de service, quelle que soit sa taille.",
        },
      ],
      tags: [
        "Barista",
        "Serveur polyvalent",
        "Caisse",
        "Runner",
        "Aide de salle",
        "Gérant de salle",
      ],
      stats: { rating: "2 min", label: "Pour publier votre annonce" },
      cardStats: [
        { value: "8", label: "Missions / an" },
        { value: "100%", label: "Local & vérifié" },
        { value: "50€", label: "/ mois TTC" },
      ],
      missions: [
        {
          title: "Café de quartier indépendant",
          location: "Gérant propriétaire — Bordeaux Centre",
          status: "Profils déjà dans le rythme du service",
          statusColor: "text-[#782478]",
        },
        {
          title: "Barista — service matin",
          location: "Pourvu en 24h",
          status: "",
          statusColor: "",
        },
        {
          title: "Serveur polyvalent",
          location: "",
          status: "",
          statusColor: "",
        },
      ],
      ctaButton: "Trouver des profils café & bistrot",
      bottomCard: { value: "400€", label: "Économisés per mission" },
    },
    "traiteurs-evenementiel": {
      title: "Vos événements méritent",
      subtitle: "des équipes à la hauteur.",
      description:
        "Un mariage, un séminaire d'entreprise, un banquet de 300 couverts — chaque événement est unique, chaque service est un défi logistique. Shiftly vous donne accès à des renforts qualifiés, disponibles sur des formats ponctuels, capables de monter en puissance rapidement et de s'intégrer à votre équipe le jour J.",
      profiles: [
        {
          icon: "🍽️",
          title: "Serveurs banquet, maîtres d'hôtel, chefs de rang événementiels",
          description:
            "habitués aux grands couverts, au service synchronisé et aux standards de l'événementiel haut de gamme.",
        },
        {
          icon: "👨‍🍳",
          title: "Brigades de cuisine ponctuelles",
          description:
            "commis, chefs de partie, plongeurs disponibles pour des missions courtes, du jour pour le lendemain si nécessaire.",
        },
        {
          icon: "📅",
          title: "Anticipation et réactivité cumulées",
          description:
            "planifiez vos renforts à l'avance pour les grands événements ou activez notre réseau en urgence pour les imprévus de dernière minute.",
        },
      ],
      tags: [
        "Serveur banquet",
        "Maître d'hôtel",
        "Chef de rang event",
        "Commis traiteur",
        "Plongeur",
        "Cuisinier ponctuel",
        "Runner",
        "Coordinateur salle",
      ],
      stats: { rating: "J-48h", label: "Renfort disponible en urgence" },
      cardStats: [
        { value: "45", label: "Missions Shiftly" },
        { value: "100%", label: "Taux de service" },
        { value: "24h", label: "Délai urgence" },
      ],
      missions: [
        {
          title: "Traiteur Premium Île-de-France",
          location: "Chef d'entreprise — 120 événements / an",
          status: "Partenaire actif — saison haute sécurisée",
          statusColor: "text-[#782478]",
        },
        {
          title: "8 serveurs banquet — Mariage 200p",
          location: "J-3",
          status: "",
          statusColor: "",
        },
        {
          title: "Chef de partie — Séminaire",
          location: "J-1",
          status: "",
          statusColor: "",
        },
      ],
      ctaButton: "Trouver des profils événementiels",
      bottomCard: { value: "+1 200", label: "Profils disponibles" },
    },
    "bien-etre-spa": {
      title: "L'exigence du soin.",
      subtitle: "La rigueur du service hôtelier.",
      description:
        "Les établissements de bien-être — spas, thalassos, resorts, hôtels avec espace wellness — combinent les contraintes de l'hôtellerie premium avec les standards spécifiques des soins et de l'expérience client. Shiftly accompagne ces établissements avec des profils adaptés à cette double exigence.",
      profiles: [
        {
          icon: "🌸",
          title: "Profils hôtellerie premium",
          description:
            "réception, housekeeping haut de gamme, service F&B adapté aux environnements resort : des profils qui comprennent l'univers du luxe et du bien-être.",
        },
        {
          icon: "💆",
          title: "Personnel d'accueil et de coordination wellness",
          description:
            "agents d'accueil spa, coordinateurs d'activités, personnel de piscine. Des profils formés aux codes d'un environnement premium.",
        },
        {
          icon: "📊",
          title: "Gestion des pics saisonniers",
          description:
            "haute saison, week-ends wellness, ouvertures de nouveaux soins : Shiftly anticipe et sécurise vos besoins en volume.",
        },
      ],
      tags: [
        "Réception resort",
        "Accueil spa",
        "Housekeeping premium",
        "Service restauration",
        "Coordinateur activités",
        "Personnel piscine",
      ],
      stats: { rating: "100%", label: "Profils vérifiés & évalués" },
      cardStats: [
        { value: "24", label: "Missions / an" },
        { value: "5★", label: "Notation" },
        { value: "3 ans", label: "Partenariat" },
      ],
      missions: [
        {
          title: "Resort & Spa 5★",
          location: "Direction exploitation — Côte d'Azur",
          status: "Saison haute sécurisée chaque année",
          statusColor: "text-[#782478]",
        },
        {
          title: "Réceptionniste hôtel premium",
          location: "Pourvu en 48h",
          status: "",
          statusColor: "",
        },
        {
          title: "Agent d'accueil spa",
          location: "",
          status: "",
          statusColor: "",
        },
      ],
      ctaButton: "Trouver des profils bien-être & spa",
      bottomCard: { value: "Tami", label: "Partenaire évaluation profils" },
    },
    "groupes-multi-sites": {
      title: "Un logiciel qui tient",
      subtitle: "à l'échelle de votre groupe.",
      description:
        "Gérer les ressources humaines de plusieurs établissements simultanément, c'est un enjeu de structuration, de pilotage et de cohérence. Shiftly propose une solution qui centralise la vision groupe tout en restant opérationnelle établissement par établissement — avec l'accompagnement humain local qui fait la différence.",
      profiles: [
        {
          icon: "📊",
          title: "Pilotage consolidé multi-établissements",
          description:
            "remontées d'indicateurs, suivi des missions, gestion des ressources à l'échelle du groupe depuis un tableau de bord central.",
        },
        {
          icon: "🔄",
          title: "Standardisation des process RH",
          description:
            "même logique de recrutement, mêmes standards d'évaluation des profils, même niveau de qualité sur l'ensemble de vos sites.",
        },
        {
          icon: "📍",
          title: "Interlocuteurs locaux par territoire",
          description:
            "chaque établissement de votre groupe bénéficie d'un contact Shiftly ancré dans son bassin d'emploi, tout en bénéficiant d'un suivi cohérent au niveau groupe.",
        },
        {
          icon: "📈",
          title: "Solution qui accompagne votre croissance",
          description:
            "ouverture d'un nouveau site, acquisition, restructuration : Shiftly s'adapte à votre développement sans friction.",
        },
      ],
      tags: [
        "Multi-sites",
        "Reporting groupe",
        "RH centralisée",
        "Standardisation",
        "KPIs opérationnels",
        "Pilotage",
      ],
      stats: { rating: "10", label: "Antennes locales actives" },
      cardStats: [
        { value: "8", label: "Sites gérés" },
        { value: "120", label: "Missions / an" },
        { value: "3", label: "Antennes locales" },
      ],
      missions: [
        {
          title: "Groupe Hôtelier Régional",
          location: "DRH — 8 établissements, 3 régions",
          status: "Pilotage consolidé — vue groupe activée",
          statusColor: "text-[#782478]",
        },
        {
          title: "Site Paris — Réceptionniste nuit",
          location: "Actif",
          status: "",
          statusColor: "",
        },
        {
          title: "Site Lyon — Chef de rang",
          location: "Actif",
          status: "",
          statusColor: "",
        },
        {
          title: "Site Marseille — Commis cuisine",
          location: "En cours",
          status: "",
          statusColor: "",
        },
      ],
      ctaButton: "Discuter de votre organisation",
      bottomCard: { value: "98%", label: "Missions honorées" },
    },
  };

  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#fcfaf7]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#782478] mb-6">
            Nos secteurs
          </p>

          <h1
            className={`${playfair.className} text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-normal text-[#1a1a1a] leading-[1.15] mb-6`}
          >
            Un secteur.{" "}
            <span className="italic text-[#782478]">
              Des réalités concrètes.
            </span>
            <br />
            Un seul partenaire.
          </h1>

          <p className="text-base sm:text-lg text-[#503342] leading-relaxed max-w-3xl mx-auto">
            Shiftly accompagne l&apos;ensemble du secteur HCR — des hôtels
            indépendants aux groupes de restauration, des traiteurs
            événementiels aux établissements premium. Parce que chaque secteur a
            ses rythmes, ses postes et ses contraintes, nous avons construit une
            réponse adaptée à chacun.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12">
          {sectors.map((sector) => (
            <button
              key={sector.id}
              onClick={() => setActiveSector(sector.id)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                activeSector === sector.id
                  ? "bg-[#782478] text-[#fcfaf7] shadow-lg shadow-[#782478]/25"
                  : "bg-white text-[#1a1a1a] border border-[#e8e2dc] hover:border-[#782478]/30"
              }`}
            >
              <span className="text-lg" aria-hidden>
                {sector.icon}
              </span>
              {sector.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] gap-8 lg:gap-12">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#782478]/10 px-4 py-2">
              <span className="text-lg" aria-hidden>
                {sectors.find((s) => s.id === activeSector)?.icon}
              </span>
              <span className="text-sm font-semibold text-[#782478]">
                {sectors.find((s) => s.id === activeSector)?.label}
              </span>
            </div>

            <h2
              className={`${playfair.className} text-3xl sm:text-4xl font-normal text-[#1a1a1a] leading-[1.15] mb-6`}
            >
              {sectorContent[activeSector].title}{" "}
              <span className="italic text-[#782478]">
                {sectorContent[activeSector].subtitle}
              </span>
            </h2>

            <p className="text-base text-[#503342] leading-relaxed mb-8">
              {sectorContent[activeSector].description}
            </p>

            <div className="space-y-4 mb-8">
              {sectorContent[activeSector].profiles.map((profile, index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-xl bg-[#f5f1ed] p-4"
                >
                  <span className="text-2xl flex-shrink-0" aria-hidden>
                    {profile.icon}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a] mb-1">
                      {profile.title}
                    </p>
                    <p className="text-sm text-[#503342]">
                      {profile.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {sectorContent[activeSector].tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-[#782478]/5 px-4 py-2 text-xs font-medium text-[#782478]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#782478] px-6 py-3 text-base font-semibold text-[#fcfaf7] shadow-lg shadow-[#782478]/25 transition hover:bg-[#5c1c5c]">
                {sectorContent[activeSector].ctaButton} →
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#e8e2dc] bg-white px-6 py-3 text-base font-semibold text-[#1a1a1a] transition hover:border-[#782478]/30">
                Voir les tarifs
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl bg-[#1e1424] p-6 sm:p-8 shadow-xl ring-1 ring-white/5">
              <div className="mb-6 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
                  {activeSector === "hotellerie"
                    ? "CAMPAGNE"
                    : activeSector === "restauration"
                      ? "ÉTABLISSEMENT ACCOMPAGNÉ"
                      : activeSector === "traiteurs-evenementiel"
                        ? "MISSION ÉVÉNEMENTIELLE"
                        : activeSector === "bien-etre-spa"
                          ? "ÉTABLISSEMENT ACCOMPAGNÉ"
                          : "GROUPE ACCOMPAGNÉ"}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#fcfaf7]">
                    {sectorContent[activeSector].stats.rating}
                  </p>
                  <p className="text-xs text-[#bdaaa1]">
                    {sectorContent[activeSector].stats.label}
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#fcfaf7] mb-2">
                {sectorContent[activeSector].missions[0].title}
              </h3>
              <p className="text-sm text-[#bdaaa1] mb-6">
                {sectorContent[activeSector].missions[0].location}
              </p>

              {sectorContent[activeSector].cardStats && (
                <div
                  className={`grid grid-cols-${sectorContent[activeSector].cardStats!.length} gap-4 border-t border-white/10 pt-6 mb-6`}
                >
                  {sectorContent[activeSector].cardStats!.map((stat, index) => (
                    <div key={index}>
                      <p className="text-2xl font-bold text-[#fcfaf7]">
                        {stat.value}
                      </p>
                      <p className="text-xs text-[#bdaaa1]">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {sectorContent[activeSector].missions[0].status && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#782478] px-4 py-2 text-sm text-[#fcfaf7]">
                  {sectorContent[activeSector].missions[0].statusColor ===
                    "text-emerald-400" && (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                  )}
                  {sectorContent[activeSector].missions[0].status}
                </div>
              )}

              {sectorContent[activeSector].missions.length > 1 && (
                <div className="space-y-3 border-t border-white/10 pt-6">
                  {sectorContent[activeSector].missions
                    .slice(1)
                    .map((mission, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#fcfaf7]">
                            {mission.title}
                          </p>
                        </div>
                        {mission.location && (
                          <span className="text-xs font-medium text-[#782478]">
                            {mission.location}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="absolute -bottom-4 -right-4 z-20 rounded-2xl bg-[#782478] p-6 shadow-xl shadow-[#782478]/40">
              <p className="text-4xl font-bold text-[#fcfaf7] leading-none">
                {sectorContent[activeSector].bottomCard.value}
              </p>
              <p className="mt-2 text-sm font-medium text-[#fcfaf7]/90 leading-tight">
                {sectorContent[activeSector].bottomCard.label}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
