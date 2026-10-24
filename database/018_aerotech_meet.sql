CREATE TABLE IF NOT EXISTS meet_rooms(
 id UUID PRIMARY KEY,
 employer_id UUID NOT NULL REFERENCES employer_accounts(id) ON DELETE CASCADE,
 title TEXT NOT NULL,
 starts_at TIMESTAMPTZ NOT NULL,
 duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK(duration_minutes BETWEEN 15 AND 240),
 created_by_employee_id UUID REFERENCES workforce_employees(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(employer_id,id)
);
CREATE TABLE IF NOT EXISTS meet_participants(
 employer_id UUID NOT NULL,
 room_id UUID NOT NULL,
 employee_id UUID NOT NULL,
 PRIMARY KEY(room_id,employee_id),
 FOREIGN KEY(employer_id,room_id) REFERENCES meet_rooms(employer_id,id) ON DELETE CASCADE,
 FOREIGN KEY(employer_id,employee_id) REFERENCES workforce_employees(employer_id,id) ON DELETE CASCADE
);