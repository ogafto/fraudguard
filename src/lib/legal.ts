// Legal copy for /regulamin and /prywatnosc. Items in [square brackets] are the
// operator's details that still need filling in; have a lawyer review both texts before launch.

export type LegalSection = { id: string; title: string; body: (string | string[])[] };
export type LegalDoc = { key: "terms" | "privacy"; label: string; href: string; title: string; lead: string; updated: string; sections: LegalSection[] };

const UPDATED = "20 października 2026";

export const TERMS: LegalDoc = {
  key: "terms",
  label: "Regulamin",
  href: "/regulamin",
  title: "Regulamin",
  lead: "Zasady korzystania ze strony, panelu klienta i licencji na plugin FraudGuard.",
  updated: UPDATED,
  sections: [
    {
      id: "ogolne",
      title: "Postanowienia ogólne",
      body: [
        "Regulamin określa zasady korzystania z serwisu FraudGuard, w tym zakładania konta, zakupu licencji i korzystania z pluginu na serwerach Minecraft.",
        "Usługodawcą jest [nazwa firmy], [adres], NIP [numer], zwany dalej Usługodawcą.",
        "FraudGuard nie jest oficjalnym produktem Minecraft i nie jest powiązany z Mojang Studios ani Microsoft.",
      ],
    },
    {
      id: "definicje",
      title: "Definicje",
      body: [
        [
          "Serwis: strona internetowa FraudGuard wraz z panelem klienta.",
          "Plugin: oprogramowanie FraudGuard instalowane na serwerze Minecraft.",
          "Licencja: prawo do korzystania z Pluginu w zakresie wybranego planu.",
          "Klient: osoba, która założyła konto w Serwisie.",
        ],
      ],
    },
    {
      id: "konto",
      title: "Konto",
      body: [
        "Do zakupu i zarządzania Licencją potrzebne jest konto. Konto zakładasz, podając adres e-mail i hasło, a następnie potwierdzasz adres kodem wysłanym w wiadomości.",
        "Odpowiadasz za poufność hasła i za działania wykonane z Twojego konta. Jeśli podejrzewasz nieuprawniony dostęp, zmień hasło i daj nam znać.",
        "Konto możesz usunąć w każdej chwili w ustawieniach panelu. Usunięcie konta kończy aktywne Licencje bez zwrotu opłat za bieżący okres.",
      ],
    },
    {
      id: "licencje",
      title: "Licencje i płatności",
      body: [
        "Licencja miesięczna odnawia się automatycznie co miesiąc, dopóki jej nie anulujesz. Anulowanie działa do końca opłaconego okresu.",
        "Licencja dożywotnia jest opłacana jednorazowo i obejmuje aktualizacje Pluginu przez cały okres jego rozwijania.",
        "Liczba serwerów, na których możesz używać Pluginu, zależy od planu. Klucz licencyjny jest przypisany do Twojego konta i nie może być udostępniany innym osobom.",
        "Ceny podane w Serwisie są cenami brutto w złotych polskich.",
      ],
    },
    {
      id: "korzystanie",
      title: "Korzystanie z pluginu",
      body: [
        "Zabronione jest dekompilowanie, modyfikowanie i dalsza sprzedaż Pluginu oraz obchodzenie zabezpieczeń licencji.",
        "Decyzje o karach dla graczy, takich jak kick czy ban, podejmuje administracja serwera. Plugin jest narzędziem, które je wspiera, ale nie zastępuje oceny człowieka.",
      ],
    },
    {
      id: "odpowiedzialnosc",
      title: "Odpowiedzialność",
      body: [
        "Dokładamy starań, żeby Plugin działał stabilnie i trafnie wykrywał oszustwa. Nie gwarantujemy jednak wykrycia każdego oszustwa ani braku błędnych flag.",
        "Usługodawca nie odpowiada za przerwy w działaniu serwera Klienta wynikające z jego konfiguracji, innych pluginów lub dostawcy hostingu.",
      ],
    },
    {
      id: "reklamacje",
      title: "Reklamacje",
      body: [
        "Reklamacje możesz zgłosić na naszym Discordzie lub przez zgłoszenie w panelu klienta. Opisz problem i podaj adres e-mail konta.",
        "Odpowiadamy na reklamacje w ciągu 14 dni od ich otrzymania.",
      ],
    },
    {
      id: "odstapienie",
      title: "Odstąpienie od umowy",
      body: [
        "Konsument może odstąpić od umowy w ciągu 14 dni od jej zawarcia bez podawania przyczyny.",
        "Prawo odstąpienia nie przysługuje, jeśli dostarczanie treści cyfrowej rozpoczęło się za wyraźną zgodą Klienta przed upływem tego terminu, po poinformowaniu go o utracie tego prawa.",
      ],
    },
    {
      id: "zmiany",
      title: "Zmiany regulaminu",
      body: [
        "Regulamin może się zmienić, na przykład po dodaniu nowych funkcji. O zmianach informujemy w panelu klienta z co najmniej siedmiodniowym wyprzedzeniem.",
        "W sprawach nieuregulowanych w Regulaminie stosuje się przepisy prawa polskiego.",
      ],
    },
  ],
};

