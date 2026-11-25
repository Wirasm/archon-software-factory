# complexity

How hard a change is to get right. This is not its size. A long change that applies one helper at many call sites can be simple; a short change to how work is admitted, stored or ordered can be hard.

- `plain`: one obvious change and nothing to decide. Someone reading only the change would catch a wrong version of it.
- `ordinary`: the usual work. It takes judgment about where and how, inside one part, and its callers do not notice the choice.
- `involved`: a wrong version would not be caught by reading the change, because it alters how separate parts agree: a contract that other code implements or consumes, shared state, ordering, or security. Or it holds a decision a maintainer would want to make.

When you are between two steps, take the higher one. Calling a change plain says nothing is hidden in it; say it only when you can see the whole change and why it is enough.
