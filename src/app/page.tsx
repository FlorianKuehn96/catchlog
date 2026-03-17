import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession();
  
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎣</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CatchLog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dein digitaler Fangbericht. Speichere jeden Fang mit Standort, 
            Wetter und Foto. Die KI empfiehlt dir den perfekten Köder 
            für dein nächstes Angelabenteuer.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: '📸',
              title: 'Fang dokumentieren',
              desc: 'Speichere jeden Fang mit Foto, Größe, Gewicht und Standort',
            },
            {
              icon: '🌤️',
              title: 'Wetter-Tracking',
              desc: 'Automatische Wetterdaten zum Zeitpunkt deines Fangs',
            },
            {
              icon: '🎯',
              title: 'KI-Empfehlung',
              desc: 'Bekomme personalisierte Köder-Empfehlungen basierend auf deinen Fängen',
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Preise</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Free</h3>
              <p className="text-3xl font-bold mb-4">€0</p>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>✓ 50 Fänge/Monat</li>
                <li>✓ Basis-Statistiken</li>
                <li>✓ Foto-Upload</li>
              </ul>
              <Link
                href="/login"
                className="block w-full text-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Kostenlos starten
              </Link>
            </div>
            
            <div className="p-6 border-2 border-blue-500 rounded-xl bg-blue-50">
              <h3 className="text-lg font-semibold mb-2">Pro</h3>
              <p className="text-3xl font-bold mb-4">€4.99/Monat</p>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>✓ Unbegrenzte Fänge</li>
                <li>✓ KI-Empfehlungen</li>
                <li>✓ Wetter-Prognose</li>
                <li>✓ Export-Funktion</li>
              </ul>
              <Link
                href="/login?plan=pro"
                className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Pro auswählen
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Jetzt starten →
          </Link>
        </div>
      </div>
    </div>
  );
}
