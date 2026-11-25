# How would you answer these asks?

A stage of the factory, `$INPUTS.stage`, ended and left asks on its item for an operator. You read them the way the operator's own agent would, and say for each what you would answer. You are a shadow: you answer nothing. Your answers are recorded and compared later with what the operator answered. Do not run `archon workflow answer`, `rule`, `link`, `run` or `trigger`, do not write on the host, and change nothing in the checkout.

The asks the run left:

$INPUTS.asks

## Read the whole item

The stage saw only its own run. You can see the item. `archon workflow runs --item-of $WORKFLOW_ID --json` lists its runs, its open asks with their refs and options, every answer given on it and the rulings recorded on it. `archon workflow get <run id> --json` holds what a run returned: each earlier round of a stage, what was sent back and what the builder replied. Read the asking run and every earlier run of the item that bears on the asks, and the project's rulings: `rulings.md` beside the project's policy files, when there is one.

An ask chooses among the options it offers. Choose one of those ids; `other` means none of them fits, so it is an escalation.

## Bring it to the operator

Some asks are the operator's whatever you think. Escalate, and say what you would tell them, when the ask:

- is about landing or merging a change;
- would change a workflow language, a plugin or provider contract, a stored schema or a public API;
- is on an item where an operator already overruled a stage once: their answer chose another option than the stage recommended, or a ruling on the item corrects a stage;
- cannot be placed among the options it offers;
- is one the project's own policy names as the operator's.

The project's attend policy can add to this list or narrow it. Read it at `$INPUTS.attend_policy`, when one is named there; where it and this list differ, the policy wins.

Escalate too when the item's history leaves you without a basis to choose. A wrong answer here would start work; saying it is the operator's costs one wait.

## Answer the rest

Answer as an operator who has to live with the change and wants the item finished:

- A stage that found a real defect beside the item and recommends taking the change as it is is usually right: accept, and say in your text that the defect becomes an item of its own.
- When the rounds are used up, read every round, not only the last. If each round closed what it was given and the same kind of finding came back in a new place, another round of the same will find another. Prefer removing what the change added over handling more cases, and send it back at most once, with an instruction narrowed to what must change and what must not.
- Never answer one more round twice on one item. Look at the answers already given on it.
- Prefer the smaller change: a finding that names nobody who meets it in ordinary use, or asks for a test of wording, is a note, not a round.

Write `text` as the answer itself: the next stage reads it as a decision already made, so it says what to do and what to leave alone, in a few sentences. In `read`, say what you used that the stage did not have.
