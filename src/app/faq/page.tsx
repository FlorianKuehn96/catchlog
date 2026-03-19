'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  category: 'allgemein' | 'fang-eintragen' | 'gewässer' | 'daten' | 'technik';
}

const faqs: FAQItem[] = [
  {
    question: 'Was ist CatchLog?',
    answer: 'CatchLog ist ein digitales Fangbuch für Angler. Du kannst deine Fänge erfassen, verwalten, analysieren und auf einer Karte visualisieren. Die App zeigt dir automatisch Wetterdaten und den Sonnenstand zum Zeitpunkt deines Fangs an.',
    category: 'allgemein',
  },
  {
    question: 'Ist CatchLog kostenlos?',
    answer: 'Ja, CatchLog ist für den persönlichen Gebrauch komplett kostenlos. Du kannst unbegrenzt Fänge und Gewässer speichern. Alle Daten gehören dir und du kannst sie jederzeit als CSV exportieren.',
    category: 'allgemein',
  },
  {
    question: 'Werden meine Daten verkauft?',
    answer: 'Nein, niemals. Deine Fangdaten sind privat und werden nicht an Dritte verkauft oder weitergegeben. Wir speichern nur das nötigste für den Betrieb der App. Details findest du in unserer Datenschutzerklärung.',
    category: 'allgemein',
  },
  {
    question: 'Wie erfasse ich einen neuen Fang?',
    answer: `1. Gehe zum Dashboard\n2. Wähle das Gewässer aus (oder erstelle ein neues)\n3. Gib die Fischart ein (z.B. "Hecht")\n4. Trage Länge und Gewicht ein (eines berechnet sich automatisch)\n5. Optional: Füge Köder, Technik, Wetter und Notizen hinzu\n6. Klicke auf "Fang speichern"`,
    category: 'fang-eintragen',
  },
  {
    question: 'Wie funktioniert die automatische Gewichtsberechnung?',
    answer: 'Wenn du die Länge eines Fisches eingibst, berechnet CatchLog automatisch das geschätzte Gewicht basierend auf art-spezifischen Faktoren. Die Formel lautet: Gewicht(kg) = Länge(cm)³ / Faktor. Du kannst das Gewicht aber auch manuell eingeben oder korrigieren.',
    category: 'fang-eintragen',
  },
  {
    question: 'Wie kann ich die GPS-Position meines Fangs speichern?',
    answer: 'Beim Eintragen eines Fangs kannst du die Option "Aktuelle Position als Fangort" aktivieren. Die App fragt dann nach Erlaubnis für deinen Standort und speichert die exakten Koordinaten. Du kannst die Position später auch auf der Karte korrigieren.',
    category: 'fang-eintragen',
  },
  {
    question: 'Wie erstelle ich ein neues Gewässer?',
    answer: `1. Gehe im Dashboard zum Tab "Gewässer"\n2. Klicke auf "Neues Gewässer"\n3. Gib einen Namen ein (z.B. "Mühlensee")\n4. Wähle den Gewässertyp (See, Fluss, Teich, etc.)\n5. Optional: Füge die GPS-Koordinaten hinzu (per Karte klicken oder manuell eingeben)\n6. Speichern`,
    category: 'gewässer',
  },
  {
    question: 'Kann ich ein Gewässer löschen?',
    answer: 'Ja, gehe zum Tab "Gewässer", klicke auf das Gewässer, das du löschen möchtest, und dann auf den roten "Löschen"-Button. Achtung: Alle Fänge, die diesem Gewässer zugeordnet sind, bleiben erhalten, zeigen aber "Unbekannt" als Gewässer an.',
    category: 'gewässer',
  },
  {
    question: 'Wie bearbeite ich einen bereits gespeicherten Fang?',
    answer: 'Gehe zum Tab "Meine Fänge", finde den Fang in der Liste und klicke auf das ✏️-Symbol. Das Formular öffnet sich mit den vorhandenen Daten, die du jetzt bearbeiten kannst.',
    category: 'fang-eintragen',
  },
  {
    question: 'Wie exportiere ich meine Fänge?',
    answer: 'Gehe zum Tab "Statistik" und klicke auf "CSV Exportieren". Alle deine Fänge werden als CSV-Datei heruntergeladen, die du in Excel oder anderen Programmen öffnen kannst. Die Datei enthält alle Details inklusive Wetter und Sonnenstand.',
    category: 'daten',
  },
  {
    question: 'Sind meine Daten sicher?',
    answer: 'Ja, wir verwenden moderne Sicherheitsstandards:\n• SSL/TLS-Verschlüsselung für alle Datenübertragungen\n• Sichere OAuth-Authentifizierung via Google\n• Keine Speicherung von Passwörtern (nur OAuth)\n• Keine Weitergabe an Dritte\n• Du kannst deinen Account jederzeit löschen',
    category: 'daten',
  },
  {
    question: 'Wie lösche ich meinen Account?',
    answer: 'Gehe zu deinem Profil (👤 im Menü oben rechts), scrolle nach unten und klicke auf "Account löschen". Alle deine Daten werden dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden!',
    category: 'daten',
  },
  {
    question: 'Funktioniert CatchLog offline?',
    answer: 'CatchLog ist eine Web-App und benötigt eine Internetverbindung. Wenn du offline bist, wird ein "Offline-Modus"-Badge angezeigt. Deine bereits gespeicherten Daten bleiben im Browser-Cache verfügbar, aber du kannst keine neuen Fänge hinzufügen.',
    category: 'technik',
  },
  {
    question: 'Welche Browser werden unterstützt?',
    answer: 'CatchLog funktioniert in allen modernen Browsern:\n• Chrome (empfohlen)\n• Firefox\n• Safari\n• Edge\n\nFür die beste Erfahrung nutze Chrome oder Firefox auf dem Smartphone.',
    category: 'technik',
  },
  {
    question: 'Gibt es eine App für iOS oder Android?',
    answer: 'Aktuell ist CatchLog eine Web-App, die im Browser läuft. Du kannst sie aber als "Web-App" zum Home-Screen hinzufügen:\n\n**iPhone/iPad:** Safari → Teilen-Button → "Zum Home-Bildschirm"\n**Android:** Chrome → Menü (3 Punkte) → "Zum Startbildschirm hinzufügen"',
    category: 'technik',
  },
  {
    question: 'Wie funktioniert die Karte?',
    answer: 'Die Karte zeigt alle deine Gewässer und Fänge mit Koordinaten an:\n• Blaue Marker = Gewässer\n• Grüne Marker = Fänge\n• Roter Marker = Dein aktueller Standort\n• Klicke auf Marker für Details\n• Zoome mit Mausrad oder Pinch-Gesten',
    category: 'gewässer',
  },
  {
    question: 'Was bedeuten die verschiedenen Sonnenstände?',
    answer: 'CatchLog zeigt den Sonnenstand zum Zeitpunkt deines Fangs an:\n• 🌅 Morgendämmerung (Dawn)\n• ☀️ Tag (Stunden nach Sonnenaufgang)\n• 🌇 Abenddämmerung (Dusk)\n• 🌙 Nacht\n\nDiese Information kann helfen, herauszufinden, wann Fische besonders aktiv sind.',
    category: 'fang-eintragen',
  },
];

