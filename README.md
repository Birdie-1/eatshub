# eatsHub Mockup

Mobile-first clickable mockup of the eatsHub food-delivery platform, deployed to Vercel.

- `brand/` — logo files (primary color `#FCBB18`)
- `docs/specs/` — module specs summarized from the original PDFs (see `docs/specs/README.md`)

## Working together (2 people)

`main` is the deployable branch — don't push to it directly. Work on a branch and open a Pull Request.

```bash
# 1. Start from the latest main
git checkout main
git pull

# 2. Create a branch for your task
git checkout -b feature/restaurant-list

# 3. Commit and push your work
git add .
git commit -m "Add restaurant list screen"
git push -u origin feature/restaurant-list

# 4. Open a PR on GitHub, ask the other person to review, then merge
gh pr create --fill
```

Tips to avoid conflicts:
- Split work by screen/flow (e.g. one person on customer ordering, the other on the back-office rider list).
- Pull `main` often and keep PRs small.
- After a PR is merged: `git checkout main && git pull`, then start a new branch.
