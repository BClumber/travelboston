# Travel Boston

A train, flight and model-train simulator of the Boston area, made for a young train fan. Runs in a phone or tablet browser.

- **Train** - drive from South Station through Back Bay to Stoughton, or stay on the main line to Providence. Four views, including the driver's cab.
- **Fly** - a small prop plane, a private jet, an airliner or a helicopter from Logan to Norwood or Providence, with landmarks, roads and tunnels along the way.
- **Fast train** - drive the Acela from Boston to Washington, D.C., stopping at Providence, New Haven, New York, Philadelphia and Baltimore, past the shoreline, the big bridges and the Capitol.
- **Tunnel drive** - drive a car, school bus or fire truck under the harbor to the airport, with spoken lessons for 3-4 year olds (down/up, dark/light, in/out, counting, colours) and a see-through side view of the water above.
- **Model trains** - build a table layout with hills, a mountain, scenery and a wild track option.

## Running it

Play it at https://bclumber.github.io/travelboston/ . On a phone or tablet use "Add to Home Screen" (or "Install app") to get a full-screen app icon. On a computer, press H in the game for the keyboard keys.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Page, menus and on-screen controls |
| `core.js` | Rendering setup, shared shapes, train cars, sound, controls |
| `world.js` | Rail line, stations, tunnels, city and scenery |
| `region.js` | Airports, roads and highways, the wider region |
| `places.js` | Named landmarks, the zoo, road tunnels, moving cars |
| `life.js` | People, shops, buses, subway and trolley lines, street details |
| `aircraft.js` | Planes and the helicopter |
| `train.js` / `fly.js` / `acela.js` / `tunnel.js` / `model.js` | The five play modes |
| `main.js` | Mode switching and the main loop |

The map is compressed: places are in the right order and direction, not at true distance. Aircraft and trains are generic, with no real company markings.
