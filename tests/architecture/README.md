# Architecture Tests (TSArch)

These tests enforce Vertical Slice boundaries:

## Rules Implemented
1. Feature slices do not depend on other feature slices.
2. Domain layer does not depend on infrastructure.
3. Domain layer does not depend on interface layer.
4. Domain layer does not depend on its persistence implementation.
5. Features folder is free of import cycles.

## Run
```
npm test
```

## Extend
- To add a restriction so `shared` never depends on `features`, uncomment the sample in `architecture.spec.ts`.
- To define slice diagrams (more advanced), explore `slicesOfProject()` from TSArch with a regex like:
  `slicesOfProject().definedBy('src/features/(?<slice>[^/]+)/.*')`.

## Troubleshooting
- If Jest cannot parse config: ensure `jest.config.ts` does not use `require` in ESM context.
- If a test fails, TSArch will list violating files; refactor imports or relax rule.

## Suggested Next Rules
- Persistence allowed to depend on infrastructure only: explicit positive rules using slice diagrams.
- Shared utilities not depending on infrastructure or interface.

## References
- TSArch GitHub: https://github.com/mikaelvesavuori/tsarch
