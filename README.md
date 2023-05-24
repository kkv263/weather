This is a frontend project scaffolded with esbuild.

Live Link:  https://gorilla-weather.vercel.app/

## Running Locally

First, visit: The Foreca at https://developer.foreca.com/, sign up for a free trial account, and generate an API key. Keep this handy until later

(Optionally) Next, visit https://platform.openai.com/ and generate an API Key here. This is not needed to run the main functionality of the weather application but rather provide an extra "oomph" to the application. You can also see this in action in the live link.

In the src/secret.js file

```
WEATHER_API_KEY= XXXXX
OPENAI_API_KEY= XXXXX
```

Finally, run the development server:

```
npm run dev
# or
yarn dev
# or
pnpm dev
```
Open http://localhost:5173/  with your browser to see the result.

(There is some caching involved, to clear use `localStorage.clear();`)

## Design / Implementation

For design notes and information please check the [design.md](https://github.com/kkv263/gorilla_weather/blob/master/design.md) file. Here we discuss implementation and design choices for this project.
