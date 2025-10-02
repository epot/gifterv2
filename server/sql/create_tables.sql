CREATE TABLE users (
    id      serial PRIMARY KEY,
    name    text NOT NULL,
    email   text NOT NULL UNIQUE,
    picture text,
    password_hash text NOT NULL
);

CREATE TABLE events (
   id serial PRIMARY KEY,
   creatorid serial not null,
   name text not null,
   date timestamp not null,
   type int not null,
   foreign key (creatorid) references users(id) on delete cascade
);

CREATE TABLE participants(
    id serial PRIMARY KEY,
    userid serial not null,
    eventid serial not null,
    participant_role int not null,
    foreign key (userid) references users(id) on delete cascade,
    foreign key (eventid) references event(id) on delete cascade
);

CREATE TABLE gifts (
  id serial PRIMARY KEY,
  creatorid serial not null,
  eventid serial not null,
  creationDate timestamp not null,
  content text not null,
  foreign key (creatorid) references users(id) on delete cascade,
  foreign key (eventid) references event(id) on delete cascade
);