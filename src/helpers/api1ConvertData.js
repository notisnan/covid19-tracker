// Used to normalize the following endpoints: 
// https://coronavirus-monitor.p.rapidapi.com/coronavirus/worldstat.php
// https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php

// ----------------------
// Normalize country data
// ----------------------

function api1ConvertCountryData(data) {
  const newCountryData = {};

  // Calculate the recovered per milllion
  // API does not have this stat, needs to be manually calculated
  function getRecoveredPerMillion(population, totalRecovered) {
    let recoveredPerMillion = 0;

    if (population < 1000000) {
      recoveredPerMillion = totalRecovered / (population/1000000);
    } else {
      // If the country population is less than a million we need a different formula
      const multiple = 1000000/population;
      recoveredPerMillion = totalRecovered * multiple;
    }

    return parseInt(recoveredPerMillion);
  }

  // Calculate the tested numbers
  // API has tested per million but not total tested
  // We calculate this based on the numbers we have
  function getTestedCount(population, testedPerMillion) {
    let tested = 0;

    if (population > 1000000) {
      const multiple = population/1000000;
      tested = testedPerMillion * multiple;
    } else {
      // If the country population is less than a million we need a different formula
      const multiple = 1000000/population;
      tested = testedPerMillion / multiple;
    }

    return parseInt(tested);
  }

  data.forEach(item => {
    const population = parseInt(item.cases.split(',').join('')/item.total_cases_per_1m_population.split(',').join('')*1000000);

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
      recovered_per_million: getRecoveredPerMillion(
        population,
        Number(item.total_recovered.split(',').join(''))
      ),
      population: population,
      tested: getTestedCount(
        population,
        Number(item.tests_per_1m_population.split(',').join(''))
      )
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
    tests_per_million: 0,
    cases_per_million: Number(data.total_cases_per_1m_population.split(',').join('')),
    deaths_per_million: Number(data.deaths_per_1m_population.split(',').join('')),
    recovered_per_million: parseInt(Number(data.total_recovered.split(',').join('')) / parseInt(data.total_cases.split(',').join('')/data.total_cases_per_1m_population.split(',').join(''))),
    population: parseInt(data.total_cases.split(',').join('')/data.total_cases_per_1m_population.split(',').join('')*1000000),
    tested: 0
  };

  return newWorldData;
}

export {api1ConvertCountryData, api1ConvertWorldData};