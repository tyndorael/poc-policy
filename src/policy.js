'use strict';
const axios = require('axios');
const UF = 28888;
const healthCareValues = {
  "0": 0.279,
  "1": 0.4396,
  "2+": 0.5599
};
const dentalCareValues = {
  "0": 0.12,
  "1": 0.1950,
  "2+": 0.2480
};

module.exports.calculateCost = ({ age, childs }, hasDentalCare, companyPercentage) => {
  let cost = 0;

  switch (childs) {
    case 0:
      cost = hasDentalCare ? UF * dentalCareValues[0] : 0;
      cost = cost + (UF * healthCareValues[0]);
      break;
    case 1:
      cost = hasDentalCare ? UF * dentalCareValues[1] : 0;
      cost = cost + (UF * healthCareValues[1]);
      break;
    default:
      cost = hasDentalCare ? UF * dentalCareValues["2+"] : 0;
      cost = cost + (UF * healthCareValues["2+"]);
      break;
  }

  if (age > 65) {
    return {
      company: 0,
      copay: cost,
    }
  }

  return {
    company: cost * (companyPercentage / 100),
    copay: cost * ((100 - companyPercentage) / 100)
  };
}

module.exports.getPolicy = async event => {
  try {
    const { data } = await axios.get('https://dn8mlk7hdujby.cloudfront.net/interview/insurance/policy');
    const { success, policy: { workers, has_dental_care: hasDentalCare, company_percentage: companyPercentage } } = data;

    if (!success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Something went wrong.',
        })
      };
    }

    const results = workers.map(worker => this.calculateCost(worker, hasDentalCare, companyPercentage));

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Something went wrong.',
      }),
    };
  }
};

