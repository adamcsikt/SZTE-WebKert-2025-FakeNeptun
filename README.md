# Fake Neptun

### Szegedi Tudományegyetem - Webfejlesztési Keretrendszerek (IB471G-\*)

**Készítette:** Adamcsik Tamás  
**Utolsó módosítás:** 2025-05-19

## 1. Bevezetés

A "**Fake Neptun**" egy projekt, amely a Szegedi Tudományegyetem Webfejlesztési Keretrendszerek (IB471G-\*) kurzusára készült. Célja egy egyszerűsített, tanulmányi rendszert utánzó webalkalmazás létrehozása, amely bemutatja a modern webes technológiák (Angular, Firebase) használatát. Az alkalmazás lehetővé teszi a felhasználók számára, hogy regisztráljanak, bejelentkezzenek, megtekintsék és szerkesszék profiljukat, valamint egy egyszerűsített dashboardon keresztül érjék el a legfontosabb funkciókat.

Az alkalmazás elérhető a következő címen: [https://fakeneptun-50e1d.web.app/](https://fakeneptun-50e1d.web.app/)

Teszteléshez használható felhasználói adatok:

-  Azonosító: `abc123`
-  Jelszó: `TesztPwd_`

## 2. Főbb Funkciók

-  **Felhasználói Authentikáció**: Regisztráció és bejelentkezés Firebase Auth segítségével.
-  **Profilkezelés**: Felhasználói adatok megtekintése és szerkesztése.
-  **Dashboard**: Áttekintő felület a legfontosabb információkkal (pl. közelgő események, eredmények, üzenetek).
-  **Felhasználó Lista és Részletek**: Adminisztrációs felület a regisztrált felhasználók megtekintésére.
-  **Reszponzív Design**: Az alkalmazás különböző képernyőméretekhez igazodik.
-  **Nemzetköziesítés**: Angol és magyar nyelv támogatása.
-  **Visszajelzés Küldése**: Lehetőség a felhasználóknak, hogy visszajelzést küldjenek a fejlesztőknek.

## 3. Technológiai Stack

**Frontend**:

-  Angular (v19.2.9)
-  TypeScript (v5.7.2)
-  Firebase (v11.7.3) – Auth, Firestore, Hosting
-  Angular Material (v19.2.11) – UI komponensek
-  RxJS (v7.8.0)

**Backend**:

-  Firebase (Firestore adatbázis, Firebase Authentication)

**Verziókezelés**:

-  Git & GitHub

## 4. Projekt Struktúra

A projekt frontend része az `frontend/` mappában található.

Fontosabb mappák és fájlok a `frontend` részen belül:

-  `src/`: Angular alkalmazás forráskódja
-  `src/app/`: Angular komponensek, oldalak, modulok
-  `src/assets/`: Statikus fájlok (képek, fordítások stb.)
-  `src/environments/`: Firebase és környezeti beállítások
-  `angular.json`: Angular projekt konfiguráció
-  `package.json`: npm függőségek és parancsok

## 5. Telepítés és Futtatás

1. **Klónozd a repót**:

   ```bash
   git clone https://github.com/fakeneptun/fakeneptun.git
   ```

2. **Telepítsd a szükséges függőségeket**:

   ```bash
   cd frontend
   npm install
   ```

3. **Indítsd el a fejlesztői szervert**:
   ```bash
   ng serve
   ```

Az alkalmazás elérhető lesz a [http://localhost:4200](http://localhost:4200) címen.

## 6. Buildelés

Futtasd az alábbi parancsot egy optimalizált build készítéséhez:

```bash
ng build --configuration=production
```

A build fájlok a `dist/` mappába kerülnek, ahonnan a Firebase vagy más szolgáltató is kiszolgálhatja őket.

## 7. Firebase Integráció

A projekt Firebase szolgáltatásokat használ:

-  **Firebase Auth**: Felhasználói regisztráció és bejelentkezés
-  **Firebase Firestore**: Felhasználói adatok tárolása
-  **Firebase Hosting**: Alkalmazás publikálása

A hitelesítési adatok a `src/environments/environment.ts` fájlban konfigurálhatók.

## 8. Fontosabb Függőségek

-  `@angular/material`: Material Design UI elemek
-  `firebase`: Firebase SDK
-  `@angular/fire`: Angular integráció a Firebase-hez
-  `ngx-translate`: Nemzetköziesítés (i18n) támogatása
-  `rxjs`: Reaktív programozás

## 9. Authentikáció és Autorizáció

A Firebase Authentication modul kezeli a hitelesítést.  
Route Guardok segítségével korlátozott hozzáférés biztosított a nem jogosult felhasználóknak.

## 10. Nemzetköziesítés (i18n)

Az alkalmazás két nyelvet támogat: magyar és angol.
Az `assets/i18n/` mappában találhatók a fordítások JSON formátumban.
A nyelvváltás dinamikusan történik az Angular `TranslateService` segítségével.
