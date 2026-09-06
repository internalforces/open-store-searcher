# TASK-014 Test Plan

1. Write failing ResultCard tests for U01–U04: status pairs, missing values,
   all lifecycle fields, literal HTML evidence, three coverage states and provenance.
2. Implement internal display model and evidence components; run component tests.
3. Write failing App interaction tests for U04/U05/U07: real engine primary,
   conflict, tie, low, no-result, example-fill and repeated/invalid transitions.
4. Implement form/results/demo and local state; run component tests.
5. Add real-browser form sentinel, keyboard, wrapping and populated axe cases
   for U06/U08. Inspect desktop/mobile screenshots. Run pinned verify:full.
6. Review exact assertions against each requirement; record findings in status.md.
