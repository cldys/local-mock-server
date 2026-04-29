module.exports = {
  default: {
    code: 0,
    message: 'success',
    data: {
      pageNum: 1,
      pageSize: 10,
      total: 2,
      list: [
        {
          id: 'ORDER-1001',
          title: 'Demo Order A',
          amount: 199.99,
          status: 'paid',
          createdAt: '2026-04-16 09:30:00'
        },
        {
          id: 'ORDER-1002',
          title: 'Demo Order B',
          amount: 88.5,
          status: 'pending',
          createdAt: '2026-04-16 10:15:00'
        }
      ]
    }
  },

  scenarios: {
    empty: {
      code: 0,
      message: 'success',
      data: {
        pageNum: 1,
        pageSize: 10,
        total: 0,
        list: []
      }
    }
  }
};
