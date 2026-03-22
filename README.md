# TerraView

An interactive visualization of world history through dynamic border maps. Navigate to any year from 3000 BC to 2026 to see approximate historical borders, or use the AI-powered **"What If?"** simulator to explore how hypothetical events would reshape the modern world.

![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-8-purple)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green)
![Firebase](https://img.shields.io/badge/Firebase-12-orange)

## Features

- **Historical Timeline** — Go through 2,000 years of history across 12 distinct eras, from the ancient world to the modern day. Countries are color-coded by geopolitical blocs, empires, and alliances.
- **"What If?" Simulator** — Pose a hypothetical scenario (e.g., _"What if the Roman Empire never fell?"_) and Claude AI traces cascading consequences forward to 2026, recoloring the modern map with new factions and spheres of influence.
- **Cascading Events Tree** — After a simulation, view a visual tree of branching consequences showing how the divergence point rippled through history to reshape the present.
- **Interactive Map** — Hover over any country for contextual tooltips. Zoom, pan, and explore a vintage parchment-styled world map built on Leaflet with CARTO tiles.
- **Collapsible Legend** — Dynamic legend overlay showing active geopolitical powers, minimizable with a single click.
- **Resizable Sidebar** — Drag to resize the control panel between 280–600px.
- **Firebase Authentication** — Email/password sign-up and login with secure token-based API access.

## Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Frontend   | React 19, Vite 8                              |
| Map        | Leaflet 1.9 (raw, not react-leaflet)          |
| Tiles      | CARTO Light (no labels) with sepia CSS filter |
| Auth       | Firebase 12 (email/password)                  |
| AI         | Claude Haiku 4.5 via Cloudflare Worker proxy  |
| Deployment | Vercel (frontend), Cloudflare Workers (API)   |

## Historical Eras

12 eras spanning from antiquity to the present, each with unique geopolitical groupings:

| Era            | Period    | Examples                                      |
| -------------- | --------- | --------------------------------------------- |
| Ancient        | pre-500   | Roman Empire, Han China, Sassanid Persia      |
| Early Medieval | 500–1349  | Byzantine, Arab Caliphate, Norse Kingdoms     |
| High Medieval  | 1350–1499 | Holy Roman Empire, Mongol Successor States    |
| Reformation    | 1500–1647 | Iberian Colonial Empires, Ottoman Empire      |
| Early Modern   | 1648–1799 | Western Europe, Russian Empire, Asian Empires |
| Napoleonic     | 1800–1814 | French Empire, Coalition Forces               |
| 19th Century   | 1815–1913 | British Empire, European Colonial Powers      |
| World War I    | 1914–1918 | Entente vs Central Powers                     |
| Interwar       | 1919–1938 | Democratic, Fascist, and Communist blocs      |
| World War II   | 1939–1946 | Allies vs Axis                                |
| Cold War       | 1947–1990 | NATO vs Warsaw Pact                           |
| Modern         | 1991+     | NATO & Allies, BRICS & Partners               |

## ToDo

Google accounts
Rate Limiting
Continuing history

## License

MIT
