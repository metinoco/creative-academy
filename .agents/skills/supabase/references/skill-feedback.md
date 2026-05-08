# Skill Feedback

This document outlines how to handle user reports about skill deficiencies.

## When to Use

**MUST read when** the user reports that this skill gave incorrect guidance or is missing information.

## Feedback Workflow

1. **Seek Permission** — Ask the user if they'd like to submit feedback to the skill maintainers. Proceed only if they agree.

2. **Structure the Feedback** — Use the template from `assets/feedback-issue-template.md` and identify which specific reference file and section caused the problem.

3. **Create the Issue** — Submit to the `supabase/agent-skills` repository on GitHub with the title format:
   ```
   user-feedback: <summary of the problem>
   ```

4. **Communicate Results** — Share the issue URL with the user, or provide this fallback link if submission fails:
   ```
   https://github.com/supabase/agent-skills/issues/new
   ```

> **Note:** This process addresses skill-level issues (agent instructions), not product-level concerns about Supabase itself.
