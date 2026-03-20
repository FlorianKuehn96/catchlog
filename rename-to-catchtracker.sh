#!/bin/bash
# ============================================================================
# CatchLog → CatchTracker Umbenennungs-Script
# ============================================================================
# 
# WARNUNG: Dieses Script führt folgende Änderungen durch:
# 1. Ersetzt alle Vorkommen von "catchlog" durch "catchtracker" (lowercase)
# 2. Ersetzt alle Vorkommen von "CatchLog" durch "CatchTracker" (CamelCase)
# 3. Ersetzt alle Vorkommen von "CATCHLOG" durch "CATCHTRACKER" (UPPERCASE)
# 4. Aktualisiert package.json Namen
# 5. Erstellt Backup-Verzeichnis
#
# Nutzung:
#   chmod +x rename-to-catchtracker.sh
#   ./rename-to-catchtracker.sh
#
# Nach Ausführung:
#   - Prüfe alle Änderungen in BACKUP/ und VERGLEICHE mit Original
#   - Bei Problemen: git checkout . oder aus Backup wiederherstellen
#   - Committe die Änderungen: git add -A && git commit -m "Rename to CatchTracker"
#
# ============================================================================

set -e  # Bei Fehler abbrechen

echo "=========================================="
echo "CatchLog → CatchTracker Umbenennung"
echo "=========================================="
echo ""
echo "Dieses Script wird folgende Änderungen durchführen:"
echo "  • catchlog → catchtracker (Dateien, Code, Config)"
echo "  • CatchLog → CatchTracker (Namen, Texte)"
echo "  • CATCHLOG → CATCHTRACKER (Env-Variablen)"
echo ""
echo "Backup wird erstellt in: ./BACKUP/"
echo ""
read -p "Fortfahren? (ja/nein): " confirm

if [ "$confirm" != "ja" ]; then
    echo "Abgebrochen."
    exit 0
fi

echo ""
echo "Starte Umbenennung..."
echo ""

# Backup-Verzeichnis erstellen
mkdir -p BACKUP
cp -r . BACKUP/ 2>/dev/null || true
echo "✓ Backup erstellt"

# Counter für Statistik
COUNTER=0

# Funktion: Ersetze in Dateien
replace_in_file() {
    local file="$1"
    if [ -f "$file" ]; then
        # Temporäre Datei erstellen
        temp_file=$(mktemp)
        
        # Ersetzungen durchführen
        sed -e 's/catchlog/catchtracker/g' \
            -e 's/CatchLog/CatchTracker/g' \
            -e 's/CATCHLOG/CATCHTRACKER/g' \
            "$file" > "$temp_file"
        
        # Prüfe ob sich etwas geändert hat
        if ! diff -q "$file" "$temp_file" > /dev/null 2>&1; then
            mv "$temp_file" "$file"
            echo "  ✓ $file"
            COUNTER=$((COUNTER + 1))
        else
            rm "$temp_file"
        fi
    fi
}

# Funktion: Dateien finden und verarbeiten
process_files() {
    local pattern="$1"
    
    find . -type f -name "$pattern" \
        ! -path "./.git/*" \
        ! -path "./node_modules/*" \
        ! -path "./.next/*" \
        ! -path "./BACKUP/*" \
        -print0 2>/dev/null | while IFS= read -r -d '' file; do
        replace_in_file "$file"
    done
}

echo ""
echo "1/5: Verarbeite Code-Dateien..."
process_files "*.ts"
process_files "*.tsx"
process_files "*.js"
process_files "*.jsx"
process_files "*.json"
process_files "*.md"
process_files "*.css"
process_files "*.scss"
process_files "*.html"
process_files "*.env*"
process_files "*.yaml"
process_files "*.yml"
process_files "*.txt"

echo ""
echo "2/5: Aktualisiere package.json..."
if [ -f "package.json" ]; then
    # package.json speziell behandeln
    sed -i 's/"name": "catchlog"/"name": "catchtracker"/g' package.json 2>/dev/null || true
    sed -i 's/"name": "CatchLog"/"name": "CatchTracker"/g' package.json 2>/dev/null || true
    echo "  ✓ package.json aktualisiert"
fi

echo ""
echo "3/5: Umbenenne Dateien und Verzeichnisse..."

# Verzeichnisse umbenennen (von unten nach oben, um verschachtelte zu behandeln)
find . -type d -name "*catchlog*" \
    ! -path "./.git/*" \
    ! -path "./node_modules/*" \
    ! -path "./.next/*" \
    ! -path "./BACKUP/*" \
    2>/dev/null | sort -r | while read -r dir; do
    newname=$(echo "$dir" | sed 's/catchlog/catchtracker/g; s/CatchLog/CatchTracker/g; s/CATCHLOG/CATCHTRACKER/g')
    if [ "$dir" != "$newname" ] && [ ! -e "$newname" ]; then
        mv "$dir" "$newname" 2>/dev/null && echo "  ✓ $dir → $newname"
    fi
done

# Dateien umbenennen
find . -type f -name "*catchlog*" \
    ! -path "./.git/*" \
    ! -path "./node_modules/*" \
    ! -path "./.next/*" \
    ! -path "./BACKUP/*" \
    2>/dev/null | while read -r file; do
    newname=$(echo "$file" | sed 's/catchlog/catchtracker/g; s/CatchLog/CatchTracker/g; s/CATCHLOG/CATCHTRACKER/g')
    if [ "$file" != "$newname" ] && [ ! -e "$newname" ]; then
        mv "$file" "$newname" 2>/dev/null && echo "  ✓ $file → $newname"
    fi
done

echo ""
echo "4/5: Prüfe GitHub Remote..."
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$REMOTE_URL" == *"catchlog"* ]]; then
    echo "  ! GitHub Repository URL enthält noch 'catchlog':"
    echo "    $REMOTE_URL"
    echo ""
    echo "    WICHTIG: Nach Ausführung dieses Scripts musst du:"
    echo "    1. Neues GitHub Repo 'catchtracker' erstellen"
    echo "    2. Remote URL ändern:"
    echo "       git remote set-url origin https://github.com/USERNAME/catchtracker.git"
    echo "    3. Oder: GitHub Repo umbenennen (Settings → Repository name)"
    echo ""
fi

echo ""
echo "5/5: Zusammenfassung..."
echo ""
echo "=========================================="
echo "Umbenennung abgeschlossen!"
echo "=========================================="
echo ""
echo "Nächste Schritte:"
echo ""
echo "1. Änderungen überprüfen:"
echo "   git status"
echo "   git diff"
echo ""
echo "2. Teste die App lokal:"
echo "   npm run dev"
echo ""
echo "3. Wenn alles funktioniert, committe:"
echo "   git add -A"
echo "   git commit -m 'Rename project from CatchLog to CatchTracker'"
echo "   git push"
echo ""
echo "4. Domain anpassen (wenn gekauft):"
echo "   - catchtracker.org DNS einrichten"
echo "   - Vercel Projekt ggf. neu verknüpfen"
echo ""
echo "5. Umgebungsvariablen prüfen:"
echo "   - .env.local aktualisieren falls nötig"
echo "   - Neue Secrets bei Vercel/GitHub setzen"
echo ""
echo "Backup liegt in: ./BACKUP/"
echo ""
echo "Bei Problemen: Backup wiederherstellen"
echo "   cp -r BACKUP/* ."
echo ""
