import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* ── TOPBAR NAVIGATION ── */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 text-2xl shadow-lg shadow-amber-500/20">
              ⛽
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                PETRO<span className="text-amber-400">FLOW</span>
              </span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                SaaS B2B
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-amber-400 transition">Fonctionnalités</a>
            <a href="#solutions" className="hover:text-amber-400 transition">Multi-Réseaux</a>
            <a href="#demo" className="hover:text-amber-400 transition">Démo HLACOMEY</a>
            <a href="#pricing" className="hover:text-amber-400 transition">Tarifs</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/app/daily-sheet"
              className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 transition"
            >
              Connexion
            </Link>
            <Link
              href="/app/daily-sheet"
              className="text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition transform hover:-translate-y-0.5"
            >
              Accéder à l'application →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-amber-300 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            La plateforme SaaS pour digitaliser et piloter les stations-service en Afrique
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Adieu les cahiers papier. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              Pilotez vos stations en temps réel.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed">
            Fini les calculs d'index manuels, les fraudes sur les cuves et les écarts de caisse en fin de tour. Automatisez la réconciliation carburants, lubrifiants, gaz, TPE et MOMO sur une plateforme cloud sécurisée que vous pouvez commercialiser à d'autres réseaux.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app/daily-sheet"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 text-base font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-8 py-4 rounded-xl shadow-xl shadow-amber-500/25 transition transform hover:-translate-y-0.5"
            >
              <span>Ouvrir la Fiche Numérique en Direct</span>
              <span>⚡</span>
            </Link>
            <a
              href="#pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-8 py-4 rounded-xl transition"
            >
              Voir les Abonnements SaaS
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>✓ Multi-Stations & Réseaux</span>
            <span>✓ Calculs Index 100% Automatiques</span>
            <span>✓ Détection Pertes & Vols (Jauges)</span>
            <span>✓ Impression Ticket & Fiche PDF</span>
          </div>
        </div>
      </section>

      {/* ── APERÇU DASHBOARD INTERACTIF ── */}
      <section id="demo" className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-3 sm:p-5 shadow-2xl shadow-black/80">
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-3 text-xs font-mono text-slate-400">app.petroflow.com — Station HLACOMEY (BENIN PETRO)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  ● Tour En Cours (24h)
                </span>
                <Link
                  href="/app/daily-sheet"
                  className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded transition"
                >
                  Ouvrir l'outil plein écran
                </Link>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400 mb-1">Ventes Produits Blancs</div>
                <div className="text-xl font-black text-amber-400">1 531 770 FCFA</div>
                <div className="text-[11px] text-slate-500 mt-1">2 012 Litres débités</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400 mb-1">Lubrifiants & Gaz</div>
                <div className="text-xl font-black text-white">201 000 FCFA</div>
                <div className="text-[11px] text-slate-500 mt-1">30 Bouteilles vendues</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400 mb-1">Paiements Digitaux (TPE/MOMO)</div>
                <div className="text-xl font-black text-emerald-400">1 334 086 FCFA</div>
                <div className="text-[11px] text-slate-500 mt-1">TPE + MOMO + Cartes</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400 mb-1">Espèces en Caisse Finale</div>
                <div className="text-xl font-black text-white">385 184 FCFA</div>
                <div className="text-[11px] text-emerald-400 mt-1">✓ Caisse Équilibrée</div>
              </div>
            </div>

            {/* Visual Teaser */}
            <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-8 text-center">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-lg font-bold text-white mb-2">Votre Feuille de Gestion Journalière Numérisée</h3>
              <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6">
                Chaque ligne de votre cahier papier (Index Début/Fin, Sorties, R.C., Ventes, Jauges, Cartes TPA Ad9000, MOMO, Dépenses) est fidèlement modélisée et s'exécute automatiquement en temps réel.
              </p>
              <Link
                href="/app/daily-sheet"
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-6 py-2.5 rounded-xl font-bold text-sm transition"
              >
                <span>Accéder au formulaire de saisie</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── MULTI-STATIONS & PERSONNALISATION ── */}
      <section id="solutions" className="py-20 px-6 bg-slate-950 border-y border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Adaptabilité Universelle</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
              Chaque station a sa réalité. PetroFlow s'adapte à chacune.
            </h2>
            <p className="text-slate-400 text-base">
              Que votre station appartienne à un réseau franchisé (BENIN PETRO, ORYX, TOTAL, PUMA, SHELL) ou soit indépendante, paramétrez librement vos produits, cartes fidélité et modes de fonctionnement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-2xl flex items-center justify-center mb-5">
                ⛽
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Produits & Pompes Flexibles</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Configurez le nombre exact de pompes et pistolets par machine (1 pistolet Gasoil + 1 Essence, ou multiproduits). Changez les prix unitaires par station en un clic.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-2xl flex items-center justify-center mb-5">
                💳
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cartes Réseau & Fidélité</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Gérez les cartes spécifiques de votre réseau (ex: Cartes Classic, Privilege, Noblesse, Sublim de TPA Ad9000 pour BENIN PETRO, ou les cartes flotte Total / Oryx).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-2xl flex items-center justify-center mb-5">
                ⏱️
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Shifts & Tours sur-mesure</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tours de 24h par pompiste/gérant, ou rotations en 2x12h et 3x8h. Rapports ventilés par responsable de tour avec historique des relèves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS CLÉS ── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Puissance & Sécurité</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
              Zéro erreur, zéro fraude, zéro stress.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="text-2xl mb-3">📐</div>
              <h4 className="text-base font-bold text-white mb-1">Contrôle Jauge vs Compteur</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Compare le volume vendu selon les compteurs avec la baisse physique dans la cuve (jauge centimétrique). Alerte immédiate si écart suspect (fuite ou coulage).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="text-2xl mb-3">📲</div>
              <h4 className="text-base font-bold text-white mb-1">Réconciliation Mobile Money</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Suivi précis du flux MOMO reçu et du solde restant. Évite les confusions d'argent entre les fonds de roulement et les recettes station.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="text-2xl mb-3">🖨️</div>
              <h4 className="text-base font-bold text-white mb-1">Impression Directe & PDF</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Générez la fiche journalière au format PDF prêt à l'impression d'un clic pour la comptabilité ou envoyez-la sur imprimante thermique.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="text-2xl mb-3">🛡️</div>
              <h4 className="text-base font-bold text-white mb-1">Multi-Tenant Sécurisé</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Chaque propriétaire et chaque station possède ses données cloisonnées hermétiquement avec politiques de sécurité RLS PostgreSQL.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="text-2xl mb-3">🏢</div>
              <h4 className="text-base font-bold text-white mb-1">Supervision Propriétaire</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Le propriétaire consulte depuis son smartphone le chiffre d'affaires et la caisse de toutes ses stations en direct où qu'il soit dans le monde.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="text-2xl mb-3">🌍</div>
              <h4 className="text-base font-bold text-white mb-1">Multi-Devises (FCFA, NGN, GHS, USD)</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Déployable immédiatement au Bénin, Togo, Côte d'Ivoire, Sénégal, Nigeria, Ghana ou toute autre région africaine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── GRILLE TARIFAIRE SAAS (B2B) ── */}
      <section id="pricing" className="py-20 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Modèle SaaS Récurrent</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
              Des forfaits simples pour toutes les stations
            </h2>
            <p className="text-slate-400 text-sm">
              Rentabilisé dès la première fuite ou le premier écart de caisse évité.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Plan 1 */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Station Starter</h3>
                <p className="text-slate-400 text-xs mb-6">Pour 1 station indépendante</p>
                <div className="text-3xl font-black text-white mb-6">
                  15 000 <span className="text-xs font-medium text-slate-400">FCFA / mois</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">✓ 1 Station incluse</li>
                  <li className="flex items-center gap-2">✓ Saisie journalière Carburants</li>
                  <li className="flex items-center gap-2">✓ Suivi Caisse, TPE & MOMO</li>
                  <li className="flex items-center gap-2">✓ Export PDF & Impression</li>
                </ul>
              </div>
              <Link
                href="/app/daily-sheet"
                className="mt-8 block text-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs transition"
              >
                Commencer
              </Link>
            </div>

            {/* Plan 2 - Vedette */}
            <div className="rounded-2xl bg-gradient-to-b from-amber-500/10 to-slate-900 border-2 border-amber-500/80 p-8 flex flex-col justify-between relative shadow-xl shadow-amber-500/10">
              <div className="absolute -top-3 right-6 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                Le Plus Populaire
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Station Pro</h3>
                <p className="text-amber-300/80 text-xs mb-6">Pour les gérants exigeants</p>
                <div className="text-3xl font-black text-white mb-6">
                  25 000 <span className="text-xs font-medium text-slate-400">FCFA / mois</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">✓ <strong>Tout Starter +</strong></li>
                  <li className="flex items-center gap-2">✓ Gestion Lubrifiants & Gaz</li>
                  <li className="flex items-center gap-2">✓ Contrôle Jauges & Détection de vol</li>
                  <li className="flex items-center gap-2">✓ Alertes WhatsApp & Notifications</li>
                  <li className="flex items-center gap-2">✓ Cartes Réseau personnalisées (TPA, etc.)</li>
                </ul>
              </div>
              <Link
                href="/app/daily-sheet"
                className="mt-8 block text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition"
              >
                Tester maintenant
              </Link>
            </div>

            {/* Plan 3 */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Réseau Multi-Sites</h3>
                <p className="text-slate-400 text-xs mb-6">Pour propriétaires multi-stations</p>
                <div className="text-3xl font-black text-white mb-6">
                  60 000 <span className="text-xs font-medium text-slate-400">FCFA / mois</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">✓ Jusqu'à 5 Stations incluses</li>
                  <li className="flex items-center gap-2">✓ Dashboard Centralisé Propriétaire</li>
                  <li className="flex items-center gap-2">✓ Comparatif performances multi-stations</li>
                  <li className="flex items-center gap-2">✓ Support prioritaire 24/7</li>
                </ul>
              </div>
              <Link
                href="/app/daily-sheet"
                className="mt-8 block text-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs transition"
              >
                Contacter l'équipe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800 py-10 px-6 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <span>⛽</span> PETROFLOW SaaS — Gestion moderne de stations-service
          </div>
          <div>
            © 2026 PetroFlow. Développé pour BENIN PETRO et tous les réseaux de distribution.
          </div>
        </div>
      </footer>
    </div>
  );
}
