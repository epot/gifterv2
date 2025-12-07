# Gifter v2

This is a complete rewrite of https://github.com/epot/gifter in Golang/React. The project was bootstrapped from https://github.com/martishin/react-golang-user-login-oauth.


## Links

- How to work locally [here](LOCAL.md)
- Backend documentation [here](server/README.md)
- Frontend documentation [here](client/README.md)

## Tech Stack

- **Frontend**: React.js, Material UI
- **Backend**: Go, Chi, goth
- **Database**: PostgreSQL
- **Auth Provider**: Google OAuth 2.0
- **Others**: Docker

## Context

I started this pet project as I had some unexpected time home ahead of me. 

The requirements were:

- Get a working prototype in a few days, even if it meant not providing all the features the original project had.
- Use golang backend side, I have been using it at work for a few years and really enjoy how productive you quickly get with it. I thought it would be fun to compare the end result between what I got with Play!/Scala and a lower level language like Go.
- Use React frontend side, I didn't get a lot of opportunity to use it - I had past experience with VueJS and Angular but only a very short/irrelevant one with React - and wanted to spend some time playing around with it.
- Find a new deployment stack. I was using Heroku before, but I didn't really like what the product became after they got acquired. I have a lot more experience with infra now, so I wasn't afraid of using something less "out-of-the box". 
- No AI whatsoever. I have never used any AI for development for work and this is not going to change any time soon.


### Development

I quickly decided to settle for https://github.com/martishin/react-golang-user-login-oauth as a bootstrap project. It uses exactly the tech stack I want, and I got it working locally very quickly. The backend was really extremely easy/fast to write as what it does is really not complicated: a simple CRUD API over events/gifts with only some advanced features to obfuscate some content. I decided to not change how I was persisting gifts in my previous project, using a fat JSON column for all the "advanced" content that you never need to query on. 

Frontend side things were a little more complicated, mostly because I had almost 0 experience with React. I quickly settled for Material UI to get nice styling and a lot of components, but it was not enough. For instance I was surprised that you need to add several dependencies and wire all of them together to get a "simple" form validation (I followed something like https://medium.com/@ignatovich.dm/implementing-advanced-form-validation-with-formik-and-yup-898d34e17ad0). I am sure what I am doing is terrible, but it ended up looking ok quickly enough to be a satisfying development experience.

### Deployment

As I said, I didn't want to go for Heroku this time. Their pricing model is kind of crazy today, and I had a bad experience of seeing it changing overnight. I read this blogpost https://madhanganesh.medium.com/golang-react-application-2aaf3bca92b1 and decided to give a try to Google App Engine. I already had the Google project as I wanted to support Google authentication. Deploying the project there was a pleasant experience. However, I was surprised how tricky it was to get all the nitty gritty details right. I didn't think my setup was super exotic: there is a backend exposing a REST API and I want a frontend service a single page application. I followed https://medium.com/@rgoyard/how-to-deploy-a-single-page-application-and-its-backend-to-google-app-engine-353ff93bd38c but it was not fully working, for instance loading directly a subpage of the website would end up in a 404. I ended up fighting with it for some time before I managed to find the correct setup that is spread in 3 files:

- `app.yaml` that defines the single page application deployment configuration
- `server/api.yaml` that defines the backend deployment configuration (this file is not committed as it contains some secrets, but there is a template file `server/api.yaml.example)
- `dispatch.yaml` to explains how requests are routed to the single page application or the backend depending on the route

In order to push a frontend update :

- `npm run build` from the `client` folder
- `gcloud app deploy` from the root folder

The last piece required to have something working was the database. When I started to click around in Google UI I realized that it was probably not what I wanted: I would get a dedicated fat machine, which is kind of stupid for my usecase (no one could be using the website for weeks) and would probably end up being super expensive - which was not really clear when I was trying to create an instance. I gave Neon a try, as I heard from them at work. It was a *great* experience. In a few clicks I signed up to their product, and got a serverless database I could connect to. They even provide a lot of observability dashboards out of the box, you don't even need to have extra monitoring to start playing with it. With this and the google console logs explorer I was able to troubleshoot the last deployment problems and got something that worked.
