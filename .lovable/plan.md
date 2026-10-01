# Dostęp administratora tylko z jednego IP

## Zakres
- Zezwolić na logowanie do panelu tylko z publicznego adresu IP `91.236.137.14`.
- Usunąć możliwość samodzielnego zakładania konta z ekranu administratora.
- Po wejściu z innego IP wylogować użytkownika i pokazać komunikat o braku dostępu.
- Zachować publiczny dostęp do albumów, utworów, okładek i odtwarzania muzyki.

## Zabezpieczenie
- Dodać osobną rolę administratora przypisaną do obecnego konta właściciela.
- Przenieść kontrolę logowania oraz operacje dodawania i usuwania albumów/utworów do chronionych funkcji serwerowych.
- Każde żądanie administracyjne sprawdzi jednocześnie sesję, rolę administratora i rzeczywisty adres IP przekazany przez zaufaną warstwę hostingu.
- Zablokować dotychczasowy bezpośredni zapis dla zwykłych zalogowanych kont, aby nie dało się ominąć panelu wywołaniem API.

## Interfejs
- Panel i formularz pozostaną wizualnie bez zmian.
- Niedozwolony adres IP zobaczy czytelny komunikat zamiast panelu.
- Nawigacja do panelu pozostanie dostępna; właściwa autoryzacja nastąpi przed pokazaniem danych i narzędzi.

## Uwaga
- To ustawienie wymaga stałego publicznego IP. Jeśli operator internetu zmieni adres, panel pozostanie zablokowany do czasu aktualizacji dozwolonego IP.
