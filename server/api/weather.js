const WEATHER = require('../models/Weather');
const axios = require('axios');

// configure the path to read the environment variablefile, .env, to get the weather api key
require('dotenv').config({path: "./../../../.env"});

const baseUrl = "https://api.openweathermap.org/data/2.5/weather";

class Weather {
    /**
     * Gets weather data based on the zipcode and which units (Celsius/Fahrenheit) are used to represent the data.
     * 
     * @param {number} zipCode The zipcode used to get the information fromt the api
     * @param {string} tempMetric This is either Celsius or Fahrenheit
     * @return {JSON} The data response from the weather api call
     */
    getWeatherData = async (zipCode, tempMetric) => {
        /**
         * Use get api for "By ZIP code" (https://openweathermap.org/current#zip) 
         * - The "us" query stands for "United States"
         * - "process.env.WEATHER_KEY" is the api key that we get from the .env file
         * - "units" query can be either Celsius or Fahrenheit
         */
        let url = `${baseUrl}?zip=${zipCode},us&appid=${process.env.WEATHER_KEY}&units=${tempMetric}`;

        // awaitable call to get the info from the weather api and then return the data
        // TODO: add error handling for this call
        return (await axios(url)).data;
    }

    /**
     * Saves the weather data using the zipcode as the unique identifier
     * If it already exists, replace, if not, then add
     * 
     * @param {number} zipCode The zipcode used to identify the document to upsert
     * @param {string} data Weather data to save/update
     * @return {JSON} The data response from the weather api data
     */
    saveWeatherDataToMongo = (zipCode, data) => {
        const filter = {
            zip: zipCode
        }

        const replace = {
            ...filter,
            ...data,
            data: Date.now()
        }
        return this.findOneReplace(filter, replace);
    }

    /**
     * Saves Weather data to MongoDB
     * 
     * @param {number} zipCode The zipcode used as unique identifier to find the document from mongo
     * @return {JSON} The data response from the mongodb
     */
    getWeatherDataFromMongo = async (zipCode) => {
        return WEATHER.findOne({zip: zipCode});
    }

    /**
     * If a document already exists with the filter, then replace, if not, add
     * 
     * @param {{zip: number}} filter The filter is the zipcode used as unique identifier to find the document from mongo
     * @return {JSON} The data response from the mongodb
     */
    findOneReplace(filter, replace) {
        return WEATHER.findOneAndReplace(filter, replace, {new: true, upsert: true});
    }
}

module.exports = Weather;