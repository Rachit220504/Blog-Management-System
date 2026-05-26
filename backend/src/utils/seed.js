// Seeding disabled by default
// The project must not include mock/demo data in production. To keep this repository
// free of mock users, posts, or analytics, the original seeding routine has been
// intentionally disabled. If you absolutely need to run a local seed for
// development, set the environment variable `ALLOW_LOCAL_SEED=true` and ensure
// you understand that this will INSERT / DELETE data in your configured DB.

if (process.env.ALLOW_LOCAL_SEED !== 'true') {
  console.log('Seeding is disabled. To enable local seeding set ALLOW_LOCAL_SEED=true');
  process.exit(0);
}

// If enabled, load a minimal, non-sensitive seed implementation from a separate
// secure location or prompt the user. This file intentionally avoids hard-coded
// credentials or demo analytics data.
console.log('ALLOW_LOCAL_SEED is true, but no default seed is provided.');
console.log('Please implement a secure seed script or provide a sanitized JSON import.');
process.exit(0);
