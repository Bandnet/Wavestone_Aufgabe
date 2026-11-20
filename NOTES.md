# Notizen

> Fülle diese Datei während der Arbeit aus. Kurz und ehrlich ist besser als lang und poliert.

**Gewähltes Backend:** Node.js 

## Bugs

| #   | Symptom                                    | Ursache | Fix (Dateien / was geändert) |
| --- | ------------------------------------------ | ------- | ---------------------------- |
| 1   |  Tasks weden nicht angezeigt im frontend                                          | fehlender await in tasks.js        |   tasks.js: den await hinzufügen                        |
| 2   |  Tasks werden nicht priorisiert                                          |  Die nummer ist ein string une kein Number weswegen es falsch priorisiert wird       |  Task.js: (noch für anzeige tasksService.js TaskForm.jsx ) wechsle die Task prioritäts Nummer von string zu Number                           |
| 3   |   Beim erstellen von Tasks mit duedate wurde der tag davor angezeigt                                         |  konventieren von reines Datum YYYY-MM-DD mit lokarer zeit zu UTC -> probleme mit zeitzone       |   Backend: taskService: Datum in UTC-Mitternacht validieren/konvertieren und toDto als YYYY-MM-DD ausgeben Frontend: date.js: Datums als String formatieren für anzeige                         |
| 4   |                                            |         |                              |
| 5   |                                            |         |                              |
| 6   |                                            |         |                              |
| …   | _(alles, was du sonst noch gefunden hast)_ |         |                              |

## Feature: Filtern und Sortieren

_Wie hast du es umgesetzt? Welche Entscheidungen hast du getroffen, und warum?_

## Tests

_Welche Tests hast du geschrieben, und was decken sie ab?_

## KI-Nutzung

- **Verwendete Tools:**
- **Wofür ich sie verwendet habe:**
- **Wo die KI falsch lag oder nicht geholfen hat, und wie ich es gemerkt habe:**

## Zeitaufwand

| Aufgabe   | Zeit |
| --------- | ---- |
| Setup     |      |
| Bugs      |      |
| Feature   |      |
| Tests     |      |
| NOTES.md  |      |
| **Total** |      |

## Offene Punkte / was ich mit mehr Zeit machen würde


Notiz für nacher: Tasks werden vom creat zeitpunkt nach priorität geordnet und nicht nach due date!!!