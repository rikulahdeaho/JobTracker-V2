# Search agenda — koko web-sovelluksen toteutussuunnitelma

Suunnitelma 5.10.2026. Search agenda on valittu visuaaliseksi suunnaksi.
Toteutus tehtiin käyttäjän hyväksynnän jälkeen 5.10.2026. Tämä dokumentti säilyttää
hyväksytyn suunnitelman ja rajauksen. Pohjana ovat nykyinen toteutus, kahden agentin komponentti- ja
näkymäarviot sekä [visuaalinen suunta](jobtracker-visual-direction.md).

## Tavoite ja rajaus

JobTracker tuntuu henkilökohtaiselta työnhaun työkalulta: rauhallinen,
tarkoituksenmukainen ja hieman tekninen. Hakemus, tallennettu tila, odottaminen
ja seuraava tehtävä erottuvat toisistaan. Ilme toimii myös ilman suurta
hakemusmäärää tai täydellisiä lisätietoja.

Säilytetään MUI, Inter, nykyiset sivut, neljä hakemusten suodatusnäkymää,
tietokentät, tilat, laskentasäännöt, autentikointi ja API. Dashboardin
**Pipeline snapshot** vastaa konseptin **Current pipeline** -osiota: se poistetaan
Dashboardilta käyttäjän valinnan mukaisesti. Tilajakauma säilyy Insightsissa.
Tyhjää tilaa ei täytetä uudella ominaisuudella.

Esikatselut ovat ilmeen viitteitä, eivät sellaisenaan kopioitavia sivumäärittelyjä.
Niiden kuvitteelliset yritykset, luvut ja päivämäärät eivät siirry sovellukseen.
Nykyisten yhteenvetojen merkitys ja toimintopainikkeet säilyvät. Esimerkiksi
nykyinen Interviews-luku ei muutu Upcoming interview -luvuksi ulkoasun vuoksi.
Sovellukseen ei lisätä kuvissa esiintyneitä uusia valikoita tai listanäkymiä.

## Toteutusjärjestys

### 1. Yhteinen teema ja peruskomponentit

Ensimmäinen työpaketti luo koko sovelluksen yhteisen ilmeen.

- Viedään suunnan vaaleat ja tummat värit MUI-teemaan. Sininen on ensisijaisen
  toiminnan, valinnan ja fokuksen korostus; muut pinnat ovat neutraaleja.
- Vakioidaan tekstihierarkia: sivuotsikko noin 30/36, tehtävä/rooli 20/28,
  leipäteksti 16/24 ja metatieto 13/18. Otsakkeissa paino 600; numeroissa
  ja päivämäärissä tasalevyiset numerot. Mobiili saa tarvittaessa pienemmän H1:n.
- Säilytetään 8 px väljyysjärjestelmä; käytetään 8–16 px sisäisiä välejä,
  24 px ryhmävälejä ja 32–40 px osioiden välejä. Säiliöiden kulma 8 px,
  tilatunnisteiden 4 px. Ei liukuvärejä, nostovarjoja tai kortteja korttien sisällä.
- Muokataan olemassa olevia PageShell-, PageHeader- ja SectionCard-komponentteja.
  Avoimet osiot hyödyntävät nykyistä `variant="plain"`-tukea.
- Yhtenäistetään sivupalkin valinta, ikonit ja taustat teemaan. Nykyinen
  mobiilivalikko, reitit ja käyttäjätilin toiminnot säilyvät.

Keskeiset tiedostot: `web/src/app/theme.ts`,
`web/src/components/ui/PageSection.tsx`,
`web/src/components/layout/Sidebar.tsx` ja `AppLayout.tsx`.
Käyttämätöntä Topbar-komponenttia ei oteta uudelleen käyttöön.

**Valmis kun:** yhteinen teksti, pinnat, painikkeet ja navigointi toimivat
molemmissa teemoissa; sivukohtaiset kovakoodatut värit eivät kumoa niitä.

