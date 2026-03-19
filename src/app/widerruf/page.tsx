import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Widerrufsbelehrung - CatchLog',
  description: 'Widerrufsrecht und Muster-Widerrufsformular für CatchLog',
};

export default function WiderrufsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Zurück zur Startseite
          </Link>
        </nav>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Widerrufsbelehrung</h1>

          <section className="mb-8 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Widerrufsrecht</h2>
            <p className="text-gray-700 mb-4">
              Sie haben das Recht, binnen <strong>vierzehn Tagen</strong> ohne Angabe von Gründen diesen Vertrag zu widerrufen.
            </p>
            <p className="text-gray-700">
              Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des <strong>Vertragsabschlusses</strong>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Widerrufserklärung</h2>
            <p className="text-gray-700 mb-4">
              Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief, Telefax oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
            </p>

            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="font-semibold text-gray-800 mb-2">Kontakt für Widerruf:</p>
              <p className="text-gray-700"><strong>[Dein Name / Firma]</strong></p>
              <p className="text-gray-700">Zum Gottschalkhof 4</p>
              <p className="text-gray-700">60594 Frankfurt</p>
              <p className="text-gray-700">Deutschland</p>
              <p className="text-gray-700 mt-2">E-Mail: <a href="mailto:florian@catchlog.app" className="text-blue-600 hover:underline">florian@catchlog.app</a></p>
            </div>

            <p className="text-gray-700">
              Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Fristwahrung</h2>
            <p className="text-gray-700">
              Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts <strong>vor Ablauf der Widerrufsfrist</strong> absenden.
            </p>
          </section>

          <section className="mb-8 bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Folgen des Widerrufs</h2>
            <p className="text-gray-700 mb-4">
              Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen <strong>vierzehn Tagen</strong> ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
            </p>
            <p className="text-gray-700">
              Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Muster-Widerrufsformular</h2>
            <p className="text-gray-700 mb-4">
              (Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden Sie es zurück.)
            </p>

            <div className="border-2 border-gray-300 p-6 rounded-lg bg-gray-50">
              <p className="text-gray-800 mb-4"><strong>An:</strong></p>
              <p className="text-gray-700">[Dein Name / Firma]</p>
              <p className="text-gray-700">Zum Gottschalkhof 4</p>
              <p className="text-gray-700">60594 Frankfurt</p>
              <p className="text-gray-700">E-Mail: florian@catchlog.app</p>

              <hr className="my-6 border-gray-300" />

              <p className="text-gray-800 mb-4"><strong>Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über die Nutzung der App CatchLog.</strong></p>

              <div className="space-y-4 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="w-48 text-gray-700">Bestellt am:</span>
                  <span className="flex-1 border-b border-gray-400 min-w-[200px]">&nbsp;</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="w-48 text-gray-700">Name des Nutzers:</span>
                  <span className="flex-1 border-b border-gray-400 min-w-[200px]">&nbsp;</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="w-48 text-gray-700">E-Mail-Adresse:</span>
                  <span className="flex-1 border-b border-gray-400 min-w-[200px]">&nbsp;</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start">
                  <span className="w-48 text-gray-700">Unterschrift:</span>
                  <span className="flex-1 border-b border-gray-400 min-w-[200px] pt-8">(nur bei Papierversion)</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="w-48 text-gray-700">Datum:</span>
                  <span className="flex-1 border-b border-gray-400 min-w-[200px]">&nbsp;</span>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8 bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Besonderer Hinweis: Vorzeitiges Erlöschen des Widerrufsrechts</h2>
            <p className="text-gray-700 mb-4">
              Ihr Widerrufsrecht erlischt vorzeitig, wenn wir mit der Vertragserfüllung begonnen haben, nachdem Sie hierzu <strong>ausdrücklich zugestimmt</strong> haben und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung verlieren.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">Erklärung über den vorzeitigen Erlöschen</h3>
            <p className="text-gray-700 mb-4">
              Mit Ihrer Zustimmung zu einer sofortigen Vertragserfüllung beginnen wir mit der Bereitstellung des Premium-Zugangs unmittelbar nach Zahlungseingang. Mit Ihrer Zahlung bestätigen Sie, dass Sie Kenntnis davon haben, dass Ihr Widerrufsrecht in diesem Fall erlischt, sobald wir mit der Vertragserfüllung begonnen haben.
            </p>

            <p className="text-gray-700 text-sm italic">
              Hinweis: Dies gilt nicht, wenn der Vertrag aufgrund eines Fehlers unsererseits nicht ordnungsgemäß erfüllt werden kann.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Kontakt für Widerruf</h2>
            <p className="text-gray-700 mb-2">E-Mail: <a href="mailto:florian@catchlog.app" className="text-blue-600 hover:underline">florian@catchlog.app</a></p>
            <p className="text-gray-700">Betreffzeile: "Widerruf"</p>
          </section>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Weitere Informationen:</strong> Weitere Details zu Ihren Rechten finden Sie in unseren <Link href="/agb" className="text-blue-600 hover:underline">Allgemeinen Geschäftsbedingungen</Link>.
            </p>
          </div>

          <p className="text-sm text-gray-500 mt-8 pt-8 border-t"><em>Stand: März 2026</em></p>
        </div>
      </div>
    </div>
  );
}
