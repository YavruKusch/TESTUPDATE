# Wrong Way: Don’t be mad — Projekt-Status

## Letzte Aktualisierung

Juni 2025 — nach Launch, 60k Video-Views, ~5-10 gleichzeitige Spieler live.

-----

## Aktueller Stand

Das Spiel ist **live und öffentlich** unter wrongway.app. Ein Video hat ~60k Aufrufe generiert. Derzeit spielen durchgehend 5-10 Spieler gleichzeitig. Das Spiel ist stabil und vollständig spielbar.

-----

## Deployment & Infrastruktur

- **Domain:** wrongway.app (Namecheap → GitHub Pages, HTTPS aktiv)
- **Hosting:** GitHub Pages (Repo: yavrukusch.github.io/WrongWay)
- **Workflow:** index.html bearbeiten → auf GitHub hochladen → fertig (~1 Min)
- **Firebase-Projekt:** wrong-way-don-t-be-mad (Europe West 1)
- **Firebase-Plan:** Blaze (Pay-as-you-go, nach Upgrade von Spark)
  - Kein Verbindungs-Limit mehr (Spark hatte 100 gleichzeitige Verbindungen)
  - Budget-Alarm auf 10€/Monat gesetzt
  - Kosten bei aktuellem Scale: ~0-2€/Monat

-----

## Geplanter Umzug (WICHTIG)

**Datum:** 1. August 2025 → Yalova, Türkei (dauerhaft)

**Was nach dem Umzug zu tun ist:**

1. Neues Google Cloud Billing-Konto mit türkischer Adresse + Karte erstellen
1. Firebase Console → Projekteinstellungen → Abrechnung → auf neues türkisches Konto umlinken
1. Altes deutsches Billing-Konto schließen
1. Impressum-Platzhalter in der App mit echter Adresse füllen (`[Name wird ergaenzt]`, `[Adresse wird ergaenzt]`)
1. Türkischen Steuerberater konsultieren vor erstem Umsatz

**Wichtig:** Neues Billing-Konto braucht KEINE neue Gmail-Adresse. Firebase-Daten bleiben vollständig erhalten. Nur die Zahlungsverbindung wechselt. Dauert ~5 Minuten.

**Rechtliches:** DSGVO gilt für EU-Nutzer unabhängig vom Betreiber-Standort. KVKK für türkische Nutzer. Monetarisierung: Paddle als Merchant of Record empfohlen (übernimmt EU-VAT).

-----

## Abgeschlossene Sicherheits- und Qualitätsverbesserungen

### Firebase Authentication

- Firebase Auth Email/Password statt SHA-256-Hash in RTDB
- `account.key` = Firebase Auth `uid`
- E-Mail-Verifikation bei Registrierung (Konto erst nach Bestätigung nutzbar)
- Passwort zurücksetzen via `sendPasswordResetEmail`
- Google-Login (uid-basiert)
- Auto-Login via `onAuthStateChanged`

### Firebase Security Rules (aktiv)

- `ww_profiles/$uid`: Schreiben nur eigene uid
- `ww_usernames`: Lesen öffentlich, Schreiben auth != null
- `ww_leaderboard/$uid`: Schreiben nur eigene uid
- `ww_presence/$uid`: Schreiben nur eigene uid
- `ww_friends/$uid`, `ww_freq`, `ww_invites`: privat
- `ww_ranked_queue/confirm/spec/spec_emote`: auth != null
- `$other` (Spielstände, Lobbys): auth != null

### App Check

- reCAPTCHA v3 Site Key im Code: `6LfixwwtAAAAAIT9EyO_TNX_oNh6rY-fODqhkgqO`
- In Firebase Console registriert (Secret Key hinterlegt)
- **Status: Monitoring-Modus** (Erzwingung war aktiv, hat App blockiert → deaktiviert)
- **TODO:** wrongway.app in reCAPTCHA-Admin-Konsole als Domain prüfen/eintragen, dann Erzwingung erneut aktivieren

### Qualität & UX

- Server-voll-Banner + Bot-Fallback bei >100 Verbindungen (jetzt mit Blaze obsolet)
- Reconnect-Overlay bei Verbindungsverlust im Spiel
- Konto löschen (DSGVO-konform, Sicherheitsabfrage mit “LÖSCHEN” eintippen)
- Konto-Übersicht im Profil (Name, E-Mail, Passwort, Farbe)
- Impressum/AGB/Datenschutz Screen (Platzhalter für Adresse noch ausfüllen)

### Spielmechanik-Fixes

