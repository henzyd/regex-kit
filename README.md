# @henzyd/regex-kit

A toolkit of tested, composable regular expressions and helpers for JavaScript and
TypeScript.

> **Status:** early scaffolding. The package builds, tests and publishes, but the real
> API has not landed yet. `escapeRegExp` is a placeholder export.

## Install

```bash
npm install @henzyd/regex-kit
```

```ts
import { escapeRegExp } from '@henzyd/regex-kit';

new RegExp(escapeRegExp('1+1=2')).test('1+1=2'); // true
```

Both ESM and CommonJS are supported, with bundled type declarations:

```js
const { escapeRegExp } = require('@henzyd/regex-kit');
```

## Documentation

See [docs/](docs/README.md).

## Requirements

Node 20.19 or newer. The package has no runtime dependencies, and that is deliberate.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security issues follow [SECURITY.md](SECURITY.md).

## Licence

MIT
