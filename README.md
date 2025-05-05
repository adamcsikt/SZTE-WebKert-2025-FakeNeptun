# Fake Neptun

### Szegedi Tudományegyetem - Webfejlesztési Keretrendszerek (IB471G-\*)

**Készítette:** Adamcsik Tamás  
**Utolsó módosítás:** 2025-04-30

## Projekt Leírása

## Stack

-  **Frontend:** Angular (v19.2.8), TypeScript, CSS
-  **Backend:** Node.js, Express.js
-  **Adatbázis:** MongoDB / local JSON fájl

## Fejlesztési Branch: `local-express-backend`

**Figyelem:** Ez egy speciális fejlesztési ág, amely lehetővé teszi az alkalmazás frontend és backend részének **együttes tesztelését helyi fejlesztői környezetben**. A frontend úgy van konfigurálva, hogy a lokálisan (`localhost:5000`-en) futtatott Express.js backend API-ját hívja meg. Erre azért van szükség, mert a backend komponens még nem került publikálásra hosztolt szerverre (Firebase).

## Telepítés és Futtatás

**Repository klónozása és Frontend beállítása:**

```bash
git clone https://github.com/adamcsikt/SZTE-WebKert-2025-FakeNeptun.git

cd ./SZTE-WebKert-2025-FakeNeptun

npm install / npm i

ng serve
```

_A frontend a `http://localhost:4200` címen fog futni._  
_(Megjegyzés: Jelenleg a `local-express-backend` branch releváns)_

**Backend klónozása és beállítása:**

**_A project root mappáján belül: (SZTE-WebKert-2025-FakeNeptun)_**

```bash
git clone -b local-express-backend https://github.com/adamcsikt/SZTE-WebKert-2025-FakeNeptun.git backend

cd ./backend

npm install / npm i

npm run dev
```

_A backend a `http://localhost:5000` címen fog futni._  
_(Megjegyzés: A backend-et nem kell megnyitni, elég ha a háttérben fut)_

## Használat

-  Az alkalmazásba való belépéshez használd a következő adatokat:
   -  **Felhasználónév:** `aaabbb`
   -  **Jelszó:** `testPwd`
-  Vagy:
   -  **Regisztrálj**

## Források és Inspiráció

-  **Vizuális referencia és koncepció:** [Neptun Hallgatói Web](https://neptun.szte.hu/hallgato/)
-  **Demó adatok generálása:** [Google Gemini](https://gemini.google.com/app)
-  **Felhasznált keretrendszerek dokumentációja:**
   -  [Angular.dev](https://angular.dev)
   -  [Express.js](https://expressjs.com)