- **boardFlip:** Nur im Duel-Modus aktiv (Race: beide sehen Brett von unten nach oben)
- **Rematch:** Rollen tauschen immer (deterministisch, nicht zufällig)
- **Rematch-Namen:** Werden beim Rollentausch korrekt mitgetauscht
- **Replay:** Letzter Zug (Ziel-Einlauf) wird jetzt korrekt gespeichert und angezeigt
- **Feier-Animation:** War für alle Modi kaputt (`if(skipAnim)` fehlte), jetzt gefixt
- **Wand-Platzierung:** Grenzprüfung entfernt, snapWall klemmt intern (alle Geräte/Boardgrößen)
- **End-Screen:** Profil-Button, Serien-Punktestand, Freundschaftsanfrage, immer Namen

### Übersetzungen

- Alle 4 Sprachen komplett: EN (Standard), DE, TR, FR
- Neue Keys: Auth-Texte, Server-Status, Reconnect, Profil, viewProfile

-----

## Service Worker

- Datei: `sw.js` im GitHub-Repo (separate Datei, nicht in index.html)
- Cache-Version: `wrongway-v4`
- **Nach jedem größeren Update:** `v4` → `v5` → `v6` usw. in sw.js auf GitHub direkt editieren
- Ohne Version-Bump sehen Spieler mit gecachter App ggf. alte Version

-----

## Noch ausstehend

### Mit PC (nach Umzug oder sobald PC verfügbar)

1. **E-Mail-Infrastruktur** (Priorität: Hoch)
- Verifikationsmails landen im Spam, Link kein tippbarer Button
- Fix: Resend.com (kostenlos bis 3000/Monat) + Cloud Function + `noreply@wrongway.app`
- DNS: SPF + DKIM auf Namecheap
1. **App Check Erzwingung** (Priorität: Mittel)
- Erst: google.com/recaptcha/admin → wrongway.app als Domain eintragen
- Dann: Firebase Console → App Check → Realtime Database → Erzwingung aktivieren
1. **Cloud Functions für ELO/Stats-Schutz** (Priorität: Mittel)
- Aktuell schreibt Client eigene ELO (nur uid-beschränkt, Wert nicht validiert)
- Server-seitige Berechnung nach Spielende
1. **Chat-Moderation** (Priorität: Niedrig)
- Kein Wortfilter im Lobby-Chat
- Einfachen Filter einbauen sobald Nutzerbasis wächst
1. **Monetarisierung** (Priorität: nach Umzug)
- Optionen: Kosmetik (Farben/Skins), werbefrei, Battle Pass
- Zahlungen: Paddle als Merchant of Record
1. **Türkisch/Französisch i18n** (Priorität: Niedrig)
- Alle Haupttexte übersetzt, evtl. noch vereinzelte Keys fehlend

-----

## Technische Constraints (IMMER beachten)

- **Kein optional chaining (`?.`) oder nullish coalescing (`??`)** — Babel-standalone CDN
- **Kein IIFE in JSX** — crasht den Browser-Renderer
- **Kein `return<`** ohne Leerzeichen in JSX
- **`\uXXXX` in JSX-Textknoten** zeigt literal an → in `{'\uXXXX'}` wrappen
- **Babel-Validierung Pflicht** nach jeder Änderung (Node.js + @babel/core)
- **Niemals Ganzdatei neu schreiben** — immer str_replace
- **`account.key` = Firebase Auth uid** (seit Auth-Migration)
- **`stoGet/stoSet`** serialisieren als JSON-String → Firebase-Rules können Inhalte nicht inspizieren
- **`IIFE in JSX` ist verboten** — Variablen vor dem return berechnen

## Übersetzungs-Pflicht

Jedes neue Feature mit Text MUSS in allen 4 Sprachen übersetzt werden:

- **en** (Standard/Fallback), **de**, **tr**, **fr**
- Neue Keys in `I18N_EXT` einfügen (nicht in `I18N`)
- `t()` fällt bei fehlenden Keys auf `en` zurück, dann auf den Key selbst

## Firebase-Datenpfade

|Pfad                       |Inhalt                          |
|---------------------------|--------------------------------|
|`ww_profiles/<uid>`        |Profil (Name, Farbe, Stats, ELO)|
|`ww_usernames/<normName>`  |`{uid, name}` Index             |
|`ww_leaderboard/<uid>`     |ELO-Rangliste                   |
|`ww_presence/<uid>`        |Online-Status                   |
|`ww_friends/<uid>`         |Freundesliste                   |
|`ww_freq/<toUid>/<fromUid>`|Freundschaftsanfragen           |
|`ww_invites/<uid>`         |Spiel-Einladungen               |
|`ww_ranked_queue/<uid>`    |Matchmaking                     |
|`barricade_game_<lobbyId>` |Aktiver Spielstand              |
|`barricade_2v2_open`       |Öffentliche Lobbys              |