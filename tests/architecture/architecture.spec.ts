import { filesOfProject, extendJestMatchers } from 'tsarch';

/**
 * Architecture tests enforcing vertical slice boundaries.
 * Using tsarch fluent API + custom Jest matcher toPassAsync().
 */

extendJestMatchers();

describe('Architecture - Vertical Slice Boundaries', () => {
  const featureNames = ['events', 'attendances', 'occurrences'];

  test('Feature slices do not depend directly on each other', async () => {
    for (const source of featureNames) {
      for (const target of featureNames) {
        if (source === target) continue;
        // src/features/source should not depend on src/features/target
        await expect(
          filesOfProject()
            .inFolder(`src/features/${source}`)
            .shouldNot()
            .dependOnFiles()
            .inFolder(`src/features/${target}`)
        ).toPassAsync();
      }
    }
  });

  test('Domain layer does not depend on infrastructure', async () => {
    for (const feature of featureNames) {
      await expect(
        filesOfProject()
          .inFolder(`src/features/${feature}/domain`)
          .shouldNot()
          .dependOnFiles()
          .inFolder('src/infrastructure')
      ).toPassAsync();
    }
  });

  test('Domain layer does not depend on interface layer', async () => {
    for (const feature of featureNames) {
      await expect(
        filesOfProject()
          .inFolder(`src/features/${feature}/domain`)
          .shouldNot()
          .dependOnFiles()
          .inFolder('src/interface')
      ).toPassAsync();
    }
  });

  test('Domain layer does not depend on persistence implementation of same feature', async () => {
    for (const feature of featureNames) {
      await expect(
        filesOfProject()
          .inFolder(`src/features/${feature}/domain`)
          .shouldNot()
          .dependOnFiles()
          .inFolder(`src/features/${feature}/persistence`)
      ).toPassAsync();
    }
  });

  test('Features folder is free of cycles', async () => {
    await expect(
      filesOfProject()
        .inFolder('src/features')
        .should()
        .beFreeOfCycles()
    ).toPassAsync();
  });
});

// Examples for future rules:
// Restrict shared -> features usage (uncomment to enforce):
// test('Shared does not depend on feature slices', async () => {
//   await expect(
//     filesOfProject()
//       .inFolder('src/shared')
//       .shouldNot()
//       .dependOnFiles()
//       .inFolder('src/features')
//   ).toPassAsync();
// });
