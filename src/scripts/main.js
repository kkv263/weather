import { waitForElement, getCardinalDirection } from './util.js'
import { WEATHER_API_KEY, OPENAI_API_KEY } from './secret.js';

// API TOKENS
const WEATHER_API_TOKEN = WEATHER_API_KEY;
const OPENAI_API_TOKEN = OPENAI_API_KEY ?? '';

// Set up constants here.
const date = new Date();
const dayOfWeek = date.getDay();
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const formattedDate = date.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"});
const cachedLocation = localStorage.getItem('weatherapp_location')

// Change the date to the current date in the header
waitForElement('.forecast__date').then((date) => {
  date.textContent = formattedDate.toUpperCase();
});

// Wait for location element and search through API with inserted value in search.
// Also handles errors through API and blank values.
// Location is cached in localStorage so that next visit already displays weather for user's last searched location
waitForElement('.location').then((location) => {
  const input = location.querySelector('.location__input');
  const form = location.querySelector('.location__form');
  const button = location.querySelector('.location__search');
  const errorText = location.querySelector('.location__error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { value } = input;

    if (!value) { 
      errorText.classList.remove('hidden');
      return; 
    }
    
    button.classList.add('loading');
    button.textContent = 'Loading...';

    fetch(`https://pfa.foreca.com/api/v1/location/search/${value}?token=${WEATHER_API_TOKEN}`).then(res => res.json()).then(data => {
      const { locations: [result]} = data;
      localStorage.setItem('weatherapp_location', JSON.stringify(result));
      fetchWeather(result.id, result.name, result.timezone)
    }).catch((error) => {
      errorText.classList.remove('hidden');
      button.classList.remove('loading');
      button.textContent = 'Search';
    });;
  })
})

