# Socket BNB frontend concept

Editable React/Vite frontend inspired by the interaction model of thesocket.app and adapted to BNB Chain terminology.

## Scope

- Landing page with interactive hook, swap, permission and chart demonstrations
- Swap, Pools, Positions and Create-pool product routes
- Documentation route
- Responsive desktop/mobile layout
- Frontend-only safe boundary: no wallet RPC, signatures or contract writes

## Run

```bash
npm install
npm run dev
```

The interface is deliberately labelled as a frontend preview wherever an unavailable write would otherwise be implied. Backend, indexer, wallet adapter and contracts can be connected later.
