[README.md](https://github.com/user-attachments/files/33047858/README.md)
# SpeleoGIS

Serverloses Web-GIS für das Höhleninventar (Gamsalp). Statische Geodaten werden ohne GIS-Server per HTTP Range Requests direkt aus PMTiles und FlatGeobuf gelesen. Supabase dient nur als schmale Schreib-Datenbank für Live-Editierung.

## Inhalt

```
index.html      App (MapLibre GL JS, PMTiles, FlatGeobuf, Supabase JS via CDN)
sw.js           Service Worker (Offline-Start)
data/
  drohnenortho.pmtiles              Drohnen-Orthofoto (WebP, Zoom 14–20)
  zonen.fgb                         Gamsalp-Forschungszonen
  sgh_verzeichnis.fgb               SGH-Verzeichnis Kt. SG
  hoehleninventar.fgb               Höhleninventar (nur Anzeige)
  hoehleninventar_editierbar.geojson  Höhleninventar zum Import in die Edit-Ebene
```

Alle Daten sind in WGS84 (EPSG:4326, bzw. Web Mercator bei den PMTiles).

## Inbetriebnahme

1. Repo auf GitHub anlegen, alle Dateien im Ordnerlayout oben hochladen.
2. Settings → Pages → Branch `main`, Ordner `/ (root)`.
3. Seite öffnen: `https://<user>.github.io/<repo>/`

Ohne Konfiguration zeigt die App Basiskarte, Orthofoto und die drei FlatGeobuf-Layer (Standardpfade `data/...`). Die Karte ist dann read-only plus lokales Editieren.

## Live-Editierung (Supabase)

1. Supabase-Projekt anlegen (Free Tier).
2. SQL aus dem Kommentar im Kopf von `index.html` im SQL Editor ausführen (Tabelle `features`, Realtime aktivieren).
3. In der App → «Einstellungen»: Project URL und `anon`-Key eintragen → «Speichern & neu laden». Die Werte bleiben im Browser (localStorage).
4. Status oben rechts: `lokal` (kein Supabase), `verbunden`, `live` (Realtime aktiv), `· n offen` (noch nicht synchronisierte Änderungen).

**Achtung:** Die mitgelieferte Row-Level-Security-Policy erlaubt jedem mit dem Key Lesen und Schreiben. Vor produktivem Einsatz mit Supabase Auth einschränken.

## Bedienung

- **Punkt / Linie / Fläche:** Modus wählen, in die Karte tippen. Bei Linie/Fläche beendet ein Doppeltipp. Danach Name eingeben.
- **Objekt antippen:** Popup mit «Löschen».
- **Erstbefüllung:** «Import» → `data/hoehleninventar_editierbar.geojson` wählen. Die Höhlen liegen danach in der Edit-Ebene (orange), werden gesynct und lassen sich exportieren.

## Offline & QField

- Alle Edits werden zuerst in IndexedDB gespeichert und bei Verbindung zu Supabase gepusht.
- **Export** erzeugt eine GeoJSON-Datei (`id`, `base` = Stand beim Export, plus Attribute). Diese in QField bzw. QGIS laden.
- **Import** liest die in QField geänderte Datei zurück:
  - neues Objekt (ohne bekannte `id`) → wird hinzugefügt
  - lokal seit dem Export unverändert → Import überschreibt
  - auf beiden Seiten geändert → Merge: Attribute aus dem Import, Geometrie bleibt lokal
- Die Felder `id` und `base` in QField nicht ändern oder löschen.

## Eigene Datenquellen

Unter «Einstellungen» lassen sich PMTiles- und FlatGeobuf-URLs ersetzen (FlatGeobuf mehrere, durch Leerzeichen getrennt). Externe Hosts (GitHub Releases, Cloudflare R2, …) müssen CORS erlauben und den `Range`-Header unterstützen.

## Daten neu erzeugen

Die Dateien in `data/` stammen aus `DatenSpeleoGIS_1.gpkg` (Python: geopandas/pyogrio für FlatGeobuf, rasterio + rio-pmtiles für das Orthofoto).

Bekannte Lücken:
- Geologie1–3: in der GPKG eingetragen, aber ohne Tabellen, daher nicht enthalten.
- `Ortho_Drohne2019` nicht umgewandelt.
- SGH-Verzeichnis: 10 Zeilen ohne Koordinaten fehlen, vier Neuenalp-Einträge (SG 30/220–223) wurden von LV95 statt LV03 umgerechnet.

## Bekannte Einschränkungen

- Kein GeoPackage-Export, nur GeoJSON.
- Geometrien liegen in Supabase als jsonb, nicht als PostGIS-Geometrie.
- Konfliktlösung ist vereinfacht (Zeitstempel/Merge), keine feldweise Dreiwege-Auflösung.
- Basiskarte: OpenStreetMap-Standardtiles (Nutzungsbedingungen beachten).
