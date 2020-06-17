/* eslint-disable no-underscore-dangle */
import { orderNormalizer } from 'lib-api/payment-providers/vipps';
import { createCrystallizeOrder } from 'lib-api/crystallize/order';
import getHost from 'lib-api/util/get-host';
import { getClient } from 'lib-api/payment-providers/vipps';

function getTotalAmount(acc, lineItem) {
  return acc + lineItem.net * lineItem.quantity * 100;
}

function orderToVippsBody({ basket, orderId, host }) {
  const totalCartAmount = basket.lineItems.reduce(getTotalAmount, 0);
  const shippingCost = 0;

  // A unique reference to the user
  const userId = 'user@somedomain.com';

  return {
    merchantInfo: {
      merchantSerialNumber: process.env.VIPPS_MERCHANT_SERIAL,
      callbackPrefix: `${host}/api/vipps/order-update`,
      shippingDetailsPrefix: host,
      fallBack: `${host}/api/vipps/fallback/${orderId}`,
      consentRemovalPrefix: `${host}/api/vipps/constent-removal/${userId}`,
      paymentType: 'eComm Express Payment',
      isApp: false,
      staticShippingDetails: [
        // Provide a default shipping method
        {
          isDefault: 'Y',
          priority: 0,
          shippingCost,
          shippingMethod: 'Posten Servicepakke',
          shippingMethodId: 'posten-servicepakke'
        }
      ]
    },
    customerInfo: {},
    transaction: {
      orderId,
      amount: totalCartAmount,
      transactionText: 'Crystallize Boilerplate Test Transaction'
    }
  };
}

export default async (req, res) => {
  try {
    const { personalDetails, lineItems, currency } = req.body;
    const host = getHost(req);

    const validCrystallizeOrder = orderNormalizer({
      vippsData: { lineItems, currency, personalDetails }
    });

    const createCrystallizeOrderResponse = await createCrystallizeOrder(
      validCrystallizeOrder
    );

    const vippsResponse = await getClient().initiatePayment({
      order: orderToVippsBody({
        basket: req.body,
        personalDetails,
        orderId: createCrystallizeOrderResponse.data.orders.create.id,
        host
      })
    });

    return res.send(vippsResponse);
  } catch (error) {
    console.log(error);
    return res.status(503).send({
      success: false,
      error: error.stack
    });
  }
};
