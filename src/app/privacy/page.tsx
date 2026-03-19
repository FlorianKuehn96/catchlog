'use client';

import Link from 'next/link';

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Datenschutzerklärung</h1>
          
          <p className="text-sm text-gray-500 mb-6">Stand: 19. März 2026</p>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">1. Verantwortlicher</h2>
            <p className="text-gray-700">
              Florian Kühn<br />
              E-Mail: florian@catchlog.app
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">2. Verarbeitete Daten</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li><strong>Kontaktdaten:</strong> E-Mail-Adresse (via Google OAuth)</li>
              <li><strong>Profildaten:</strong> Name, Profilbild (optional)</li>
              <li><strong>Fangdaten:</strong> Fischart, Länge, Gewicht, Standort (GPS), Datum, Uhrzeit, Köder, Technik, Wetter, Notizen, Fotos</li>
              <li><strong>Gewässerdaten:</strong> Name, Standort (GPS), Notizen</li>
              <li><strong>Technische Daten:</strong> IP-Adresse, Browser-Informationen</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">3. Zwecke</h2>
            <p className="text-gray-700">
              Bereitstellung der App-Funktionen (digitales Fangbuch, Gewässerverwaltung), 
              Speicherung Ihrer Fangdaten, Berechnung von Statistiken.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">4. Datenempfänger</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Dienstleister</th>
                    <th className="text-left p-2">Zweck</th>
                    <th className="text-left p-2">Standort</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">Upstash</td>
                    <td className="p-2">Datenbank</td>
                    <td className="p-2">USA (EU-SVK)</td>
                  </tr>
                  <tr>
                    <td className="p-2">Vercel</td>
                    <td className="p-2">Hosting</td>
                    <td className="p-2">USA (EU-SVK)</td>
                  </tr>
                  <tr>
                    <td className="p-2">Google</td>
                    <td className="p-2">Login (OAuth)</td>
                    <td className="p-2">USA (EU-SVK)</td>
                  </tr>
                  <tr>
                    <td className="p-2">Open-Meteo</td>
                    <td className="p-2">Wetterdaten</td>
                    <td className="p-2">EU</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">5. Ihre Rechte</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Auskunft über Ihre gespeicherten Daten</li>
              <li>Berichtigung falscher Daten</li>
              <li>Löschung Ihrer Daten (Account-Löschung)</li>
              <li>Datenexport (CSV)</li>
              <li>Widerspruch gegen Verarbeitung</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Kontakt: <a href="mailto:florian@catchlog.app" className="text-blue-600 hover:underline">florian@catchlog.app</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">6. Cookies</h2>
            <p className="text-gray-700">
              Wir verwenden <strong>keine Tracking-Cookies</strong>. Nur technisch notwendige 
              Session-Cookies für den Login.
            </p>
            <p className="text-gray-700 mt-2">
              <Link href="/cookies" className="text-blue-600 hover:underline">Mehr zum Cookie-Hinweis →</Link>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">7. Beschwerderecht</h2>
            <p className="text-gray-700">
              Landesbeauftragte für Datenschutz NRW<br />
              Kavalleriestraße 2-4, 40213 Düsseldorf<br />
              <a href="mailto:poststelle@ldi.nrw.de" className="text-blue-600 hover:underline">poststelle@ldi.nrw.de</a>
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
