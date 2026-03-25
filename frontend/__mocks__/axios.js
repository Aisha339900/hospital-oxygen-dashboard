/**
 * Jest manual mock for the axios API client.
 *
 * Returning never-resolving Promises for all HTTP methods keeps any component
 * that awaits an API response in its loading state, which is what the
 * "renders loading state initially" test relies on.
 */
const neverResolve = () => new Promise(() => {});

const mockInstance = {
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  get: jest.fn(neverResolve),
  post: jest.fn(neverResolve),
  put: jest.fn(neverResolve),
  patch: jest.fn(neverResolve),
  delete: jest.fn(neverResolve),
};

const axios = {
  create: jest.fn(() => mockInstance),
  ...mockInstance,
};

module.exports = axios;
module.exports.default = axios;
