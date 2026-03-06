# Grammar

Diag.JS parses one statement per non-empty line. The parser is line-oriented and intentionally small.

## Lexical Rules

- Leading and trailing whitespace on each line is ignored.
- Blank lines are ignored.
- A line whose trimmed content starts with `#` is treated as a comment.
- Inline comments are not supported.
- Node identifiers are case-sensitive and must start with a letter.
- Parameter keys are case-sensitive and must start with a letter.
- Symbol names are normalized by renderers to lowercase and convert `-` to `_`.
- Multi-word labels or parameter values must be wrapped in double quotes.
- Bare parameter values stop at the first whitespace character.

## Identifier Rules

Node ids, symbol tokens, and parameter keys all share the same allowed character family:

```txt
letter ( letter | digit | "_" | "-" )*
```

Examples:

- Valid ids: `MSB`, `ahu-1`, `tower_fa_01`
- Invalid ids: `1MSB`, `main panel`, `_panel`

## EBNF

```txt
program        ::= { line }
line           ::= blank | comment | title | node | edge | param
blank          ::= ""
comment        ::= "#" { any-char }
title          ::= "title" ws quoted-string
node           ::= "node" ws identifier ws quoted-string [ ws "symbol" ws symbol ]
edge           ::= "edge" ws identifier ws identifier [ ws quoted-string ]
param          ::= "param" ws identifier ws key ws (quoted-string | bare-token)

identifier     ::= letter { letter | digit | "_" | "-" }
symbol         ::= identifier
key            ::= identifier
quoted-string  ::= '"' { any-char except '"' } '"'
bare-token     ::= non-whitespace-sequence
ws             ::= one-or-more whitespace characters
```

## Ordering Constraints

The grammar alone does not tell the whole story. Authoring order matters:

- Only one `title` is allowed.
- `param` statements must come after the target `node` declaration.
- `edge` statements must come after both referenced `node` declarations.
- At least one node or edge statement must exist.

Because forward references are rejected during compilation, Diag.JS source is best written in declaration order: title, nodes, params, then edges.

## String Rules

Quoted strings can contain spaces but cannot contain an unescaped double quote because the parser does not currently implement escaping inside the regex grammar.

Good:

```txt
node msb "Main Switchboard"
param msb note "normal source"
```

Bad:

```txt
node msb "Main "Switchboard""
param msb note normal source
```

In the second `param` example above, only `normal` would be captured as the value because unquoted bare tokens stop at whitespace.

## Case Guidance

Use lowercase parameter keys for reserved behavior:

- `lane`
- `column`
- `slot`
- `voltage`
- `system`
- `secondary`
- `primary`
- `main`
- `input`

If you author `Lane` or `Voltage`, Diag.JS will preserve the text, but the renderer-specific behavior that looks for lowercase keys will not activate.
