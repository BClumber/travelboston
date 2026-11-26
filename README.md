# Travel Boston

A train, flight and model-train simulator of the Boston area, made for a young train fan. Runs in a phone or tablet browser.

- **Train** - drive from South Station through Back Bay to Stoughton, or stay on the main line to Providence. Four views, including the driver's cab.
- **Fly** - a small prop plane, a private jet, an airliner or a helicopter from Logan to Norwood or Providence, with landmarks, roads and tunnels along the way.
- **Model trains** - build a table layout with hills, a mountain, scenery and a wild track option.

## Running it

Open `index.html` from any web server (for example GitHub Pages). It needs an internet connection the first time to load three.js and the font.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Page, menus and on-screen controls |
| `core.js` | Rendering setup, shared shapes, train cars, sound, controls |
| `world.js` | Rail line, stations, tunnels, city and scenery |
| `region.js` | Airports, roads and highways, the wider region |
| `places.js` | Named landmarks, the zoo, road tunnels, moving cars |
| `aircraft.js` | Planes and the helicopter |
| `train.js` / `fly.js` / `model.js` | The three play modes |
| `main.js` | Mode switching and the main loop |

The map is compressed: places are in the right order and direction, not at true distance. Aircraft and trains are generic, with no real company markings.