const categories = [
  { key: 'allgemein', label: 'Allgemein', emoji: '🎣' },
  { key: 'fang-eintragen', label: 'Fang eintragen', emoji: '🐟' },
  { key: 'gewässer', label: 'Gewässer', emoji: '💧' },
  { key: 'daten', label: 'Daten & Export', emoji: '💾' },
  { key: 'technik', label: 'Technik & Geräte', emoji: '📱' },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>('allgemein');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(faq => faq.category === activeCategory);

  const formatAnswer = (answer: string) => {
    return answer.split('\n').map((line, i) => (
      <p key={i} className={i > 0 ? 'mt-2' : ''}>
        {line}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Zurück zum Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Häufig gestellte Fragen</h1>
          <p className="text-gray-600">
            Hier findest du Antworten auf die wichtigsten Fragen zu CatchLog.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategory(cat.key);
                setOpenIndex(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-2">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 text-gray-700">
                  <div className="pt-2 border-t border-gray-100">
                    {formatAnswer(faq.answer)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No results */}
        {filteredFaqs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Keine Fragen in dieser Kategorie vorhanden.
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Deine Frage nicht dabei?
          </h2>
          <p className="text-gray-700 mb-4">
            Schreib mir eine E-Mail und ich helfe dir gerne weiter.
          </p>
          <a
            href="mailto:florian@catchlog.app"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            📧 florian@catchlog.app
          </a>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-gray-700">
            Datenschutz
          </Link>
          <span>·</span>
          <Link href="/impressum" className="hover:text-gray-700">
            Impressum
          </Link>
          <span>·</span>
          <Link href="/cookies" className="hover:text-gray-700">
            Cookies
          </Link>
        </div>
      </div>
    </div>
  );
}
