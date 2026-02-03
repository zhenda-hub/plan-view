# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Plan View is a time-based planning visualization project built with Vue.js. The application displays planning data across multiple time hierarchies, from 10-year strategic views down to weekly operational details.

## Time Hierarchy Structure

The application supports the following time levels (from macro to micro):

| Level | Description | Pattern |
|-------|-------------|---------|
| 10-year | Decade overview | - |
| 5-year | Strategic planning | - |
| 3-year | Medium-term milestones | - |
| 1-year | Annual planning | - |
| Quarterly | Quarterly breakdown | - |
| Monthly | Monthly breakdown | - |
| Weekly | Weekly detail | - |

## Proposed Technical Solutions

The project is evaluating these timeline/Gantt chart libraries:

1. **Mobiscroll Timeline** or **vue-cal** - Modern timeline with resource views
2. **Frappe Gantt** or **Bryntum Gantt** (Community Edition) - Classic Gantt chart with dependency arrows
3. **ECharts** - Advanced custom visualizations
4. **@losting/timeline** - Vue 3 timeline component
5. **@boyzcf/vue3-time-line** - Vue 3 timeline alternative

## Project Status

**Current Phase**: Concept/Research

This repository is in early development with no implemented source code yet. The next development steps will involve:
- Initializing a Vue 3 project structure
- Setting up the build system (Vite or Webpack)
- Configuring TypeScript
- Implementing the core timeline component

## License

Apache License 2.0
