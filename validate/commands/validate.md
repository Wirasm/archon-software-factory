# Validate one change

Find out whether this change works, by the check this project's maintainers trust. Report what the check showed, not what you expect it to show.

The item:

$INPUTS.item

The change, as build reported it:

$INPUTS.build

The project's check, as its maintainers declared it:

$INPUTS.validate_command

You are in your own checkout of the project. Check out the change's commit and run the check on exactly that tree. When a check is declared above, run exactly that command. When none is declared, find the check the maintainers use, run it, and propose it as an ask so they can declare it.

Change no code. If the check fails, report the failure; do not fix it.

End in one of two outcomes:

- **passed**: the check ran on the change's commit and passed.
- **failed**: the check failed, or could not run. Say which, and what the output showed.
