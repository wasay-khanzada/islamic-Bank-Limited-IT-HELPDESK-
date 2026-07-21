# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
- Export reports to PDF/Excel
- Bulk ticket actions for admins

## [1.0.0] — 2026-05-11
### Added
- Ticket creation, classification, and full lifecycle tracking
- Role-based access control across 4 roles (Super Admin, Admin, Agent, User)
- SLA deadline calculation by priority (24h / 72h / 168h) with color-coded status
- Real-time notifications via Socket.io (assignments, comments, status changes)
- Admin analytics dashboard: KPI cards, ticket trends, status donut chart, priority breakdown, activity heatmap
- Department management module
- Reports & Analytics page: resolution time, first response time, satisfaction score, SLA compliance, agent leaderboard
- Audit logging for compliance tracking
- Dark mode / light mode theme toggle
- JWT-based authentication and route guards

### Tech
- Frontend rebuilt on React 18 + TypeScript, TailwindCSS, shadcn/ui, Recharts
- Backend on Node.js + Express (MVC architecture) with Sequelize ORM over MSSQL
