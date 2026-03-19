'use client';

import Link from 'next/link';

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Zurück zur Startseite
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Impressum</h1>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Angaben gemäß § 5 TMG</h2>
            <div className="text-gray-700 space-y-1">
              <p className="font-medium">Florian Kühn</p>
              <p>Zum Gottschalkhof 4</p>
              <p>60594 Frankfurt</p>
              <p>Deutschland</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Kontakt</h2>
            <div className="text-gray-700 space-y-1">
              <p>E-Mail: <a href="mailto:florian@catchlog.app" className="text-blue-600 hover:underline">florian@catchlog.app</a></p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <div className="text-gray-700 space-y-1">
              <p>Florian Kühn</p>
              <p>Zum Gottschalkhof 4</p>
              <p>60594 Frankfurt</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Haftungsausschluss</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                <strong>Haftung für Inhalte</strong><br />
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. 
                Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir 
                jedoch keine Gewähr übernehmen.
              </p>
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf 
                diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 
                TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder 
                gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, 
                die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Haftung für Links</h2>
            <p className="text-gray-700">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte 
              wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch 
              keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der 
              jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Urheberrecht</h2>
            <p className="text-gray-700">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten 
              unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, 
              Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes 
              bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Streitbeilegung</h2>
            <p className="text-gray-700">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) 
              bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://ec.europa.eu/consumers/odr</a>
            </p>
            <p className="text-gray-700 mt-2">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <hr className="my-6" />
          
          <p className="text-sm text-gray-500">
            Letzte Aktualisierung: 19.03.2026
          </p>
        </div>
      </div>
    </div>
  );
}
