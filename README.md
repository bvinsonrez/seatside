# Seatside

Seatside is a concept demo of an in-game fan engagement app. Fans play quick games during breaks in the action (predictions, trivia, bingo), earn points, climb section and season leaderboards, and unlock sponsor-funded rewards. Every game and every break carries a sponsor placement.

**Live demo:** https://bvinsonrez.github.io/seatside/

## The idea: shadow fans

At most games, one person buys the tickets and scans everyone in from one phone. The team knows that buyer, and has no record of the people who came with them. Seatside gives those fans a reason to sign up: to play, you join with your seat (or scan the code on your seat). The team's ticketing data already knows which account owns that seat tonight, so each new sign-up is linked to the account holder who brought them. The dashboard labels these links "Seat match" (a probable guest, not a certainty).

## Presenting it

The page shows the fan's phone on the left and the team dashboard on the right. The presenter bar across the top runs the game:

1. **Next break** opens the next sponsored break (prediction, then trivia, then bingo).
2. In the phone, tap **Scan the code on your seat**, add a name and email, and **Join tonight's game**. The fan appears at the top of the dashboard, linked to the ticket holder.
3. Play the live break. **Next play** fires the next in-game moment: it resolves predictions and marks bingo squares.
4. **End game** settles the section battle. **View returning fan** shows a fan with a full season of history. **Sport** switches between hockey and basketball. **Reset** starts over.

On a narrow screen, Fan and Team become tabs.

## Run locally

```
npm install
npm run dev
npm test
```

Team name, colors, and sponsors live in `src/config/team.ts` and `src/data/sponsors.ts`. Sport content (prediction options, trivia, bingo squares, in-game moments) lives in `src/content/`.

All teams, fans, venues, and sponsors are fictional. Every push to `main` deploys to GitHub Pages.
