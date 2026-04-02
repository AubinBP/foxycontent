import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialité - CHR Insights",
  description: "Politique de confidentialité du site CHR Insights.",
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] font-['Crimson_Pro',serif]">

      <div className="bg-[#1A1A18] text-gray-400 text-xs font-['DM_Sans',sans-serif] tracking-widest uppercase">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between">
          <span>Le média des pros CHR</span>
          <span>
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <header className="bg-[#1A1A18] text-white border-b-4 border-[#D4A853]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link href="/">
            <h1 className="text-5xl font-black">
              CHR<span className="text-[#D4A853]">.</span>
              <span className="text-3xl italic">Insights</span>
            </h1>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">

        <h1 className="text-4xl font-bold mb-8">
          Politique de confidentialité
        </h1>

        <div className="prose prose-lg max-w-none text-gray-700">

          <h2>Introduction</h2>
          <p>
            La présente politique de confidentialité a pour objectif d’informer
            les utilisateurs du site CHR Insights sur la manière dont leurs
            données personnelles sont collectées, utilisées et protégées.
          </p>

          <h2>Données collectées</h2>
          <p>
            Nous pouvons collecter les données suivantes :
          </p>
          <ul>
            <li>Adresse email (newsletter, contact)</li>
            <li>Données de navigation (cookies, statistiques)</li>
            <li>Informations fournies volontairement via les formulaires</li>
          </ul>

          <h2>Finalités de la collecte</h2>
          <p>
            Les données sont collectées pour :
          </p>
          <ul>
            <li>Améliorer l’expérience utilisateur</li>
            <li>Analyser le trafic du site</li>
            <li>Répondre aux demandes des utilisateurs</li>
            <li>Envoyer des communications marketing si consentement</li>
          </ul>

          <h2>Base légale</h2>
          <p>
            Le traitement des données repose sur le consentement de l’utilisateur
            ou sur l’intérêt légitime de l’éditeur.
          </p>

          <h2>Durée de conservation</h2>
          <p>
            Les données personnelles sont conservées pour une durée maximale
            de 3 ans à compter du dernier contact avec l’utilisateur.
          </p>

          <h2>Cookies</h2>
          <p>
            Le site utilise des cookies afin de mesurer l’audience et améliorer
            ses performances. L’utilisateur peut configurer son navigateur pour
            refuser les cookies.
          </p>

          <h2>Partage des données</h2>
          <p>
            Les données ne sont jamais vendues. Elles peuvent être partagées
            uniquement avec des prestataires techniques nécessaires au
            fonctionnement du site.
          </p>

          <h2>Sécurité</h2>
          <p>
            CHR.Insights met en œuvre des mesures techniques et organisationnelles
            afin de protéger les données contre tout accès non autorisé.
          </p>

          <h2>Droits des utilisateurs</h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul>
            <li>Droit d’accès</li>
            <li>Droit de rectification</li>
            <li>Droit de suppression</li>
            <li>Droit d’opposition</li>
          </ul>

          <h2>Contact</h2>
          <p>
            Pour toute question relative à vos données :
            <br />
            <strong>chr.insights@contact.com</strong>
          </p>

        </div>

        <div className="mt-10">
          <Link href="/" className="text-sm text-gray-500 hover:text-[#B8912A]">
            ← Retour à l'accueil
          </Link>
        </div>

      </div>
    </div>
  );
}