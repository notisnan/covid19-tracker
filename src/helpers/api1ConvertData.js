// Used to normalize the following endpoints: 
// https://coronavirus-monitor.p.rapidapi.com/coronavirus/worldstat.php
// https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php

// ----------------------
// Normalize country data
// ----------------------

function api1ConvertCountryData(data) {
  const newCountryData = {};

  data.forEach(item => {
    newCountryData[item.country_name.toLowerCase()] = {
      cases: Number(item.cases.split(',').join('')),
      deaths: Number(item.deaths.split(',').join('')),
      total_recovered: Number(item.total_recovered.split(',').join('')),
      new_cases: Number(item.new_cases.split(',').join('')),
      new_deaths: Number(item.new_deaths.split(',').join('')),
      title: item.country_name,
      cases_per_million: Number(item.total_cases_per_1m_population.split(',').join('')),
      tests_per_million: Number(item.tests_per_1m_population.split(',').join('')),
      deaths_per_million: Number(item.deaths_per_1m_population.split(',').join('')),
      population: parseInt(item.cases.split(',').join('')/item.total_cases_per_1m_population.split(',').join('')*1000000),
      tested: parseInt(item.tests_per_1m_population.split(',').join('') * (parseInt(item.cases.split(',').join('')/item.total_cases_per_1m_population.split(',').join(''))))
    }

    if (!item.country_name) { delete newCountryData['']; }
  });

  return newCountryData;
}

// --------------------
// Normalize world data
// --------------------

function api1ConvertWorldData(data) {
  const newWorldData = {
    cases: Number(data.total_cases.split(',').join('')),
    deaths: Number(data.total_deaths.split(',').join('')),
    new_cases: Number(data.new_cases.split(',').join('')),
    new_deaths: Number(data.new_deaths.split(',').join('')),
    total_recovered: Number(data.total_recovered.split(',').join('')),
    title: 'Global',
    cases_per_million: Number(data.total_cases_per_1m_population.split(',').join('')),
    deaths_per_million: Number(data.deaths_per_1m_population.split(',').join('')),
    population: parseInt(data.total_cases.split(',').join('')/data.total_cases_per_1m_population.split(',').join('')*1000000),
  };

  return newWorldData;
}

export {api1ConvertCountryData, api1ConvertWorldData};