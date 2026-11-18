# Tables

Database tables as flat panels over the scene: a name, then one row per column. Flat for the same reason as code: column names and types have to be read. Columns can slide in, carry what a change did to them, and light up when a query touches them. In the 3D world the query is a packet reaching the database; pulse the row's `lit` on the frame it lands.

## Tables

- `tables` ({ name: string; columns: ({ name: string; type: string; change: "added" | "changed" | "removed"; appear: number 0–1; lit: number 0–1 })[]; change: "added" | "changed" | "removed"; appear: number })[], required. Up to 3 in a column, or 2 in a row, before they crowd the frame.
- `links` ({ from: string; to: string; tone: "neutral" | "added" | "changed" | "removed"; progress: number 0–1 })[] = []
- `direction` "column" | "row" = "column". column stacks them and leaves most of the frame to the 3D scene; row reads more like a diagram.
- `side` "left" | "right" = "right". Name this side in the CameraRig shot's `panel`, and the rig keeps the 3D subject clear of it.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Table

- `name` string, required
- `columns` ({ name: string; type: string; change: "added" | "changed" | "removed"; appear: number 0–1; lit: number 0–1 })[], required. Only the columns the story needs, top to bottom.
- `change` "added" | "changed" | "removed". What the change being shown did to the whole table.
- `appear` number = 1. 0 = not there, 1 = fully in. Drive with pop(). Its place is kept while it is out.

## Column

- `name` string, required
- `type` string, required. Shown dim on the right: the SQL type, plus what matters about it (`int not null`). Keep it under ~18 characters.
- `change` "added" | "changed" | "removed". What the change being shown did to this column.
- `appear` number 0–1 = 1. 0 = not there, 1 = fully in. The rows below slide down as it grows.
- `lit` number 0–1 = 0. 0 = idle, 1 = a query is touching it right now. Pulse it on the frame the query's packet reaches the database.

## Link

- `from` string, required. `table.column` the link starts at, usually the foreign key.
- `to` string, required. `table.column` it points to. Link tables that sit next to each other.
- `tone` "neutral" | "added" | "changed" | "removed" = "neutral"
- `progress` number 0–1 = 1. How much of the link is drawn, growing out of `from`.

## Example

```tsx
const landed = t.at("read", "reads");

<World
  overlay={
    <Tables
      tables={[
        { name: "orders", columns: [
          { name: "id", type: "bigint pk" },
          { name: "refunded_at", type: "timestamptz", change: "added", lit: pulse(frame, landed) },
        ] },
        { name: "refunds", change: "added", appear: pop(frame, t.at("create")), columns: [...] },
      ]}
      links={[{ from: "refunds.order_id", to: "orders.id", tone: "added" }]}
    />
  }
>
  <Packet from={service} to={db} progress={ease(frame, landed - 14, landed)} />
</World>
```
