# Task Management V1 Plan

## Goal
Build one task system for me + my agents, focused on fast capture and simple daily organization for standalone tasks.

## Locked Decisions
- Task inputs are concrete action points by default.
- Statuses: `inbox`, `active`, `done`.
- Agent `done`/`delete` actions require **batch review** approval.
- Agents do not pick tasks autonomously unless explicitly scheduled.

## Core User Stories (P0)
- Capture a task from anywhere in seconds (`/task ...`).
- Capture with minimal data: text, optional due date, optional priority (1-3).
- Triage from inbox regularly (target daily, realistic 3-4x/week).
- Organize by time horizon: today, next few days, week.
- Decide "what now" using due date + priority.
- Complete tasks quickly with low friction.
- Create recurring tasks:
  - daily
  - every N days (ex: every 3 days)
  - weekly
  - monthly
  - fixed day-of-month (ex: 25th)

## Agent Interaction Stories (P1)
- Explicitly hand tasks off to agents when needed.
- Agents can fetch tasks by due date, priority, search, and ID.
- Agents can propose updates in batch for user approval.
- Morning agent job can prepare daily task list from weekly plan + due/priority.

## Scope Boundaries (Out for V1)
- Project decomposition into subtasks.
- Complex blocked-state workflows.
- Agent duplicate/correction workflows.
- Rich completion rituals.

## Success Criteria (30 Days)
- Task capture feels very low friction.
- Easy to organize and review tasks.
- Easier to hand tasks to agents when needed.
- Less scattered workflow across multiple apps.
- Lower noisy backlog and fewer forgotten follow-ups.