### 2. Tilojen ja tehtävien yhteinen visuaalinen kieli

- StatusChip näyttää tallennetun vaiheen tekstinä ja pienenä merkkinä.
  Tavalliset vaiheet ovat neutraaleja; hylätty hakemus ei ole käyttöliittymävirhe.
  Kaikki yhdeksän tilaa ja niiden merkitykset säilyvät.
- NextActionChip erottaa ehdotuksen tallennetusta vaiheesta. Odottaminen on
  neutraalia; ehdotettu tehtävä saa hillityn toimintopainotuksen.
- Keltainen/punainen kiirepainotus perustuu oikeaan tallennettuun ajankohtaan,
  ei yksin `needsAttention`-arvoon. Virheet ja poistaminen säilyttävät oman
  selkeän käsittelynsä; myönteinen lopputulos voi käyttää hillittyä vihreää.
- Muistutuksissa tallennettu sitoumus ja laskettu huomioehdotus pysyvät erillisinä.
  Niiden yhteistä väritysapuria ei muuteta tarkistamatta kaikkia käyttäjiä.
- Piste–viiva–avoin piste -tunnus kuuluu vain Next Action -otsakkeisiin.
  Se ei kuvaa prosenttia tai väistämätöntä etenemistä kaikkien vaiheiden läpi.

Keskeiset tiedostot: `StatusChip.tsx`, `NextActionChip.tsx`,
`ReminderListItem.tsx` ja `applicationStatus.ts`.
Työnkulun laskentalogiikkaa ei muuteta ulkoasun vuoksi.

**Valmis kun:** sama tallennettu tila ja sama tehtävä näyttävät samoilta kaikilla
sivuilla, ja odottamisen erottaa kiireestä myös ilman väriä.

### 3. Dashboard suunnan ensimmäiseksi kokonaiseksi näytöksi

Sovitetaan [valittu vaalea esikatselu](../.impeccable/mocks/decision/search-agenda-v2.png)
ja [tumma esikatselu](../.impeccable/mocks/decision/search-agenda-v2-dark.png)
nykyiseen oikeaan sisältöön ennen muiden sivujen viimeistelyä.

- Next Action johtaa sivua: tehtävä, rooli/yritys, tallennettu tila ja aikakonteksti
  erillisinä. Nykyinen priorisointi ja hakemuksen avaus säilyvät.
- Schedule summary on avoin viereinen osio työpöydällä. Vain tallennettu päivämäärä
  esitetään sitoumuksena; huomioehdotusta ei muuteta lupaukseksi.
- Kuusi nykyistä yhteenvetolukua säilyvät kompaktina rivinä ilman KPI-kortteja.
- Next actions saa selkeät rivit. Dashboardin Pipeline snapshot poistetaan.
  Suljettujen hakemusten tieto säilyy Insightsin tilajakaumassa; poistettua
  tilayhteenvetoa ei korvata uudella Dashboard-mittarilla.
- Mobiilissa järjestys on Next Action → Schedule → lyhyet yhteenvedot → muut
  tehtävät. Pitkät nimikkeet rivittyvät, sarakkeet eivät puristu pikkutaulukoksi.

**Valmis kun:** oikealla datalla ensimmäinen näkymä vastaa suunnan hierarkiaa;
kiireellinen tieto näkyy myös pienellä näytöllä eikä tyhjä alaosa näytä virheeltä.

### 4. Hakemukset, yksityiskohdat ja Timeline

- Applications säilyttää nykyisen korttiruudukon. Rooli ja yritys muodostavat
  yhtenäisen otsakkeen, vaihe ja faktapäivämäärät tukevat sitä ja Next Action
  erottuu omana rivinään. Korttien rajaus rauhoittuu.
- All, Active, Archived ja Needs attention ovat nykyisiä suodattimia samalle
  listalle. Haku, Status, Sort, mobiilisuodattimet, nollaus ja tulosmäärä säilyvät.
- Details käyttää samaa hakemusidentiteettiä. Record activity pysyy Next Actionin
  yhteydessä, mukaan lukien nykyiset status-review-toiminnot.
