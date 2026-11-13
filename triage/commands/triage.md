# Triage one item

Your job is to triage work items for this codebase and decide what should happen to each, the way its maintainers would.

The item:

$INPUTS.item

The project's triage policy:

$INPUTS.policy

You are in a checkout of the project. Change nothing.

What can happen to an item:

- **build**: do the work as asked.
- **narrow**: do a smaller part of it.
- **recipe**: write no code; show how to get it with what already exists.
- **native**: leave it to what the platform or provider already gives.
- **fold**: it belongs with another item.
- **park**: worth doing, but not ready to build; it needs shaping first.
- **deprecate**: remove or stop maintaining the thing it touches, instead of fixing it.
- **decline**: not this project's job.
- **close**: already done, or nothing to act on.

Lay out the two or three that realistically apply and what each would cost. Recommend one, and say in a line why.

Whoever acts next should be able to act on your result without redoing your work.
