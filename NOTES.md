# Notizen

> Fülle diese Datei während der Arbeit aus. Kurz und ehrlich ist besser als lang und poliert.

**Gewähltes Backend:** Node.js 

## Bugs

| # | Symptom | Ursache | Fix (Dateien / vorgenommene Änderungen) |
|---|---|---|---|
| 1 | Tasks werden im Frontend nicht angezeigt. | Fehlendes `await` in `tasks.js`. | **tasks.js:** Das fehlende `await` wurde ergänzt. |
| 2 | Tasks werden nicht korrekt priorisiert. | Die Prioritätsnummer wurde als String statt als Number gespeichert bzw. verarbeitet. Dadurch wurde die Priorisierung fehlerhaft durchgeführt. | **Task.js**, **tasksService.js** und **TaskForm.jsx:** Die Task-Priorität wurde von String auf Number umgestellt. |
| 3 | Beim Erstellen von Tasks mit einem Fälligkeitsdatum wurde ein Tag früher angezeigt. | Die Konvertierung eines reinen Datums (`YYYY-MM-DD`) in einen UTC-Zeitstempel führte aufgrund von Zeitzonenunterschieden zu einer Datumsverschiebung. | **Backend – taskService:** Das Datum wird auf UTC-Mitternacht validiert und konvertiert. Die `toDto`-Methode gibt das Datum im Format `YYYY-MM-DD` zurück. **Frontend – date.js:** Datumswerte werden für die Anzeige als Strings formatiert, um Zeitzonenverschiebungen zu vermeiden. |
| 4 | Die Checkbox zeigt nach dem Abhaken nicht den gespeicherten Status an. Nach einem Reload wird der Task jedoch als erledigt angezeigt. | `findByIdAndUpdate()` gab ohne entsprechende Option standardmässig das alte Dokument vor dem Update zurück. | **backend-node/src/services/taskService.js:** Die Option `{ new: true }` wurde bei `findByIdAndUpdate()` ergänzt, damit die API das aktualisierte Dokument zurückliefert. |
| 5 | `GET /api/tasks/123` verursacht einen HTTP-500-Fehler. | Ungültige IDs lösen einen Mongoose-`CastError` aus, der bisher nicht korrekt behandelt wurde. | **backend-node/src/services/taskService.js:** Die ID wird mit `mongoose.isValidObjectId()` überprüft. Ungültige IDs liefern nun einen HTTP-400-Fehler zurück. |
| 6 | Beim Aktualisieren des Titels verschwindet das Fälligkeitsdatum. | Ein falsches partielles Update hätte Felder entfernen können, die nicht im Request enthalten waren. | **Keine Codeänderung notwendig:** In `backend-node/src/services/taskService.js` werden nur übermittelte Felder in `data` aufgenommen. Dadurch bleibt `dueDate` erhalten. Das Verhalten wurde mit einem PATCH-Test bestätigt. |



## Feature: Filtern und Sortieren

Die Abfrageparameter status, minPriority, sort und order werden über das Frontend GET /api/tasks übergeben.

- `status` filtert nach offenen oder erledigten Tasks.
- `minPriority` filtert auf Prioritäten ab dem gewählten Mindestwert.
- `sort` unterstützt Priorität, Fälligkeitsdatum und Erstellungsdatum.
- `order` steuert aufsteigende oder absteigende Reihenfolge.
- Der Standardwert ist `priority` mit absteigender Reihenfolge.
- Ungültige Werte werden vom Backend mit HTTP 400 zurückgewiesen.

Die Filterung und Sortierung passieren in der MongoDB-Abfrage in
`backend-node/src/services/taskService.js` über `Task.find(filter).sort(...)`.
Das Frontend lädt bei jeder Änderung eines Filters oder der Sortierung erneut über
`frontend/src/App.jsx` und `frontend/src/api.js`. Die Liste wird dadurch nicht zusätzlich
im Browser gefiltert.

Bei der Sortierung habe ich `_id: -1` als zusätzlichen Tie-Breaker verwendet. Dadurch erhält
ein komplett identischer Sortierwert eine reproduzierbare Reihenfolge.

## Tests

_Welche Tests hast du geschrieben, und was decken sie ab?_

- **Priority sorting:** Prüft, dass Tasks mit höherer Priorität zuerst angezeigt werden (Bug 2).
- **Priority filtering:** Prüft, dass mit `minPriority=7` nur Tasks mit Priorität 7 oder höher zurückgegeben werden (Feature).
- **Ungültige ID:** Prüft, dass `GET /api/tasks/123` HTTP 400 mit dem Fehlerformat `{ "error": "<Meldung>" }` zurückgibt (Bug 5).
- **Partielles PATCH-Update:** Reproduziert Bug 6 und prüft, dass ein Titel-Update das vorhandene `dueDate` nicht entfernt.

## KI-Nutzung

- **Verwendete Tools:** GitHub Copilot
- **Wofür ich sie verwendet habe:** Unterstützung bei der Fehlersuche, Codeüberprüfung, Lösungsvorschläge und Ideensammlung für neue Features. Kleinere Implementierungen sowie das Frontend des Features «Filtern und Sortieren» wurden mithilfe von Copilot umgesetzt. Den grössten Teil des Codes habe ich selbst geschrieben.
- **Wo die KI falsch lag oder nicht geholfen hat:** Es gab keinen klaren einzelnen Fehler. Nicht jeder Vorschlag passte direkt zur bestehenden Projektstruktur und wurde deshalb angepasst oder verworfen.

## Zeitaufwand

| Aufgabe   | Zeit |
| --------- | ---- |
| Setup     |  10 min  |
| Bugs      |  2 h 20 min    |
| Feature   |  1 h 45 min    |
| Tests     |  45 min    |
| NOTES.md  |  35 min   |
| **Total** |  5 h 35 min    |

## Offene Punkte / was ich mit mehr Zeit machen würde

Wenn ich mehr Zeit für das Projekt hätte, würde ich mich damit beschäftigen, weitere Tests zu schreiben, um mehr Randbedingungen abzudecken. Dadurch könnte ich bei zukünftigen Änderungen schneller erkennen, ob weiterhin alles korrekt funktioniert.