- Quick facts esitetään selkeinä teksti/päivämääräriveinä. Puuttuva Applied date
  ilmaistaan esimerkiksi `Applied date not recorded`, ei `Not applied yet`.
  Puuttuva päivämäärä ei muuta hakemuksen tilaa tai käynnistä laskuria uudelleen.
- Timeline on rauhallinen tapahtumalista: yhdenmukaiset ikonit, ajankohdat ja
  erottimet. Tallennetut tapahtumat ja järjestys säilyvät. Job Description ja
  henkilökohtaiset Notes pysyvät erillisinä.

**Valmis kun:** hakemus tunnistetaan heti sekä listasta että yksityiskohdista;
pitkä nimike, yritysnimi, URL tai sähköposti ei riko asettelua.

### 5. Schedule, Insights ja Settings

| Näkymä | Toteutus |
| --- | --- |
| Schedule | Tallennetut Overdue / Today / Upcoming -ryhmät ensin, kohdistetut päivämäärärivit ja rauhalliset tyhjät tilat. Suggested attention ja Active queue säilyvät erillisinä nykyisine merkityksineen. |
| Insights | Tilajakauma säilyy. Lukumäärä ja nimittäjä ensin, prosentti toissijaisena; nykyinen tilaosuus ei väitä mittaavansa historiallista vastausprosenttia. Valinnaiset lisätiedot esitetään neutraalina tallennettuna kontekstina. Ehdotuksista pääsee olemassa olevaan hakemuksen Details-näkymään. |
| Settings | Avoimet osiot ja yhtenäiset teemavalinnat. Käyttöliittymä kertoo selvästi, että tulevat asetukset ovat esikatseluja; niitä ei muuteta toimiviksi ominaisuuksiksi. |

Insightsin nollanimittäjä esitetään puuttuvana aktiivisena hakuprosessina eikä
epäonnistumisena tai harhaanjohtavana 0 % tuloksena. Suggested next steps säilyttää
nykyisen laskennan, joka sisältää myös muita tehtäviä kuin yhteydenotot.
Toiminnallinen linkitys tehdään nykyisiin hakemuksiin; uusi URL-suodatinjärjestelmä
tai analytiikka ei kuulu tähän suunnitelmaan.

**Valmis kun:** sivut kuuluvat samaan ilmeeseen mutta säilyttävät omat tehtävänsä;
Insights on ymmärrettävä myös nollalla tai yhdellä hakemuksella.

### 6. Lomakkeet, dialogit ja poikkeustilat

- Add/Edit ja Record activity saavat samat otsikot, kenttävälykset, reunat ja
  painikkeet. Poistovahvistus käyttää punaista vain tuhoavan toiminnon kohdalla.
- Säilytetään kentät, ehdolliset päivämäärät, avattavat lisätiedot, Clean/Undo,
  validointi, ensimmäiseen virheeseen siirtyvä fokus, Enter-käyttö sekä
  näkyvä toimintojen alarivi. Tallennusvirhe ei tyhjennä syötettyä työtä.
- Edellisen kritiikin dirty-form-korjaus tehdään erillisenä käytettävyysmuutoksena:
  muuttunut Add/Edit- tai activity-lomake pyytää Keep editing / Discard -valinnan
  Cancel-, Escape- ja taustasulkemisessa. Avaaminen tai automaattinen lähtöaika
  ei yksin tee lomakkeesta muuttunutta; Undo voi palauttaa sen ennalleen.
  Muuttumaton lomake sulkeutuu suoraan; tallennuksen aikainen suojaus säilyy.
- Tämä ei sisällä uutta luonnostallennusta tai yleistä selaimen
  navigointi-/välilehden sulkemisen estoa. Dialogisuojaus ei ole lupaus niistä.
