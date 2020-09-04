# Jack Syntax Analyzer

This is project 10 in the Nand to Tetris course. The only difference is that instead of producing an XML file, this program produces a JSON file, which allows it to be more easily processed.

The way it works is fairly straightforward. Each grammatical structure is made into an object, which is assembled by function calls that assemble the constituent pieces of that grammatical structure. It would probably be more clear with an example:

```js
function eatSubroutineBody(parseObject, regexes) {
  const openBrace  =     eatSymbol(parseObject, regexes);
  const varDecs    =    eatVarDecs(parseObject, regexes);
  const statements = eatStatements(parseObject, regexes);
  const closeBrace =     eatSymbol(parseObject, regexes);

  if (openBrace.token !== '{' || closeBrace.token !== '}') throwError(parseObject);

  return {
    openBrace,
    varDecs,
    statements,
    closeBrace,
  }
}
```

This is the code for assembling a subroutine body. A subroutine body consists of an open brace, variable declarations, statements, and a closing brace, so each of those are gathered in order and assembled into an object after some rudementary error checking. All functions in `analyze.js` are essentially constructed in this way, save for `parse`, which coordinates the process.

There's a bit more going on behind the scenes, though. `parseObject` is an object that has two keys, `currentIndex` and `tokens`. I prefer to write in a procedural style, so instead of making a class with two attributes and having methods that alter the state of the class, I just created an object that gets passed around from function to function being altered as it goes. If you prefer to do it the object-oriented way that's fine, but just so we're on the same page, you're wrong.

Anyway, each function that begins with "eat" advances `currentIndex` by however far it needs in order to eat away the part of the code it's supposed to. So for example, `eatSubroutineBody` would advance `currentIndex` by 80 if there were a subroutine body that was 80 tokens long.

Because of the nested nature of the program, however, there's actually only need for one function to advance `currentIndex`, that function being `eatTerminalToken`, which always advances the index by one.

That's the essential nature of the analyzer. There's a bit more to the tokenization process and all that, which is accomplished by looking through and matching regexes, but nothing too complicated.
