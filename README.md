# Jack Syntax Analyzer

This is project 10 in the Nand to Tetris course. The only difference is that instead of producing an XML file, this program produces a JSON file, which allows it to be more easily processed.

## General Overview

When this program receives code it goes through three main steps, each step considerbly more complex than the previous. These steps are

1. Removal of whitespace
2. Tokenization
3. Syntax analysis

These tasks are handled respectively by

1. `stripWhitespace.js`
2. `tokenizer.js`
3. `analyze.js`

`stripWhitespace.js` is a fairly boring program, but we'll look at the other two.

### `tokenizer.js`

The tokenizer is handled by two functions. One of them provides an array of all tokens. It does this by looking through the string that is provided to it and continually matching the largest substring that matches a certain regular expression. This regular expression matches against any valid token. This array is produced by the following function:

```js
function listMatches(string, regex) {
  const result = [];
  for (let i = 0; i < string.length;) {
    const match = string.substring(i).match(regex);
    if (!match) break;
    result.push(match[0]);
    i += match.index + match[0].length;
  }

  return result;
}
```

This function is called by the `tokenize` function, which creates a new array of tokens, but now each token is an object with a `token` key and `type` key. This function is implemented as so:

```js
function tokenize(code) {
  const regexes = provideRegexes();
  const tokens = listMatches(code, regexes.lexicalElementsRegex);

  return tokens.map(token => ({
    token: token,
    type:
      regexes.keywordRegex         .test(token) ? 'keyword'         : // keyword test must
      regexes.symbolRegex          .test(token) ? 'symbol'          : // precede identifier
      regexes.integerConstantRegex .test(token) ? 'integerConstant' : // and stringConstant
      regexes.stringConstantRegex  .test(token) ? 'stringConstant'  : // must precede identifier
      regexes.identifierRegex      .test(token) ? 'identifier'      :
      null,
  }));
}
```

You might notice the odd but aesthetically pleasing alignment. I don't know how much it adds to the readability, but it looks neat and tidy, and shows the similarity of the structures involved more clearly. This kind of alignment is used throughout `analyze.js` as well.

### `analyze.js`

The way `analyze.js` works is complex due, but fairly straightforward. Each grammatical structure is made into an object, which is assembled by function calls that assemble the constituent pieces of that grammatical structure. It would probably be more clear with an example:

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

And that's essentially it.