export const PRIVACY: LegalDoc = {
  key: "privacy",
  label: "Prywatność",
  href: "/prywatnosc",
  title: "Polityka prywatności",
  lead: "Jakie dane zbieramy, po co nam są i jakie masz prawa.",
  updated: UPDATED,
  sections: [
    {
      id: "administrator",
      title: "Administrator danych",
      body: [
        "Administratorem Twoich danych osobowych jest [nazwa firmy], [adres], NIP [numer].",
        "W sprawach danych osobowych możesz pisać na [adres e-mail administratora] albo na naszym Discordzie.",
      ],
    },
    {
      id: "dane",
      title: "Jakie dane zbieramy",
      body: [
        [
          "Dane konta: adres e-mail, nazwa użytkownika i zaszyfrowane hasło.",
          "Dane płatności: historia zamówień i faktur. Danych kart nie przechowujemy, obsługuje je operator płatności.",
          "Dane serwerów: adresy serwerów, na których działa Plugin, oraz statystyki jego pracy.",
          "Dane graczy: nicki i identyfikatory graczy, którzy dostali flagę, wraz ze szczegółami checka.",
        ],
      ],
    },
    {
      id: "cele",
      title: "Po co nam te dane",
      body: [
        "Przetwarzamy dane, żeby prowadzić Twoje konto, obsłużyć Licencję i płatności, pokazać statystyki w panelu i odpowiadać na zgłoszenia.",
        "Podstawą jest wykonanie umowy, obowiązki prawne (na przykład księgowe) oraz nasz uzasadniony interes, czyli bezpieczeństwo i rozwój usługi.",
      ],
    },
    {
      id: "gracze",
      title: "Dane graczy na Twoim serwerze",
      body: [
        "Dane graczy, którzy grają na Twoim serwerze, przetwarzamy w Twoim imieniu. W tym zakresie Ty jesteś administratorem danych, a my podmiotem przetwarzającym.",
        "Flagi i logi graczy są przechowywane przez 90 dni, chyba że w panelu ustawisz krótszy okres.",
      ],
    },
    {
      id: "cookies",
      title: "Pliki cookies",
      body: [
        "Używamy tylko niezbędnych plików cookies: do utrzymania sesji po zalogowaniu i zapamiętania Twoich ustawień. Nie używamy cookies reklamowych.",
      ],
    },
    {
      id: "odbiorcy",
      title: "Komu przekazujemy dane",
      body: [
        "Dane mogą trafić do dostawców, z których korzystamy: hostingu, operatora płatności, dostawcy poczty e-mail oraz Discorda, jeśli podłączysz webhook.",
        "Nie sprzedajemy danych i nie przekazujemy ich w celach marketingowych.",
      ],
    },
    {
      id: "okres",
      title: "Jak długo je trzymamy",
      body: [
        "Dane konta przechowujemy, dopóki konto istnieje. Dane rozliczeniowe przechowujemy przez okres wymagany przepisami podatkowymi.",
      ],
    },
    {
      id: "prawa",
      title: "Twoje prawa",
      body: [
        "Masz prawo do dostępu do danych, ich poprawienia, usunięcia, ograniczenia przetwarzania, przeniesienia oraz sprzeciwu.",
        "Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych.",
      ],
    },
  ],
};

export const LEGAL_DOCS = [TERMS, PRIVACY];
