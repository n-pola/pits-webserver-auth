# Authentisierungsverfahren bei Webservern

## PITS SS20 George Iyawe, Nils Polarek

### Installation
1. `.env` Datei im Ordner Backend anlegen
2. `.env` Datei mit Secret Key für JWT Token füllen `JWT_SECRET_KEY = "xxx..."`
3. `.env` Datei mit URL der MongoDB Datenbank füllen `DATABASE_URL = "xxx..."`

* Backend Server mit geschützten Ressourcen im Ordner `Backend`mit dem Befehl `node index.js`oder `npm run dev`ausführen
  * Seminare können mit der Datei `fillSeminar.js`eingefügt werden
  * Seminar können mit einem POST auf `/seminare`hinzugefügt werden, der User muss in der DB den Boolean Wert `isAdmin` auf `true`gesetzt haben
* Frontend Server wird im Ordner `frontend` mit dem Befehl `npm run serve` gestartet werden

Das Seminarsystem in nun unter http://localhost:8080 erreichbar
