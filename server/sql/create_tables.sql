CREATE TABLE users (
    id      serial PRIMARY KEY,
    name    text NOT NULL,
    email   text NOT NULL UNIQUE,
    picture text,
    password_hash text NOT NULL
);

CREATE TABLE events (
   id serial PRIMARY KEY,
   creator_id serial not null,
   name text not null,
   date timestamp not null,
   type int not null,
   foreign key (creator_id) references users(id) on delete cascade
);

CREATE TABLE participants(
    id serial PRIMARY KEY,
    user_id serial not null,
    event_id serial not null,
    participant_role int not null,
    foreign key (user_id) references users(id) on delete cascade,
    foreign key (event_id) references events(id) on delete cascade
);

CREATE TABLE gifts (
  id serial PRIMARY KEY,
  creator_id serial not null,
  event_id serial not null,
  created_at timestamp not null,
  content text not null,
  foreign key (creator_id) references users(id) on delete cascade,
  foreign key (event_id) references events(id) on delete cascade
);