- Kirjautuminen, session vanheneminen, lataaminen, virheet, Retry, tyhjä lista,
  ei hakutuloksia ja puuttuva hakemus saavat saman ilmeen. Clerk ja
  käyttäjien tietojen eristäminen säilyvät. Authin tarkoitusteksti on faktapohjainen.

**Valmis kun:** myös epätäydelliset ja virheelliset tilanteet tuntuvat samalta
tuotteelta, ja lomakkeen sulkeminen ei hävitä muutoksia vahingossa.

## Työnjako agenteille toteutusvaiheessa

Pääagentti omistaa ensin teeman, sovelluskehyksen ja yhteiset komponentit.
Niitä ei muokata useasta suunnasta yhtä aikaa. Kun perusta on vakaa:

1. Yksi agentti käsittelee Applications-, Details- ja Timeline-esityksen.
2. Toinen käsittelee Schedule-, Insights- ja Settings-esityksen.
3. Pääagentti sovittaa Dashboardin ja lomakkeet sekä yhdistää muutokset.

Agenteille annetaan sama visuaalinen ohje ja rajatut tiedostot. Jos näkymä tarvitsee
muutoksen yhteiseen komponenttiin, se palautetaan pääagentille. Lopuksi tuore
arviointiagentti tarkistaa koko ilmeen toteutusta ja kuvakaappauksia vasten.
Dokumentointi kuvaa lopullista toteutusta, ei pelkkää suunnitelmaa.

## Tarkistus ja valmistumiskriteerit

- Nykyiset frontend-testit, lint ja tuotantobuild menevät läpi. Uudet kohdistetut
  testit koskevat merkityksellisiä riskejä: dirty-sulkeminen, failed-save,
  puuttuva hakupäivä, yhteenvetojen merkitys, suodattimet ja tyhjä nimittäjä.
  Pelkistä väliarvoista tai komponenttien toteutustavasta ei kirjoiteta uusia testejä.
- Päivitetään olemassa olevat kontrastitestit. Tarkistetaan todelliset yhdistelmät:
  teksti, status, aktiivinen navigointi, täytetty/rajattu painike, hover ja fokus.
- Kaikki sivut ja aktiiviset dialogit katsotaan työpöydällä ja mobiilissa molemmilla
  teemoilla. Päävertailut 1440 ja 390 px; lisäksi 1280/320 px ja käyttäjän nykyinen
  leveys, jos se eroaa näistä. Ei vaakasuuntaista sivuvuotoa tai piiloon jääviä toimintoja.
- Käytetään olemassa olevaa paikallista dataa ja merkittyä testidataa tarpeen mukaan.
  Tyhjä, yksi, useita ja pitkän sisällön tilanteet tarkistetaan myös sopivilla
  komponenttitesteillä. Käyttäjän hakemuksia ei muokata vain visuaalitestausta varten.
- Tarkistetaan näppäimistö, mobiilivalikko, hakemuksen avaus, suodattimet,
  teemavalinnan säilyminen, dialogien sulkeminen ja oikeiden päivämäärien erottelu.
- Visuaalinen oma tarkistus tehdään kahdessa rajatussa kierroksessa: ensimmäinen
  koottu tarkistus, löydösten yhteinen korjaus ja yksi varmistus. Tuore arviointiagentti
  tekee lopuksi riippumattoman arvion; jäljelle jääneet ongelmat raportoidaan.
- Valmis ilme kirjataan `DESIGN.md`-tiedostoon ja Impeccablen token-tietoihin.
  Päivitetään `docs/DESIGN.md` ja `docs/current-feature.md` todellisten muutosten
  ja tarkistusten mukaan. Aiemmat avoimet date/workflow-tarkistukset eivät muutu
  tehdyiksi pelkän ulkoasutyön vuoksi.

Backendia, tietokantaa, deployta tai mobiilisovellusta ei muuteta. Commit ja
julkaiseminen vaativat oman käyttäjän pyynnön. Valmis työ tarkoittaa yhtenäistä
oikealla datalla toimivaa ilmettä, ei vain teeman vaihtoa tai yhtä onnistunutta Dashboardia.
