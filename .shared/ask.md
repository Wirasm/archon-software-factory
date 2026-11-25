# ask

Hands a decision to an operator. It is one of the ways your work can end.

## When to use it

Use it when finishing your work needs a decision that is not yours to make:

- the item can be read two ways and the ways lead to different changes;
- doing what the item asks means giving up something the project holds to, or changing something it promised;
- the right answer depends on where the project is going, what it will support, or what it costs someone else.

## When not to use it

- **You can decide it.** A choice between two ways to write the same thing is yours. Make it and say why in your notes.
- **The project already answered it.** Read the policy you were given and the documents it points to before you ask. Then look for a `rulings.md` beside the project's policy file: it holds answers the maintainers have already given (the pack's `policy/rulings.md` says how it is kept), and a question it answers is settled. A decision they make is made; an ask that repeats it wastes a round and the operator's attention.
- **You can find it out.** If reading the code or running something would answer it, do that.
- **It is a doubt, not a decision.** "I did not run the full suite" or "this might be slow" goes in your notes.
- **It is something wrong that you did not cause.** That is something you noticed, not a question.
- **To get permission.** Do not ask whether to do the work you were given.

If nobody would choose differently from you, it is not an ask.

## How to write one

The operator reads the ask on its own, later, without your run open. They may be a person or an agent. Give them what they need to decide in one reading.

| Field | What we expect |
|---|---|
| `question` | One sentence that can be answered by picking an option. Name the thing: the file, the command, the behaviour. |
| `context` | What is at stake and why it came up, in a few sentences. What you found, not how you found it. |
| `options` | Two to four real choices. For each: a short `id` in kebab-case such as `keep-the-flag`, what it `does`, and what it `cost`s: what is given up, what breaks, what has to follow. An option nobody would pick is not an option. |
| `recommendation` | The `option` you would take, by its id, and `why` in a sentence or two. Always one. If you are not sure, say what would change your mind. |

## What happens after

An ask is how your run ends. Your result is the asks, and nothing that follows your work starts while they are open.

When they are answered, this same work runs again with the answers as decisions already made. That run finishes what yours could not.

In delivery the operator's answer also picks what happens next, from five routes: `send-back` (the builder continues with the answer), `replan`, `take-as-is` (the change goes on as it is and nothing more is built), `drop` (the change is closed without merging) and `reshape` (the change is closed, its branch kept, until the item is shaped again). An option the builder should carry out needs nothing from you: it is shown as a send-back. When an option of yours is itself one of the other four, such as "leave it as it is" or "plan it again", give it that route's id, so your recommendation is not shown as a send-back.

So before you end:

- **Find every decision you need, not only the first.** The operator answers them as a set, and each further round costs a full run.
- **Do not build on your own recommendation.** What depends on an open decision waits for the answer.
- **Leave what you did find.** Work that holds whichever way the answer goes is worth keeping, and what you learned belongs in your result, so the next run does not start from nothing.

When you are given decisions already made, they are settled: build on them, and do not raise them again.

## A good one and a bad one

Good:

> **question:** Does "never force-delete" allow a compare-and-delete (`git update-ref -d <ref> <start-point>`), or does it mean literally `git branch -d`?
> **options:** compare-and-delete: Git refuses if the branch moved, so there is no window between checking and deleting; it is not the command the issue names. `git branch -d`: the command as written; it checks against the current branch, not the start point, so it can refuse an unused branch or accept a moved one.
> **recommendation:** `compare-and-delete`, because it enforces the rule the issue is protecting.

Bad:

> **question:** Is this approach okay?

It names nothing, offers no options, and can only be answered by reading the whole change.
