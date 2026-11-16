# Validate one change

Find out whether this change works, by the check this project's maintainers trust. Report what the check showed, not what you expect it to show.

The item:

$INPUTS.item

The change, as build reported it:

$INPUTS.build

The project's check, as its maintainers declared it:

$INPUTS.validate_command

When you run the project's own software, give it scratch data and a scratch home of its own. A database or other server you need is one you start yourself, reachable only through a socket in a directory you made, and you stop it when you are done. Never connect to a server you did not start, whatever port answers: it holds someone's real data. It must not read or change the operator's real data, configuration or databases: software under work can change what it opens.

You are in your own checkout of the project. Check out the change's commit and run the check on exactly that tree. When a check is declared above, run exactly that command. When none is declared, find the check the maintainers use, run it, and propose it as an ask so they can declare it.

Change no code. If the check fails, report the failure; do not fix it.

Read `$PACK_DIR/.shared/ask.md` before you end: it says when a decision is yours to make and when it is an ask, what we expect in one, and what happens after.

End in one of three outcomes:

- **passed**: the check ran on the change's commit and passed.
- **failed**: the check failed, or could not run. Say which, and what the output showed.
- **ask**: finishing needs a decision that is not yours. Leave it as an ask and end here; nothing that follows your work starts until it is answered, and then this work runs again.
