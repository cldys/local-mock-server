module.exports = {
  code: 0,
  message: 'success',
  data: {
    id: 'ORDER-1001',
    title: 'Demo Order A',
    amount: 199.99,
    status: 'paid',
    receiver: {
      name: 'Mock Receiver',
      phone: '13800000001',
      address: 'No. 1 Mock Road'
    },
    items: [
      {
        skuId: 'SKU-001',
        name: 'Demo Product',
        quantity: 1,
        price: 199.99
      }
    ]
  }
};
