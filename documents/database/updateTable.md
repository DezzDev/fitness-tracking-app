# Update Table
## its how to update a table

### disable foreign keys
PRAGMA foreign_keys = OFF;

### create new table
CREATE TABLE `__new_workouts` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `user_id` integer NOT NULL,
  `title` text,
  `notes` text NOT NULL,
  `created_at` numeric DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);

### insert data from old table
INSERT INTO
  `__new_workouts` (`id`, `user_id`, `title`, `notes`, `created_at`)
PRAGMA foreign_keys = OFF;
CREATE TABLE `__new_workouts` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `user_id` integer NOT NULL,
  `title` text,
  `notes` text NOT NULL,
  `created_at` numeric DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
INSERT INTO
  `__new_workouts` (`id`, `user_id`, `title`, `notes`, `created_at`)
SELECT
  `id`,
  `user_id`,
  `title`,
  `notes`,
  `created_at`
FROM
  `workouts`;

### drop old table
DROP TABLE `workouts`;

### rename new table
ALTER TABLE `__new_workouts`
RENAME TO `workouts`;

### enable foreign keys
PRAGMA foreign_keys = ON;