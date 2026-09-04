# TASK-008 Continuation Test Plan

1. Capture failing day-7 tests before changing the freshness comparison and approval documents.
2. Add missing-module red tests for streamed CSV: delimiters, quoting/newlines, empty values,
   split encoded characters, invalid bytes/quoting/width, EOF, and explicit resource bounds.
3. Implement parser and narrow-run it. Then test/implement observation using exact accepted
   collector evidence and real validator/transformer with injected bounded entry/hash seams.
4. Test the actual streaming child boundary for EOF, error, timeout, byte limits, and cleanup.
5. Review exact design and operational research limits before any live row ingestion.
6. Run pinned full verification and independent review; only then perform bounded live observation
   in the approved reconstructed Ubuntu environment. Never turn missing evidence into acceptance.
7. Record exact test names, commands, live outcome, and unresolved external evidence in reports.
