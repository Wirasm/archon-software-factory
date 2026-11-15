# ask

Hands one decision to an operator and lets you finish your work.

## When to use it

Use it when finishing your work needs a decision that is not yours to make:

- the item can be read two ways and the ways lead to different changes;
- doing what the item asks means giving up something the project holds to, or changing something it promised;
- the right answer depends on where the project is going, what it will support, or what it costs someone else.

## When not to use it

- **You can decide it.** A choice between two ways to write the same thing is yours. Make it and say why in your notes.
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
| `options` | Two to four real choices. For each: what it `does`, and what it `cost`s: what is given up, what breaks, what has to follow. An option nobody would pick is not an option. |
| `recommend` | The option you would take. Always one. |
| `why` | Why that one, in a sentence or two. If you are not sure, say what would change your mind. |

## What happens after

You are not waiting. Finish your work and end your run; the ask goes to the operator when your run ends.

Until it is answered, treat the question as open. Do the part of your work that does not depend on it. For the part that does, say in your result that it rests on your recommendation, so whoever reads it knows what to revisit if the answer is different.

The answer reaches whoever continues the work as a decision already made. When you are given decisions already made, they are settled: build on them, and do not raise them again.

## A good one and a bad one

Good:

> **question:** Does "never force-delete" allow a compare-and-delete (`git update-ref -d <ref> <start-point>`), or does it mean literally `git branch -d`?
> **options:** compare-and-delete: Git refuses if the branch moved, so there is no window between checking and deleting; it is not the command the issue names. `git branch -d`: the command as written; it checks against the current branch, not the start point, so it can refuse an unused branch or accept a moved one.
> **recommend:** compare-and-delete, because it enforces the rule the issue is protecting.

Bad:

> **question:** Is this approach okay?

It names nothing, offers no options, and can only be answered by reading the whole change.
