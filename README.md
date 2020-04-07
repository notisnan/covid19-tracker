# COVID19 Tracker
![](art/.png?raw=true)
A Chrome extension to show important COVID-19 global and local information.

[Available on the Chrome Store](https://chrome.google.com/webstore/detail/dccmmkjdbpdlcallijclmjkhmpciajdj/).

<img src="./banner.jpg" width="400">

## Features
- Initialized with global stats and the top four countries with highest confirmed cases.
- Ability to curate the list of countries you want to keep an eye on.
- Data is refreshed each time extension is opened and can be refreshed manually with one click.
- Ability to sort the data by clicking on the headings.
- Panel to view data from all reporting countries at the same time.
- Your country data will persist between Chrome sessions by being stored in Chrome sync storage.


## Data
We are consuming the data from the [Corona Virus Monitor](https://rapidapi.com/astsiatsko/api/coronavirus-monitor?endpoint=apiendpoint_f48abf8b-68b3-4012-97ee-f0cc72cff406) API.

API information is updated on 10 minute intervals and consumes the data from [Johns Hopkins](https://coronavirus.jhu.edu/map.html) or [Worldometer](https://www.worldometers.info/coronavirus/) depending on which one has the most up to date information.

<br>

----

<br>

This was authored by [Mariusz Dabrowski](https://github.com/MariuszDabrowski) & [Dulio Denis](https://github.com/duliodenis) for a Hackathon presented on March 28th, 2020.

The Hackathon presentation is available [here](/presentation/hackathon-032820.pdf).

We hope it brings awareness to the dangers of pandemic events to human civilization and the need to prepare.

See [TED Talk: The Next Pandemic, we are not ready (Bill Gates).](https://www.youtube.com/watch?v=6Af6b_wyiwI)
