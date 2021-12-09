// Formatter for Euro values to make reading them easier.
var formatter = new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR',});

//Price chart setup
const labels = [];
const data = {
    labels: labels,
    datasets: [{
        label: 'Bitcoin value in €',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [],
    }]
};
//Price chart config
const config = {
    type: 'line',
    data: data,
    options: {}
};
//Price chart rendering
const PriceChart = new Chart(
    document.getElementById('ChartCanvas'),
    config
);

//Volume chart setup
const volumeData = {
    labels: labels,
    datasets: [{
        label: 'Bitcoin trade volume in €',
        backgroundColor: 'rgb(0, 0, 255)',
        borderColor: 'rgb(0, 0, 255)',
        data: [],
    }]
};
//Volume chart config
const configVolume = {
    type: 'line',
    data: volumeData,
    options: {}
};
//Volume Chart rendering
const VolumeChart = new Chart(
    document.getElementById('VolumeChartCanvas'),
    configVolume
);

var errorEle = document.getElementById("error_ele");
var Ele1 = document.getElementById("bearish_ele");
var Ele2 = document.getElementById("volume_value_ele");
var Ele3 = document.getElementById("best_dates_ele");

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    xhr.onload = function() {
        var status = xhr.status;

        if (status == 200) {
            callback(null, xhr.response);
        } else {
            callback(status);
        }
    };
    xhr.send();
};

// get diff of two values to find closest time point to midnights
var difference = function (a, b) { return Math.abs(a - b); }

