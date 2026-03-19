'use client';

import Link from 'next/link';

export default function CookiesPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Cookie-Hinweis</h1>
          
          <p className="text-sm text-gray-500 mb-6">Stand: 19. März 2026</p>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Keine Tracking-Cookies</h2>
            <p className="text-gray-700">
              CatchLog verwendet <strong>keine Marketing- oder Analyse-Cookies</strong>. 
              Wir tracken Ihr Verhalten nicht und erstellen keine Nutzerprofile.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Notwendige Cookies</h2>
            <p className="text-gray-700 mb-3">
              Die folgenden Cookies sind technisch notwendig für den Betrieb der App:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Cookie</th>
                    <th className="text-left p-2">Zweck</th>
                    <th className="text-left p-2">Laufzeit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 font-mono text-xs">next-auth.session-token</td>
                    <td className="p-2">Login-Session</td>
                    <td className="p-2">Session</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-xs">next-auth.csrf-token</td>
                    <td className="p-2">CSRF-Schutz (Sicherheit)</td>
                    <td className="p-2">Session</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-xs">next-auth.callback-url</td>
                    <td className="p-2">Login-Weiterleitung</td>
                    <td className="p-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Was sind Cookies?</h2>
            <p className="text-gray-700">
              Cookies sind kleine Textdateien, die Ihr Browser speichert. Sie ermöglichen 
              grundlegende Funktionen wie das Einloggen und schützen vor Sicherheitsrisiken.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Cookie-Einstellungen</h2>
            <p className="text-gray-700">
              Da wir nur technisch notwendige Cookies verwenden, benötigen wir keine 
              Einwilligung gemäß § 25 Abs. 2 TTDSG.
            </p>
            <p className="text-gray-700 mt-2">
              Sie können Cookies in Ihren Browser-Einstellungen deaktivieren, dies kann 
              jedoch die Funktionalität der App beeinträchtigen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Änderungen</h2>
            <p className="text-gray-700">
              Wir behalten uns vor, diese Cookie-Hinweise bei Änderungen der App anzupassen.
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
