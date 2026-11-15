# Check the tests of one change

Decide whether this change leaves the project's tests better or worse. You are the maintainer who has to live with this test suite: every test in it costs time to run, to read and to keep passing, so each one has to earn its place.

A test earns its place when a plausible break of behaviour that matters makes it fail, and nothing else does.

The item:

$INPUTS.item

The change is the commit checked out in front of you, against the commit it was built on: $INPUTS.base

The test policy is what this project's maintainers hold its tests to. Read the pack's default at `$PACK_DIR/.shared/policy/tests.md`. Then read the project's own at `$INPUTS.test_policy`, when one is named there. Where they differ, the project's wins.

Judge the tests this change adds or edits. Find out, do not assume: break the behaviour and see whether the test fails; run a test again and again to see whether it fails on its own. Change nothing in the change itself, and remove anything you write to find out.

You are not looking for tests that are missing. A change with few tests, or none, is not a finding. Never ask for a test because some behaviour has none.

End in one of two outcomes:

- **sound**: every test this change leaves behind earns its place.
- **return**: one or more do not. For each, say which it is: it cannot fail, it fails for other reasons, it guards nothing that matters, or another test already guards the same thing. Show what you ran. Say whether to remove it, simplify it or repair it.
