# Land policy for Archon (draft, shadow only)

A change that our checks approved and the host cleared lands without an ask when all of these hold. When any one does not, or you cannot establish it, it is an ask.

- **Checks.** Every project check at the head commit passed or was skipped by design, and the head is the commit our checks approved.
- **It merges.** It merges cleanly with the branch it targets.
- **Size.** Fewer than 300 changed lines, tests included.
- **Protected paths.** It does not change any of: the database schema or a stored JSON shape; a public shape of the workflow language; the bundled SDLC pack or any pack file; how providers authenticate or how credentials and environment reach a run; isolation and worktree ownership; process signalling; release and CI workflows.
- **It can be undone.** Reverting the merge puts things back.
- **Nothing is open.** Deliver ended with no ask, no disputed finding, and nothing the checks marked as not checked that the item's acceptance depends on.
- **Windows.** The project's checks on a pull request skip Windows. A change that touches the filesystem, processes, paths or timing in tests is an ask until the full suite has run on its branch.
