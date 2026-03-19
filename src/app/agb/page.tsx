import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AGB - CatchLog',
  description: 'Allgemeine Geschäftsbedingungen für CatchLog',
};

export default function AGBPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Zurück zur Startseite
          </Link>
        </nav>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
          
          <p className="text-sm text-gray-600 mb-8"><strong>Stand:</strong> März 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">§ 1 Geltungsbereich</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Webanwendung CatchLog (nachfolgend "App" genannt) sowie für alle damit im Zusammenhang stehenden Verträge zwischen dem Betreiber und den Nutzern.</li>
              <li>Abweichende oder ergänzende Bedingungen des Nutzers finden keine Anwendung, es sei denn, der Betreiber hat diesen ausdrücklich schriftlich zugestimmt.</li>
              <li>Diese AGB gelten sowohl für kostenlose als auch für kostenpflichtige Nutzung der App.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">§ 2 Vertragsschluss und Leistungsumfang</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Der Vertrag über die Nutzung der App kommt durch Registrierung des Nutzers zustande. Mit der Registrierung akzeptiert der Nutzer diese AGB.</li>
              <li>
                <strong>Kostenlose Nutzung:</strong> Die Grundfunktionen der App können kostenlos genutzt werden. Dabei gelten folgende Einschränkungen:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Maximale Speicherung von 50 Fängen</li>
                  <li>Kein Export von Daten</li>
                  <li>Keine Premium-Features</li>
                </ul>
              </li>
              <li>
                <strong>Premium-Nutzung:</strong> Durch Abschluss eines kostenpflichtigen Abonnements erhält der Nutzer Zugriff auf:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Unbegrenzte Speicherung von Fängen</li>
                  <li>Export-Funktion (CSV/Excel)</li>
                  <li>Erweiterte Statistiken</li>
                  <li>Premium-Support</li>
                </ul>
              </li>
              <li>Der Betreiber behält sich das Recht vor, den Funktionsumfang der App zu erweitern oder zu ändern.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">§ 3 Preise und Zahlungsbedingungen</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                <strong>Preise:</strong>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Premium Monthly: 4,99 € pro Monat</li>
                  <li>Premium Yearly: 39,99 € pro Jahr (entspricht 3,33 €/Monat)</li>
                  <li>Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.</li>
                </ul>
              </li>
              <li><strong>Zahlungsweise:</strong> Die Zahlung erfolgt über den Zahlungsdienstleister Stripe. Es werden folgende Zahlungsarten akzeptiert: Kreditkarte (Visa, Mastercard, American Express), SEPA-Lastschrift (sofern verfügbar).</li>
              <li><strong>Abrechnung:</strong> Bei monatlichen Abonnements wird monatlich, bei jährlichen Abonnements jährlich im Voraus abgerechnet.</li>
              <li><strong>Preisänderungen:</strong> Der Betreiber behält sich vor, die Preise mit einer Vorankündigungsfrist von 30 Tagen zu ändern. Preisänderungen betreffen nicht laufende Abonnements vor deren Verlängerung.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">§ 4 Vertragslaufzeit und Kündigung</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                <strong>Laufzeit:</strong>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Monatliche Abonnements: Unbefristet mit monatlicher Laufzeit</li>
                  <li>Jährliche Abonnements: Unbefristet mit jährlicher Laufzeit</li>
                </ul>
              </li>
              <li><strong>Kündigung:</strong> Das Abonnement kann jederzeit zum Ende der aktuellen Laufzeit gekündigt werden. Die Kündigung muss im Nutzerkonto vorgenommen werden.</li>
              <li><strong>Widerrufsrecht:</strong> Verbraucher haben ein 14-tägiges Widerrufsrecht. Details siehe <Link href="/widerruf" className="text-blue-600 hover:underline">Widerrufsbelehrung</Link>.</li>
              <li><strong>Automatische Verlängerung:</strong> Das Abonnement verlängert sich automatisch um die jeweilige Laufzeit, sofern es nicht rechtzeitig gekündigt wird.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">§ 5 Datenschutz</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Der Betreiber verarbeitet personenbezogene Daten gemäß der Datenschutzerklärung, die unter <Link href="/privacy" className="text-blue-600 hover:underline">/privacy</Link> einsehbar ist.</li>
              <li>Mit der Registrierung willigt der Nutzer in die Datenverarbeitung gemäß der Datenschutzerklärung ein.</li>
              <li>Der Nutzer hat das Recht, seine gespeicherten Daten jederzeit einzusehen, zu ändern oder zu löschen.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">§ 6 Pflichten des Nutzers</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Der Nutzer verpflichtet sich:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Wahrheitsgemäße Angaben bei der Registrierung zu machen</li>
                  <li>Zugangsdaten (Passwort) geheim zu halten</li>
                  <li>Die App nicht für rechtswidrige Zwecke zu nutzen</li>
                  <li>Keine schädlichen Inhalte (Malware, Viren) hochzuladen</li>
                </ul>
              </li>
              <li>Bei Verdacht auf missbräuchliche Nutzung behält sich der Betreiber das Recht vor, das Nutzerkonto zu sperren oder zu löschen.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">§ 7 Haftung</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li><strong>Der Betreiber haftet unbeschränkt für:</strong> Vorsatz und grobe Fahrlässigkeit, Verletzung von Leben, Körper und Gesundheit, Garantieversprechen, Ansprüche nach dem Produkthaftungsgesetz.</li>
              <li>Bei leichter Fahrlässigkeit haftet der Betreiber nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten). Die Haftung ist auf den vertragstypischen, vorhersehbaren Schaden begrenzt.</li>
              <li><strong>Der Betreiber haftet nicht für:</strong> Schäden durch höhere Gewalt, Datenverluste aufgrund technischer Störungen, Schäden durch falsche Angaben des Nutzers, Inhalte, die vom Nutzer eingestellt werden.</li>
              <li>Die Haftung für den Verlust von Daten beschränkt sich auf den Aufwand einer Wiederherstellung aus vorhandenen Datensicherungen.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">§ 8 Gewährleistung</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Die App wird "wie besehen" und "wie verfügbar" bereitgestellt. Der Betreiber übernimmt keine Gewährleistung für die ständige Verfügbarkeit.</li>
              <li>Sollte die App trotz Zahlung nicht nutzbar sein, steht dem Nutzer das gesetzliche Minderungsrecht zu.</li>
              <li>Der Betreiber ist berechtigt, die App vorübergehend außer Betrieb zu nehmen (z.B. für Wartung), soweit dies zumutbar ist.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">§ 9 Urheberrecht und Nutzungsrechte</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Alle Inhalte der App (Software, Texte, Grafiken) sind urheberrechtlich geschützt.</li>
              <li>Mit dem Hochladen von Bildern räumt der Nutzer dem Betreiber ein einfaches, nicht-exklusives Nutzungsrecht ein, um die Bilder in der App anzuzeigen und zu speichern. Dies gilt nicht für öffentliche Darstellungen oder Weitergabe an Dritte.</li>
              <li>Der Nutzer kann seine eigenen Daten jederzeit exportieren.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">§ 10 Änderung der AGB</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Der Betreiber behält sich vor, diese AGB zu ändern.</li>
              <li>Änderungen werden dem Nutzer per E-Mail oder in der App mindestens 30 Tage vor Inkrafttreten mitgeteilt.</li>
              <li>Widerspricht der Nutzer nicht innerhalb von 30 Tagen, gilt die Änderung als angenommen.</li>
              <li>Bei wesentlichen Änderungen kann der Nutzer das Abonnement zum Zeitpunkt des Inkrafttretens der Änderungen kündigen.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">§ 11 Salvatorische Klausel</h2>
            <p className="text-gray-700">Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt der Vertrag im Übrigen wirksam. An die Stelle der unwirksamen Bestimmung tritt, soweit verfügbar, die gesetzliche Regelung.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">§ 12 Gerichtsstand und anwendbares Recht</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.</li>
              <li>Gerichtsstand ist Frankfurt am Main, sofern der Nutzer Kaufmann, eine juristische Person des öffentlichen Rechts oder ein öffentlich-rechtliches Sondervermögen ist.</li>
              <li>Für Verbraucher gilt: Der Verbraucher kann sein Wahlrecht gemäß § 38 Nr. 1 ZPO ausüben.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Kontakt</h2>
            <p className="text-gray-700">Bei Fragen zu diesen AGB kontaktieren Sie uns unter:</p>
            <p className="text-gray-700 mt-2">E-Mail: florian@catchlog.app</p>
          </section>

          <p className="text-sm text-gray-500 mt-8 pt-8 border-t"><em>Letzte Aktualisierung: März 2026</em></p>
        </div>
      </div>
    </div>
  );
}
