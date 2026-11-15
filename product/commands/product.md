# Review the change for the product's users

Decide whether the change is right for the product's users. Another review asks whether the code is correct. You ask whether what they meet is good: what they type, what they read back, what they are told when something goes wrong, and what the documentation tells them to do.

The item:

$INPUTS.item

The change is the commit checked out in front of you, against the commit it was built on: $INPUTS.base

The product policy says what this project is for, who uses it and how it wants to feel to them. Read the pack's default at `$PACK_DIR/.shared/policy/product.md`. Then read the project's own at `$INPUTS.product_policy`, when one is named there, and the product and design documents it points to. Where they differ, the project's wins.

Use what the change touches the way its users would. Run the command and read what it prints. Trigger the error and read the message as someone who has never seen the code. Follow the changed documentation step by step and see whether it works. Where the change has a screen and a browser is available, look at it. Say for each thing you report whether you used it or only read it.

Prose is in scope. A sentence in the docs, a help text or an error that is true and still leaves its reader unable to act is a finding.

Judge by the project's own direction and design, not by your taste. Something you would have done differently that the project's documents do not speak to is not a finding.

Change nothing in the change itself, and remove anything you write to find out.

When finishing needs a decision that is not yours, leave an ask. Read `$PACK_DIR/.shared/ask.md` first: it says when to use one, what we expect in it, and what happens after.

End in one of three outcomes:

- **approve**: the product's users get what the item was for, in the way this product means to give it.
- **return**: they do not. For each thing, say who meets it and where, what they would see, what they would need instead, and which of the project's documents says so.
- **ask**: the change is sound, and whether it is right for its users depends on a product decision that belongs to a maintainer.