// Fetch weather information from API. Make sure all elements that are being changed exists and all API calls are done.
const fetchWeather = (location, name, timezone) => {
  Promise.all([fetch(`https://pfa.foreca.com/api/v1/forecast/daily/${location}?token=${WEATHER_API_TOKEN}&tempunit=F&windunit=MPH`).then(res => res.json()),
  fetch(`https://pfa.foreca.com/api/v1/current/${location}?token=${WEATHER_API_TOKEN}&tempunit=F&windunit=MPH`).then(res => res.json()),
  waitForElement('.forecast__list'),
  waitForElement('.forecast__main'),
  waitForElement('.forecast'),
  ]).then(([forecastData, currentData, forecastList, forecastMain, forecastContainer]) => {
    const { forecast } = forecastData;
    const { current } = currentData;
    const errorText = document.querySelector('.location__error');
    const button = document.querySelector('.location__search');
    const input = document.querySelector('.location__input');

    const indexArray = Array.from(new Array(7), (x,i) => i)
  
    // Reordered days array so that current day is at the start of the list.
    const daysReordered = indexArray.slice(dayOfWeek).concat(indexArray.slice(0, dayOfWeek))
  
    // Update HTML with fetched information
    let forecastHTML = ``;
  
    for (let i = 1; i < daysReordered.length; i++) {
      const index = daysReordered[i];

      forecastHTML += `
        <li class="forecast__list-item">
          <div class="forecast__day">
            <span>${days[index].substring(0, 3).toUpperCase()}</span>
            <div class="forecast__icon">
              <img src="https://developer.foreca.com/static/images/symbols/${forecast[index].symbol}.png" alt="weather icon" />
            </div>
          </div>
          <div class="forecast__temp-container">
          <div class="forecast__temp forecast__temp--high">
            <span class="forecast__temp-degree">${forecast[index].maxTemp}&deg;F</span>
            <span>HIGH</span>
            </div>
            <div class="forecast__temp forecast__temp--high">
              <span class="forecast__temp-degree">${forecast[index].minTemp}&deg;F</span>
              <span>LOW</span>
            </div>
          </div>
          <div class="forecast__extra">
            <div class="forecast__wind-speed">
              <span>${forecast[index].maxWindSpeed} mph</span>
              <span>WIND</span>
            </div>
            <div class="forecast__wind-dir">
              <span>${getCardinalDirection(forecast[index].windDir)}</span>
              <span>WIND</span>
            </div>
            <div class="forecast__rain">
              <span>${forecast[index].precipAccum}</span>
              <span>RAIN</span>
            </div>
          </div>
        </li>`;
    }

    const forecastMainHTML = `<div class="forecast__list-item">
      <div class="forecast__main-container">
        <div class="forecast__main-left">
          <div class="forecast__day forecast__day--desktop">${name} - ${days[dayOfWeek]}</div>
          <div class="forecast__summary">
            <h2>Daily Summary:</h2>
            <p>Today is going to be a good day!</p>
          </div>
        </div>
        <div class="forecast__main-right">
          <div class="forecast__day forecast__day--mobile">${name} - ${days[dayOfWeek]}</div>
          <div class="forecast__main-forecast">
            <div class="forecast__icon"><img src="https://developer.foreca.com/static/images/symbols/${current.symbol}.png" alt=${current.symbolPhrase} /></div>
            <div class="forecast__temp">${current.temperature}&deg;</div>
            <div class="forecast__unit">Fahrenheit</div>
          </div>
          <div class="forecast__bottom">
            <div class="forecast__wind-speed forecast__bottom-info">
              <img src="https://bmcdn.nl/assets/weather-icons/v3.0/line/svg/wind.svg" alt="wind icon" />
              <span>${current.windSpeed} mph</span>
              <span>WIND SPD</span>
            </div>
            <div class="forecast__wind-dir forecast__bottom-info">
              <img src="https://bmcdn.nl/assets/weather-icons/v3.0/line/svg/compass.svg" alt="windsock" />
              <span>${getCardinalDirection(current.windDir)}</span>
              <span>WIND DIR</span>
            </div>
            <div class="forecast__rain forecast__bottom-info">
              <img src="https://bmcdn.nl/assets/weather-icons/v3.0/line/svg/raindrops.svg" alt="umbrella" loading="lazy">
              <span>${current.precipRate}%</span>
              <span>RAIN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;

    forecastMain.innerHTML = forecastMainHTML;
    forecastList.innerHTML = forecastHTML;
    forecastContainer.classList.add('active');
    button.classList.remove('loading');
    errorText.classList.add('hidden');
    button.textContent = 'Search';
    input.value = name;

    // Fetch from OpenAI to create a summary of the weather.
    if (!OPENAI_API_TOKEN) { return; }
    const summary = document.querySelector('.forecast__summary p');
    summary.textContent = 'AI Generating Summary...'

    const dateAndTime = new Intl.DateTimeFormat([], {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    const timeOfDay = current.symbol.includes('n') ? 'Night' : 'Day';
  
    const prompt = `Can you create a summary of the weather with this information without using numbers? Temperature: ${current.temperature}, Feels like: ${current.feelsLikeTemp}, Humidity: ${current.relHumidity}, Wind speed: ${current.windSpeed}, Wind Direction: ${getCardinalDirection(current.windDir)}, Precipitation chance:${current.precipRate}, Location:${name}, Time:${dateAndTime}, Time of Day: ${timeOfDay}`;
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + OPENAI_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'model': 'gpt-3.5-turbo',
        'messages': [
          {'role': 'user', 'content': prompt},
          {
            'role': 'system',
            'content': `You are an weather forecaster with a very exciting personality from the area of ${name}`
          }
        ]
      })
    }).then((res) => res.json()).then((data) => {
      const {choices:[msg]} = data
      const txt = msg.message.content.trim();
      let i = 0;
      let start = false;
      summary.textContent = '';
      
      const typeWriter = () => {
        if (i < txt.length) {
          // Sometimes AI randomly generates blanks and punctuation at the beginning.
          // Conditional to prevent and make sure it starts with a character.
          if (txt.charAt(i) !== '' && !txt.charAt(i).match(/\W/)) { start = true}
          if (start) {summary.textContent += txt.charAt(i);}
          i++;
          setTimeout(typeWriter, 10);
        }
      }

      typeWriter();

      // summary.textContent = msg.message.content;
    }).catch((error) => {console.log(error)});
  });
}

// If there's a previous search, fetch the weather.
if (cachedLocation) {
  const results = JSON.parse(cachedLocation)
  fetchWeather(results.id, results.name)
}


// Example Object
// {
//   "current": {
//     "time": "2023-05-21T05:36+03:00",
//     "symbol": "d000",
//     "symbolPhrase": "clear",
//     "temperature": 45,
//     "feelsLikeTemp": 43,
//     "relHumidity": 82,
//     "dewPoint": 40,
//     "windSpeed": 4,
//     "windDir": 350,
//     "windDirString": "N",
//     "windGust": 7,
//     "precipProb": 1,
//     "precipRate": 0,
//     "cloudiness": 0,
//     "thunderProb": 0,
//     "uvIndex": 0,
//     "pressure": 1030.49,
//     "visibility": 10567
//   }
// }

// Example 2
// {
//   "date": "2023-05-21",
//   "symbol": "d200",
//   "maxTemp": 68,
//   "minTemp": 46,
//   "precipAccum": 0,
//   "maxWindSpeed": 8,
//   "windDir": 201
// }