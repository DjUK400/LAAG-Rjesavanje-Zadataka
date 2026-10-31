# MM Rješavač · Prvi kolokvijum

Web aplikacija za vježbanje zadataka iz prvog dijela matematike (građevinski fakultet, Univerzitet u Banjoj Luci).
Svako poglavlje ima svoj tab: korisnik upiše zadatak i dobije rješenje sa postupkom, a u svakom tabu su i pravila/teorija tog poglavlja.

## Tabovi

| Tab | Šta rješava |
|---|---|
| **Matematička logika** | Tablica istinitosti sa svim međukolonama, tautologija / kontradikcija, ekvivalentnost dvije formule |
| **Skupovi** | Operacije sa konačnim skupovima (∪ ∩ \ Δ ᶜ, P(A), A×B), nalaženje svih skupova X, intervali na realnoj pravoj sa slikom, numerička provjera nejednačine, Venov dijagram (zadaci sa prebrojavanjem) |
| **Relacije** | Provjera R, S, AS, T sa kontraprimjerima, matrica i graf, klase ekvivalencije i količnički skup, konstrukcija relacije sa zadatim svojstvima, broj relacija na skupu od n elemenata |
| **Funkcije** | Preslikavanje / injekcija / sirjekcija / bijekcija na konačnim skupovima, inverz realne funkcije (linearna, razlomljeno-linearna, kvadratna), smjena f(ax+b), funkcije po dijelovima i kompozicija g∘f |
| **Indukcija** | Automatski dokaz identiteta sa zbirom, djeljivosti (polinomi i stepeni) i nejednakosti |

Kad zadatak nije podržan, aplikacija to javlja obavještenjem u uglu ekrana umjesto da da pogrešno rješenje.

## Objavljivanje na GitHub Pages

1. Napravi novi repozitorijum na GitHubu (npr. `MM-Rjesavac`).
2. Uploaduj `index.html` (i ovaj `README.md`) u korijen repozitorijuma.
3. **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `root` → Save.**
4. Nakon minut-dva sajt je na `https://<korisnik>.github.io/MM-Rjesavac/`.

Cijela aplikacija je jedan `index.html` fajl, radi i bez interneta (osim fontova) i na telefonu.

## Za razvoj

Izvorni kod je u `src/` (po jedan JS fajl za svaki tab). `python3 build.py` spaja sve u `index.html`.
