import { useState, useEffect } from 'react'
import './App.css'
import clear_night from './assets/moon-and-stars.png'
import partly_cloudy_night from './assets/partly-cloudy-night.png'
import patchy_rain_possible_night from './assets/rainy-night.png'
import mist from './assets/haze.png'
import overcast from './assets/overcast.png'
import Button from '@mui/material/Button';
import { Input, TextField } from '@mui/material'

function App() {
  const cidades = ['New York', 'London', 'Paris', 'Moscow', 'Tokyo', 'São Paulo', 'Seoul', 'Mexico City', 'Jakarta', 'Cairo']
  const cidadeAleatoria = cidades[Math.floor(Math.random() * cidades.length)]

  const [inputValue, setInputValue] = useState(cidadeAleatoria)
  const [weatherData, setWeatherData] = useState(null)
  const [countryFlag, setCountryFlag] = useState(null)
  const [isLoadingFlag, setIsLoadingFlag] = useState(false)

  useEffect(() => {
    apiCallNow()
  }, [])

  const handleInputChange = (event) => {
    setInputValue(event.target.value)
  }

  function getCountryCode(countryName) {
    const apiUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;
    return fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          return data[0].cca2;
        }
      })
      .catch(error => {
        console.error('Error fetching country code:', error);
        return null;
      });
  }

  function fetchCountryFlag(countryCode) {
    setIsLoadingFlag(true);
    const flagUrl = `https://flagsapi.com/${countryCode}/flat/64.png`;
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setIsLoadingFlag(false);
        resolve(flagUrl);
      };
      img.onerror = () => {
        setIsLoadingFlag(false);
        reject(new Error('Failed to load country flag.'));
      };
      img.src = flagUrl;
    });
  }

  function apiCallNow() {
    const cidade = inputValue
    fetch('http://api.weatherapi.com/v1/current.json?key=d6d65e243da9426ca3745024230307&q=' + cidade + '&aqi=no')
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setWeatherData(data)

        const countryCode = getCountryCode(data.location.country);
        console.log(countryCode);

        // clear night icon
        if (data.current.condition.icon === "//cdn.weatherapi.com/weather/64x64/night/113.png") {
          data.current.condition.icon = clear_night;
        }

        // partly cloudy night icon
        if (data.current.condition.icon === "//cdn.weatherapi.com/weather/64x64/night/116.png") {
          data.current.condition.icon = partly_cloudy_night;
        }

        // patchy rain possible night icon
        if (data.current.condition.icon === "//cdn.weatherapi.com/weather/64x64/night/176.png") {
          data.current.condition.icon = patchy_rain_possible_night;
        }

        // mist icon
        if (data.current.condition.icon === "//cdn.weatherapi.com/weather/64x64/day/143.png" || data.current.condition.icon === "//cdn.weatherapi.com/weather/64x64/night/143.png") {
          data.current.condition.icon = mist;
        }

        // overcast icon
        if (data.current.condition.icon === "//cdn.weatherapi.com/weather/64x64/night/122.png" || data.current.condition.icon === "//cdn.weatherapi.com/weather/64x64/day/122.png") {
          data.current.condition.icon = overcast;
        }

        setWeatherData(data);

        getCountryCode(data.location.country)
          .then(countryCode => {
            if (countryCode) {
              fetchCountryFlag(countryCode)
                .then(flagUrl => {
                  setCountryFlag(flagUrl);
                })
                .catch(error => {
                  console.error('Failed to fetch country flag:', error);
                });
            } else {
              console.error('Could not find country code for:', data.location.country);
            }
          });
      });
  }

  return (
    <>
      <div className='pesquisa-div'>
        <input type="text" value={inputValue} onChange={handleInputChange} className='Input' />
        <Button variant="contained" onClick={apiCallNow} className='Button'>Search</Button>
      </div>

      <div className='resultado'>
        {weatherData && (
          <ul>
            <li className='cidade'>
              {weatherData.location.name}, {weatherData.location.country}
              {isLoadingFlag ? (
                <span className='loading'>Loading...</span>
              ) : (
                countryFlag && <img className='flag' src={countryFlag} alt="" />
              )}
            </li>
            <li className='temperatura'>Temperature: {weatherData.current.temp_c}°C</li>
            <li className='condicao'>Condition: {weatherData.current.condition.text}</li>
          </ul>
        )}
        {weatherData && (
          <img className='img' src={weatherData.current.condition.icon} alt="" />
        )}
      </div>
    </>
  )
}

export default App
