-- Remove demo users and their associated teams

-- First, unassign demo users from teams
UPDATE "Users" SET "TeamId" = NULL
WHERE "Email" IN (
    'ivanov@teamexam.local',
    'kozlov@teamexam.local',
    'petrov@teamexam.local',
    'novikov@teamexam.local',
    'sidorov@teamexam.local',
    'volkov@teamexam.local',
    'admin@teamexam.local'
);

-- Delete teams that were created by demo users (captain is a demo user)
-- (cascade will handle members if FK on delete cascade; else use subquery)
DELETE FROM "Teams"
WHERE "CaptainId" IN (
    SELECT "Id" FROM "Users"
    WHERE "Email" IN (
        'ivanov@teamexam.local',
        'petrov@teamexam.local',
        'sidorov@teamexam.local'
    )
);

-- Now delete the demo users
DELETE FROM "Users"
WHERE "Email" IN (
    'ivanov@teamexam.local',
    'kozlov@teamexam.local',
    'petrov@teamexam.local',
    'novikov@teamexam.local',
    'sidorov@teamexam.local',
    'volkov@teamexam.local',
    'admin@teamexam.local'
);

-- Verify remaining users
SELECT "Email", "Role", "UserPoints" FROM "Users" ORDER BY "UserPoints" DESC;
