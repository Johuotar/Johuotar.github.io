(function() { // (Immediately invoked function execution, IIFE) Being anonymous function, it avoids polluting the global scope.
    //The function can be invoked only once since it has no name, but this function is meant to be executed only once anyway.

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

    // Formatter for Euro values to make reading them easier.
    let formatter = new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR',});
    // Constants
    const elementErrorMessage = document.getElementById("error_ele");
    const elementBearishTrend = document.getElementById("bearish_ele");
    const elementTradingVolume = document.getElementById("volume_value_ele");
    const elementBuySellDays = document.getElementById("best_dates_ele");
    const address = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from="
    // Time selection elements
    let startDateElement = document.getElementById('startdate')
    let endDateElement = document.getElementById('enddate')
    
    // Get the button element reference from html
    // First, add eventlistener for content being loaded, this guarantees that code has access to all DOM elements
    document.addEventListener("DOMContentLoaded", function(event) { 
        let button = document.getElementById("getDataButton");
        // Configure event handler. No () after the function name since it is not being invoked
        button.addEventListener("click", getData);
    });

    let getJSON = function(url, callback) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';

        xhr.onload = function() {
            let status = xhr.status;

            if (status == 200) {
                callback(null, xhr.response);
            } else {
                callback(status);
            }
        };
        xhr.send();
    };

    // get diff of two values to find closest time point to midnights
    let difference = function (a, b) { return Math.abs(a - b); }

    function getData() { //The actual function for getting data and presenting it, called when button is pressed
        let startDate = startDateElement.value
        let endDate = endDateElement.value
        if (startDate > endDate) {
            elementErrorMessage.innerHTML = "WARNING: Set the start date to be before the end date."
            console.log("WARNING: Set the start date to be before the end date.")
            return
        }
        else {
            elementErrorMessage.innerHTML = ""
        }
        // Reset price and volume data so we don't use the old data to fill the charts and get the information
        data.datasets[0]["data"] = []
        volumeData.datasets[0]["data"] = []
        // empty the labels array so we don't use the old data
        labels.length = 0
        startDate = new Date(startDate).getTime() / 1000 - 86400
        // get the last days data as well, which may go over to the next day by few minutes
        // 90000 (25 hours), 3600 (one hour), 86400 (24 hours)
        endDate = new Date(endDate).getTime() / 1000 + 3600
        let currentAddress = address.concat(startDate, "&to=", endDate)
        // Add time to the ranges end parameter to get the values at end point.

        getJSON(currentAddress,  function(err, receivedData) {
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
            let newDate = new Date(closestTimePoints[startEndDate[0]]);
            buyDay = newDate.toUTCString()
            newDate = new Date(closestTimePoints[startEndDate[1]]);
            SellDay = newDate.toUTCString()
            
            // Set longest bearish trend to the element 1
            elementBearishTrend.innerHTML = "Longest bearish, AKA downwards trend in days during the selected time period is " + trendLengthMax + " days, starting from " + labels[trendIndex - trendLengthMax] + " and ending on " + labels[trendIndex];
            
            // Set day with highest trading volume to element 2
            elementTradingVolume.innerHTML = "Highest trading volume in Euros during the selected time period was on " + highestTradingDay + " with value of " + formatter.format(highestTradingVolume);

            // Set best days to buy and sell Bitcoin to element 3
            if (highestMultiplier <= 1.0) {
                elementBuySellDays.innerHTML = "Bitcoin's price did not increase during selected time period.";
            }
            else {
                elementBuySellDays.innerHTML = "Best days to buy and sell during the selected time period was to buy on " + buyDay + " and sell on " + SellDay + " with price being multiplied by " + highestMultiplier;
            }
        }
    });

    }
}) ();