/* eslint-disable no-underscore-dangle */
const request = require('request-promise');
const orderMutation = require('./graph/mutations/create-order');
const orderQuery = require('./graph/queries/order-by-id');
const { MY_CRYSTALLIZE_SECRET_TOKEN, ORDER_API_URL } = require('../config');

const apiCall = async (query, variables, operationName) => {
  return new Promise(async (resolve, reject) => {
    const options = {
      headers: {
        'content-type': 'application/json',
        'X-Crystallize-Secret-Token': MY_CRYSTALLIZE_SECRET_TOKEN
      },
      uri: ORDER_API_URL,
      json: true,
      method: 'POST',
      body: { operationName, query, variables }
    };
    request(options)
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
};

const createCrystallizeOrder = input =>
  apiCall(orderMutation, input, 'createOrder');

const fetchCrystallizeOrder = orderId =>
  apiCall(orderQuery, { id: orderId }, 'getOrder');
// Reminder that mutationBody must be a string
module.exports = {
  createCrystallizeOrder,
  fetchCrystallizeOrder
};