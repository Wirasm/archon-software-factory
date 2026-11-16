# Admit policy for Archon (draft, shadow only)

An item that passed triage as build or narrow starts automatically when all of these hold.
When any one does not, or you cannot tell, it is an ask.

- **Size.** Triage judged it xs or s.
- **Protected paths.** It does not need to change any of: the database schema or a stored
  JSON shape; a public shape of the workflow language (a YAML field, an expression, a CLI
  flag or command that is removed or changes meaning); the bundled SDLC pack; how providers
  authenticate or how credentials and environment reach a run; isolation and worktree
  ownership; process signalling or anything that stops processes; release and CI workflows.
- **It can be undone.** Reverting the change puts things back. Nothing is written that a
  later binary must keep reading, and nothing is published.
- **The acceptance can be checked.** The item states behaviour someone can observe, not an
  intention or a direction.
- **Nothing is unsettled.** The item does not carry an open question, two readings, or a
  choice of shape that belongs to a maintainer. A bug with one cause and one expected
  behaviour is settled; "one of these designs" is not.
- **It is not direction.** It does not decide what the product is or change a default
  users rely on.

Removing tests, fixing a wrong message, a bug whose expected behaviour the item states, and
documentation that follows code are the usual cases that start automatically.
