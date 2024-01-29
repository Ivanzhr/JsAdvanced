'use strict'
import Time from "./time.js";

class Weather{
    #api = {
       key: '4c3f473972e1c33dcc312b80ba828a09'
    }

    constructor(){
        this.search = document.querySelector('header img')
        this.buttons = document.querySelectorAll('.buttons button')
        this.hours = document.querySelector('.hours')
        this.input = document.querySelector('header input')
        this.willChange = document.querySelector('.willchange')
        this.date = document.querySelector('p .date')
        this.time = new Time();
        this.selectTiming = 'Today';
        this.cityName = 'kalush';
        this.selectDay = ''
        this.lat = '';
        this.lon = '';
    }

    selectCityByNav() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.lat = `lat=${position.coords.latitude}`;
                    this.lon = `lon=${position.coords.longitude}`;
                    this.getUrlForWeather()
                },
                (error) => {
                    console.error(`Помилка отримання геопозиції: ${error.message}`);
                }
            );
        } else {
            console.error('Геолокація не підтримується в цьому браузері.');
            this.getUrlForGeocoding();
        }
    }
    

    addClassActive(){
        this.selectTiming = event.target.innerText
        this.buttons.forEach(button =>  {
            button.classList.remove('active')
        })
        event.target.classList.add('active')
        this.getUrlForWeather();
    };


    setCityName(){
        this.cityName = this.input.value
        this.getUrlForGeocoding()
    }

    getUrlForGeocoding(){
            fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.#api.key}`)
            .then(response => response.json())
            .then(json => {
                this.lat = `lat=${json[0].lat}`
                this.lon = `lon=${json[0].lon}`
            })
            .then(() => this.getUrlForWeather())
            .catch(() => this.error())
    }
        
    getUrlForWeather() {
        
        fetch(`https://api.openweathermap.org/data/3.0/onecall?${this.lat}&${this.lon}&units=metric&exclude=minutely&appid=${this.#api.key}`)
            .then(response => response.json())
            .then(json => {
                this.willChange.innerHTML = ''
                this.selectDayForHourly(this.time.convertTime(json.daily[0].dt).monthNumberDay)
                this.getUrlForHourly()
                if(this.selectTiming == 'Today') {
                    this.createCurruntWeather(json)
                    this.getWeatherForecast()
                } else {
                    this.createDailyWeather(json)
                }
            })
    }

    getUrlForHourly(){
        fetch(`https://api.openweathermap.org/data/2.5/forecast?${this.lat}&${this.lon}&units=metric&appid=${this.#api.key}`)
            .then(response => response.json())
            .then(json => {
                this.input.value = json.city.name
                return json;
            })
            .then(json => {
                this.hours.innerHTML = ''
                json.list.forEach(e => {
                    const day = this.time.convertTime(e.dt).monthNumberDay;
                    if (day === this.selectDay) {
                        this.createHourly(e);
                    }
                });})
                
            
    }
     
    getWeatherForecast() {
        fetch(`https://api.openweathermap.org/data/2.5/find?${this.lat}&${this.lon}&cnt=5&units=metric&appid=${this.#api.key}`)
          .then(response => response.json())
          .then(json => {
            let arr = json.list.slice(1, 5)
            arr.forEach(e => {
                this.createNearCities(e)
            })
          })
    }

      createCurruntWeather(e){
        let str = `<div class="corruntWeather">
                    <section class="left">
                    <h3>CURRENT WEATHER</h3>
                    <div class="main">
                        <div class="view_weather">
                            <img src="${this.selectImg(e.current.weather[0].main)}" alt="">
                            <p>${e.current.weather[0].main}</p>
                        </div>
                        <div class="temperature">
                            <h2>${Math.round(e.current.temp)}°C</h2>
                            <p>Real feel ${Math.round(e.current.feels_like)}°C</p>
                        </div>
                    </div>
                   </section>
                   <section class="right">
                    <ul>
                        <li>Wind: <span>${e.current.wind_speed}</span></li>
                        <li>Sunrise: <span>${this.time.convertTime(e.current.sunrise + 7200).hoursMinuts}</span></li>
                        <li>Sunset: <span>${this.time.convertTime(e.current.sunset + 7200).hoursMinuts}</span></li>
                        <li>Duration: <span>${this.time.calculateDayDuration(e.current.sunrise + 7200, e.current.sunset + 7200)}</span></li>
                    </ul>
                </section>
                </div>
                <div class="for_screen"></div>

                <div class="nearPlaces">
                    <h3>NEARBY PLACES</h3>
                    <div class="cities"></div>
                </div>`
        this.willChange.insertAdjacentHTML('beforeend', str)
      }

      createHourly(e){
        let str = `<div class="hour">
                        <p>${this.time.convertTime(e.dt + 7200).hoursMinuts}</p>
                        <div>
                         <img src="${this.selectImg(e.weather[0].main)}" alt="">
                         <p>${e.weather[0].main}</p>
                        </div>
                        <p>${Math.round(e.main.temp)}°</p>
                    </div>`
        this.hours.insertAdjacentHTML('beforeend', str);
      }

      createDailyWeather(e) {
        let str = ` <div class="daily_weather">
                        <div class="today"></div>
                        <div class="days"></div>
                    </div>`
        
        this.willChange.insertAdjacentHTML('beforeend', str)
        
        this.createToday(e.daily, 0);
        
        let arr = e.daily.slice(1, 5)
        arr.forEach(e => {
            this.createFewDays(e);
        })
        document.querySelectorAll('.day').forEach((elem, index) => {
            elem.addEventListener('click', () => this.selectWeatherDay(arr, index));
        })
      }

    selectWeatherDay(arr, index){ 
        document.querySelector('.today').innerHTML = '';
        this.createToday(arr, index)
        this.selectDayForHourly(document.querySelector('#day_date').innerText)
    }

    selectDayForHourly(e){
        this.selectDay = e;
        const day = document.querySelector('.date');
        day.innerText = '';
        day.innerText = e;
        this.getUrlForHourly();
      }

    createToday(e, index){
        let str = ` <section id="first">
                        <p id="how_day">${this.time.convertTime(e[index].dt + 7200).dayName}</p>
                        <p id="day_date">${this.time.convertTime(e[index].dt + 7200).monthNumberDay}</p>
                    </section>
                    <section>
                        <h2>${Math.round(e[index].temp.day)}°C</h2>
                        <p>Real feel ${Math.round(e[index].feels_like.day)}°C</p>
                    </section>
                    <section>
                        <h2>${Math.round(e[index].temp.night)}°C</h2>
                        <p>Real feel ${Math.round(e[index].feels_like.night)}°C</p>
                    </section>
                    <section>
                        <img src="${this.selectImg(e[0].weather[0].main)}" alt="">
                        <p>${e[index].weather[0].main}</p>
                    </section>`
        document.querySelector('.today').insertAdjacentHTML('beforeend', str)
    }

    createFewDays(e){
        let str = ` <div class="day">
                        <div class="left">
                            <p id="how_day">${this.time.convertTime(e.dt + 7200).dayName}</p>
                            <p id="day_date">${this.time.convertTime(e.dt + 7200).monthNumberDay}</p>
                        </div>
                        <div class="right">
                            <img src="${this.selectImg(e.weather[0].main)}" alt="">
                            <div class="hight_low_temp">
                                <p>${Math.round(e.temp.day)}°C</p>
                                <p>${Math.round(e.temp.night)}°C</p>
                            </div>
                            </div>
                    </div>`
        document.querySelector('.days').insertAdjacentHTML('beforeend', str)
    }

    createNearCities(e) {
        let str = `<div class="city">
                      <p>${e.name}</p>
                      <div class="temp">
                        <img src="${this.selectImg(e.weather[0].main)}" alt="">
                        <div class="ceilse">${Math.round(e.main.temp)}°C</div>
                      </div>
                    </div>`
        document.querySelector('.cities').insertAdjacentHTML('beforeend', str);
    }

      selectImg(elem){
        let pic;
        switch(elem){
            case'Clear':
            pic = '/bild/img/clear.svg'
            break;
            case'Clouds':
            pic = '/bild/img/clouds.png'
            break;
            case'Rain':
            pic = '/bild/img/rain.svg'
            break;
            case'Thunderstorm':
            pic = '/bild/img/thunder.svg'
            break;
            case'Drizzle':
            pic = '/bild/img/rain.svg'
            break;
            case'Snow':
            pic = '/bild/img/snow.png'
            break;


        }

        return pic;
      }

      error(){
        let main = document.querySelector('main');
        main.remove();
        let str = `<div class="error">
                        <img src="./img/error.svg" alt="">
                        <h1>${this.cityName} could not be found.
                        Please enter a different location.</h1>
                    </div>`
        document.querySelector('.wrapper').insertAdjacentHTML('beforeend', str);
      }

    init(){
        this.selectCityByNav()
        this.buttons.forEach(e => {
            e.addEventListener('click', this.addClassActive.bind(this))
        })
        this.input.value = this.cityName;
        this.search.addEventListener('click', this.setCityName.bind(this))
    }
}

new Weather().init();