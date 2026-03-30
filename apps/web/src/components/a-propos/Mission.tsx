import { Lightbulb, Heart, Zap } from "lucide-react";

export default function Mission() {
  return (
    <section
      data-nav-dark
      className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#1e1424]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#782478] mb-6">
              Notre mission
            </p>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fcfaf7] leading-[1.15] mb-6"
            >
              Simplifier le recrutement dans un secteur qui ne peut pas
              attendre.
            </h2>

            <p className="text-base sm:text-lg text-[#bdaaa1] leading-relaxed mb-6">
              Dans l'hôtellerie-restauration, un poste vacant le samedi soir
              n'est pas qu'un problème RH — c'est un service dégradé, une
              équipe sous tension, une réputation en jeu.
            </p>

            <p className="text-base sm:text-lg text-[#bdaaa1] leading-relaxed">
              Shiftly a été créée pour répondre à cette urgence : mettre en
              relation rapide des établissements avec des talents qualifiés,
              locaux et disponibles, tout en garantissant conformité et
              simplicité administrative.
            </p>
          </div>

          <div className="space-y-5">
            <div className="bg-[#fcfaf7] rounded-2xl p-6 shadow-lg">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#782478]/10 mb-4">
                <Lightbulb className="h-6 w-6 text-[#782478]" aria-hidden />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">
                Né du terrain
              </h3>
              <p className="text-sm sm:text-base text-[#503342] leading-relaxed">
                Shiftly est issue d'une observation directe des difficultés
                rencontrées par les professionnels de l'HCR : turn-over
                constant, solutions inadaptées, processus chronophages.
              </p>
            </div>

            <div className="bg-[#782478] rounded-2xl p-6 shadow-lg">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 mb-4">
                <Heart className="h-6 w-6 text-white" aria-hidden />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Pensé pour vous
              </h3>
              <p className="text-sm sm:text-base text-[#fcfaf7]/90 leading-relaxed">
                Chaque fonctionnalité a été conçue en écoutant vos contraintes
                réelles : rapidité, conformité, simplicité, et respect du
                rythme de votre exploitation.
              </p>
            </div>

            <div className="bg-[#fcfaf7] rounded-2xl p-6 shadow-lg">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#782478]/10 mb-4">
                <Zap className="h-6 w-6 text-[#782478]" aria-hidden />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">
                Opérationnel immédiatement
              </h3>
              <p className="text-sm sm:text-base text-[#503342] leading-relaxed">
                Pas de formation complexe, pas de délai d'intégration. Vous
                publiez un besoin, vous recevez des profils qualifiés en moins
                de 48h.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
