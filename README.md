# SOAI Neuro Core

Production-ready Discord bot foundation for a gamified AI community.

## Implemented Scope
- Phase 1: Foundation System
- Phase 2: Engagement Engine

## Stack
- Node.js
- discord.js (slash commands only)
- MongoDB (Mongoose)
- node-cron scheduler

## Quick Start
1. Copy `.env.example` to `.env`
2. Fill Discord and MongoDB credentials
3. Install dependencies:
   ```bash
   npm install
   ```
4. Deploy slash commands:
   ```bash
   npm run deploy
   ```
5. Run bot:
   ```bash
   npm run start
   ```

## Required Discord Intents
Enable in Discord Developer Portal:
- Server Members Intent
- Message Content Intent
- Presence Intent (optional)

## Notes
- Reaction role message can be created using `/post-reaction-roles`.
- Weekly rotating roles are processed by cron (`WEEKLY_ROLE_CRON`).