function getData() {
    let startDate = document.getElementById('startdate').value
    let endDate = document.getElementById('enddate').value
    if (startDate > endDate) {
        errorEle.innerHTML = "WARNING: Set the start date to be before the end date."
        console.log("WARNING: Set the start date to be before the end date.")
        return
    }
    else {
        errorEle.innerHTML = ""
    }
    // Reset price and volume data so we don't use the old data to fill the charts and get the information
    data.datasets[0]["data"] = []
    volumeData.datasets[0]["data"] = []
    // empty the labels array so we don't use the old data
    labels.length = 0
    let address = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from="
    startDate = new Date(startDate).getTime() / 1000
    // get the last days data as well, which may go over to the next day by few minutes
    // 90000 (25 hours), 3600 (one hour)
    endDate = new Date(endDate).getTime() / 1000 + 90000
    address = address.concat(startDate, "&to=", endDate)
    // Add time to the ranges end parameter to get the values at end point.

    getJSON(address,  function(err, receivedData) {
    if (err != null) {
        console.error(err);
    } else {
        // prices is array of arrays which has first the time in unix time and then the actual value. Ex. [ 1637175613629, 53723.26420170224 ]
        let prices = receivedData["prices"];
        let volumes = receivedData["total_volumes"]
        let s_per_day = 24*3600;
        let ms_until_midnight = s_per_day - startDate % s_per_day;
        // all midnights between start and end time. Not the actual available data points but the targets we want to get close to
        let midnights = []
        let keepGoing = true
        let currentNight = startDate + ms_until_midnight

        while (keepGoing == true) {
            if (currentNight < endDate) {
                midnights.push(currentNight * 1000) //multiply by 1000 due to ms being 1/1000 of second
                currentNight = currentNight + s_per_day
            }
            else {
                keepGoing = false
            }
        }

        //Gather time points and prices closest to every midnight during time selection
        let closestTimePoints = [] //timepoints closest to the midnigths that we want data from
        let dailyPrices = []
        let dailyVolumes = []
        for (let i = 0; i < midnights.length; i++) {
            let previousDiff = null
            let currentDiff = null
            let nextDiff = null
            for (let u = 0; u < prices.length; u++) {
                // Use difference to find closest value to midnights
                if (u != 0 && closestTimePoints.length <= i) {
                    if(u + 1 >= prices.length) {
                        previousDiff = difference(midnights[i], prices[u-1][0])
                        currentDiff = difference(midnights[i], prices[u][0])
                        if (previousDiff < currentDiff){
                            closestTimePoints.push(prices[u-1][0])
                            dailyPrices.push(prices[u-1][1])
                            dailyVolumes.push(volumes[u-1][1])
                        }
                        else {
                            closestTimePoints.push(prices[u][0])
                            dailyPrices.push(prices[u][1])
                            dailyVolumes.push(volumes[u][1])
                        }
                    }
                    else {
                        previousDiff = difference(midnights[i], prices[u-1][0])
                        currentDiff = difference(midnights[i], prices[u][0])
                        nextDiff = difference(midnights[i], prices[u+1][0])
                        if (previousDiff > currentDiff && currentDiff < nextDiff){
                            closestTimePoints.push(prices[u][0])
                            dailyPrices.push(prices[u][1])
                            dailyVolumes.push(volumes[u][1])
                        }
                    }
                }
            }
        }

        for (let i = 0; i < closestTimePoints.length; i++) {
            // Add the date as UTC format string to the charts label array
            let newDate = new Date(closestTimePoints[i]);
            labels.push(newDate.toUTCString())
            // Add prices and trading volumes to charts datasets
            data.datasets[0]["data"].push(dailyPrices[i])
            volumeData.datasets[0]["data"].push(dailyVolumes[i])
        }
        // update charts
        PriceChart.update();
        VolumeChart.update();

        // Get longest bearish trend in days and the start and end date of the trend
        let previousPrice = 0;
        let trendLength = 0;
        let trendLengthMax = 0;
        let trendIndex = 0;
        for (let i = 0; i < dailyPrices.length; i++) {
            if (previousPrice != 0) {
                if (previousPrice > dailyPrices[i]) {
                    trendLength++;
                    if (trendLength > trendLengthMax) {
                        trendLengthMax = trendLength
                        trendIndex = i
                    }
                }
                else {
                    trendLength = 0
                }
            }
            previousPrice = dailyPrices[i]
        }

        // Get day with highest trading volume in euros
        let highestTradingDay = null
        let highestTradingVolume = 0
        for (let i = 0; i < dailyVolumes.length; i++) {
            if (dailyVolumes[i] > highestTradingVolume) {
                highestTradingVolume = dailyVolumes[i]
                highestTradingDay = labels[i]
            }
        }
        
        // Get theoretical best days to buy and sell Bitcoin during selected time period by getting and comparing value increase multipliers
        let highestMultiplier = 0.0
        let startEndDate = []
        for (let i = 0; i < dailyPrices.length; i++) {
            for (let x = i+1; x < dailyPrices.length; x++) {
                if (dailyPrices[x] / dailyPrices[i] > highestMultiplier) {
                    highestMultiplier = dailyPrices[x] / dailyPrices[i]
                    startEndDate = [i, x]
                }
            }
        }
        let buyDay, SellDay
        var newDate = new Date(closestTimePoints[startEndDate[0]]);
        buyDay = newDate.toUTCString()
        newDate = new Date(closestTimePoints[startEndDate[1]]);
        SellDay = newDate.toUTCString()
        
        // Set longest bearish trend to the element 1
        Ele1.innerHTML = "Longest bearish, AKA downwards trend in days during the selected time period is " + trendLengthMax + " days, starting from " + labels[trendIndex - trendLengthMax] + " and ending on " + labels[trendIndex];
        
        // Set day with highest trading volume to element 2
        Ele2.innerHTML = "Highest trading volume in Euros during the selected time period was on " + highestTradingDay + " with value of " + formatter.format(highestTradingVolume);

        // Set best days to buy and sell Bitcoin to element 3
        if (highestMultiplier <= 1.0) {
            Ele3.innerHTML = "Bitcoin's price did not increase during selected time period.";
        }
        else {
            Ele3.innerHTML = "Best days to buy and sell during the selected time period was to buy on " + buyDay + " and sell on " + SellDay + " with price being multiplied by " + highestMultiplier;
        }
    }
});

}