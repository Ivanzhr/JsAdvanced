class Time {
    
convertTime(unixTime) {
    const date = new Date(unixTime * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const day = date.getUTCDate();
    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const month = monthNames[date.getUTCMonth()];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[date.getUTCDay()];

    let arr = {
        hoursMinuts: `${hours}:${minutes < 10 ? '0' : ''}${minutes}`,
        monthNumberDay: `${month} ${day}`,
        dayName: dayName,
        day: day
    };
    return arr;
}

  calculateDayDuration(sunriseTimestamp, sunsetTimestamp) {
    const sunriseTime = new Date(sunriseTimestamp * 1000);
    const sunsetTime = new Date(sunsetTimestamp * 1000);
    const dayDurationMillis = sunsetTime - sunriseTime;
    const hours = Math.floor(dayDurationMillis / (1000 * 60 * 60));
    const minutes = Math.floor((dayDurationMillis % (1000 * 60 * 60)) / (1000 * 60));
  
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  }
}

export default Time;
