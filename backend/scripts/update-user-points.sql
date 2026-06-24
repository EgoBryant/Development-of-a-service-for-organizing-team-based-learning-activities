UPDATE "Users" SET "UserPoints" = 50 WHERE LOWER("Email") = 'c@c.c';
UPDATE "Users" SET "UserPoints" = 30 WHERE LOWER("Email") = 'b@b.b';
SELECT "Id", "Email", "UserPoints" FROM "Users" WHERE LOWER("Email") IN ('c@c.c', 'b@b.b', 's@c.c');
