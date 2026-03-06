-- Migration: Add scheduled_day_of_week column to workout_templates
-- Date: 2026-03-02
-- Description: Allows users to schedule templates for specific days of the week (0=Monday, 6=Sunday)

ALTER TABLE workout_templates 
ADD COLUMN scheduled_day_of_week INTEGER CHECK(scheduled_day_of_week BETWEEN 0 AND 6);

-- Note: Column is nullable. NULL means template is not scheduled for a specific day.
-- Values: 0 (Monday), 1 (Tuesday), 2 (Wednesday), 3 (Thursday), 4 (Friday), 5 (Saturday), 6 (Sunday)
