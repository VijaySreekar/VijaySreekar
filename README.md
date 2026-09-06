<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="./assets/hero-static.png">
  <img src="./assets/hero-animated.gif" width="100%" alt="London's skyline meeting a network of cloud services, in blue and gold">
</picture>

# Vijay Sreekar

I build backend services and the interfaces around them. My work spans travel planning, data analysis, and web applications, with a focus on Python, APIs, and how data moves through a product.

Currently building **AI ERP**, an enterprise resource planning project with an AI focus, and **[Wandrix](https://www.wandrix.app/)**, a travel planner that keeps a conversation and a structured trip board side by side.

[Selected projects](#selected-projects) · [All projects](./PROJECTS.md) · [Repositories](https://github.com/VijaySreekar?tab=repositories)

## Selected projects

### AI ERP

An ongoing enterprise resource planning project I'm building with an AI focus.

<sub>Currently in development.</sub>

### Wandrix

Describe a trip, compare destinations, and turn the plan into a saved brochure. A Next.js interface connects to a FastAPI backend, with a LangGraph planning runtime and PostgreSQL persistence.

<a href="https://github.com/VijaySreekar/Wandrix-Live">
  <img src="./assets/projects/wandrix-workspace.png" width="100%" alt="Earlier Wandrix workspace showing a travel conversation beside destination suggestions for the Canary Islands, Malta, Madeira, and Seville">
</a>

<sub>Earlier development capture from the Wandrix repository. The live interface continues to evolve.</sub>

**Engineering:** conversation state, editable trip drafts, and versioned brochure snapshots connected to the same trip.

**Python · FastAPI · Next.js · PostgreSQL · LangGraph**

[View code & architecture](https://github.com/VijaySreekar/Wandrix-Live#architecture) · [Visit Wandrix](https://www.wandrix.app/)

### Spotify Insights

An interactive analysis of listening history: favourite artists, repeated tracks, and patterns across days and hours. Built with **[GanapathiThota](https://github.com/GanapathiThota)**.

<a href="https://github.com/VijaySreekar/StreamLitSpotifyInsights">
  <img src="./assets/projects/spotify-analysis.png" width="100%" alt="Spotify Insights running an analysis of a fictional listening-history dataset">
</a>

<sub>Application capture using fictional artists, tracks, and listening history.</sub>

**Engineering:** JSON/CSV ingestion, timestamp normalization, grouped analysis, and selectable visualizations in Streamlit.

**Python · pandas · Streamlit · Matplotlib · Seaborn**

[View code & sample data](https://github.com/VijaySreekar/StreamLitSpotifyInsights) · [Run the demo locally](https://github.com/VijaySreekar/StreamLitSpotifyInsights#run-locally)

### Treakers

A sneaker storefront with product filtering, a basket, and an admin area for products and orders. Built as part of **Team 27 at Aston University**; the demo repository makes the university project easier to explore.

<a href="https://github.com/VijaySreekar/treakers-demo">
  <img src="./assets/projects/treakers-storefront.png" width="100%" alt="Treakers sneaker storefront with its demo navigation and illustrated shoe landing page">
</a>

<sub>Live demo capture. The repository also includes catalogue and admin screenshots.</sub>

**Engineering:** server-rendered PHP pages, relational data, and a seeded SQLite demo with a serverless entry point.

**PHP · SQLite · Bootstrap · JavaScript**

[View demo code](https://github.com/VijaySreekar/treakers-demo) · [Explore the store](https://treakers-demo.vercel.app/) · [Original team project](https://github.com/VijaySreekar/Team-27)

## More work

[**Alarm App**](https://github.com/VijaySreekar/AlarmApp) — a React Native/Expo prototype for labeled alarms and repeat schedules.

[**Project index**](./PROJECTS.md) — the full collection, including earlier coursework and clearly identified forks.

## Tools I work with

| Area | Tools used across these projects |
| :--- | :--- |
| Backend & data | Python, FastAPI, PostgreSQL, SQLAlchemy, pandas |
| Interfaces | TypeScript, React, Next.js, Streamlit, PHP |
| Delivery | Docker, GitHub Actions, Vercel, Render |

I’m interested in the decisions behind a working product: where state lives, how an API fits its interface, and what happens when a dependency fails. The project READMEs cover setup, structure, and current limitations.
