# Statements

Every meaningful line in Diag.JS source is one of four statements.

## `title`

```txt
title "Your diagram title"
```

Rules:

- Optional
- Allowed once
- Applies to the whole diagram
- Duplicate titles throw a syntax error

Use `title` first for readability, even though the parser only requires that it not be repeated.

## `node`

```txt
node <id> "Label"
node <id> "Label" symbol <symbol>
```

Examples:

```txt
node MSB "Main Switchboard"
node AHU1 "Air Handler 1" symbol ahu
node wan "Carrier Internet" symbol cloud
```

Rules:

- The id must be unique.
- The label must be quoted.
- The `symbol` clause is optional.
- If `symbol` is omitted, the renderer tries alias normalization and heuristic inference before falling back to a generic device family.

Best practice:

- Use explicit symbols when the drawing needs deterministic output.
- Rely on inference only for convenience or quick sketches.

## `edge`

```txt
edge <fromId> <toId>
edge <fromId> <toId> "Optional label"
```

Examples:

```txt
edge util xfmr "service"
edge msb panel1 "feeder"
edge core spine "100G fabric"
```

Rules:

- Both endpoint nodes must already exist.
- Labels are optional.
- Labels matter: renderers use them to infer wire types or media classes.

Use labels intentionally. For example:

- Electrical uses labels such as `service`, `branch`, or `control`.
- HVAC uses labels such as `supply air`, `chilled water return`, or `controls`.
- Network uses labels such as `internet`, `400G`, or `wifi`.

## `param`

```txt
param <nodeId> <key> <value>
param <nodeId> <key> "Quoted multi-word value"
```

Examples:

```txt
param MSB system 480Y/277V
param AHU1 lane air
param AHU1 column 4
param AHU1 slot 0
param core role "border pair"
```

Rules:

- The target node must already exist.
- Values are always stored as strings.
- Repeating the same key overwrites the previous value on that node.
- Reserved keys enable renderer behavior; all other keys are treated as node metadata and usually render as parameter text.

## Recommended Ordering

Use this structure consistently:

```txt
title "Diagram Title"

node ...
param ...
param ...
node ...
param ...

edge ...
edge ...
```

This is not just cosmetic. It mirrors the compiler's requirements and keeps large diagrams reviewable in diffs.
