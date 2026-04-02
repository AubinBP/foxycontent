import Link from "next/link";

export const metadata = {
  title: "Mentions légales - CHR Insights",
  description: "Mentions légales du site CHR Insights.",
};

export default function MentionsLegalesPage() {
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
          Mentions légales
        </h1>

        <div className="prose prose-lg max-w-none text-gray-700">

          <h2>Éditeur du site</h2>
          <p>
            Le site <strong>CHR Insights</strong> est édité par la société <strong>CHR.Insights</strong>,
            entreprise spécialisée dans la création de contenus et l’analyse des tendances
            dans le secteur du café, de l’hôtellerie et de la restauration.
          </p>

          <p>
            <strong>Forme juridique :</strong> Société par actions simplifiée (SAS)
            <br />
            <strong>Capital social :</strong> 5 000 €
            <br />
            <strong>Siège social :</strong> 12 rue de la Fosse, 44000 Nantes, France
            <br />
            <strong>Email :</strong> chr.insights@contact.com
          </p>

          <h2>Directeur de la publication</h2>
          <p>
            Le directeur de la publication du site est <strong>Julien Morel</strong>,
            en qualité de représentant légal de CHR.Insights.
          </p>

          <h2>Hébergement du site</h2>
          <p>
            Le site est hébergé par la société :
            <br />
            <strong>Vercel Inc.</strong>
            <br />
            340 S Lemon Ave #4133
            <br />
            Walnut, CA 91789
            <br />
            États-Unis
          </p>

          <h2>Accès au site</h2>
          <p>
            Le site est accessible à tout moment, sauf en cas de maintenance technique
            ou de force majeure. CHR.Insights s’efforce d’assurer une accessibilité
            continue mais ne peut être tenu responsable en cas d’interruption.
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L’ensemble des contenus présents sur le site (textes, articles, logos,
            éléments graphiques, structure) est la propriété exclusive de CHR.Insights,
            sauf mention contraire.
          </p>

          <p>
            Toute reproduction, distribution, modification ou exploitation sans
            autorisation écrite préalable est strictement interdite et peut faire
            l’objet de poursuites.
          </p>

          <h2>Responsabilité</h2>
          <p>
            Les informations diffusées sur CHR Insights sont fournies à titre
            informatif. Malgré le soin apporté à leur rédaction, elles peuvent
            contenir des inexactitudes ou être incomplètes.
          </p>

          <p>
            L’éditeur ne saurait être tenu responsable des dommages directs ou
            indirects résultant de l’utilisation du site ou des informations qui y sont publiées.
          </p>

          <h2>Liens externes</h2>
          <p>
            Le site peut contenir des liens vers des sites externes. CHR.Insights
            n’exerce aucun contrôle sur ces sites et décline toute responsabilité
            quant à leur contenu.
          </p>

          <h2>Droit applicable</h2>
          <p>
            Les présentes mentions légales sont régies par le droit français.
            En cas de litige, les tribunaux compétents seront ceux du ressort
            de Nantes.
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