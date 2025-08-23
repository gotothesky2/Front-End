// src/api/AIconfig.js
const BASE_URL = 'http://43.200.79.118';

const AIconfig = {
  API_URL: BASE_URL,

  AIREPORT: {
    ME: `${BASE_URL}/aireport/me`,
    CREATE: `${BASE_URL}/aireport`,
    BY_ID: (id) => `${BASE_URL}/aireport/${id}`,
    DELETE: (id) => `${BASE_URL}/aireport/${id}`,
  },

  CERTIFY: {
    TEST_TOKEN: `${BASE_URL}/auth/test-token`,
    ME: `${BASE_URL}/auth/me`,
    VERIFY: `${BASE_URL}/auth/verify`,
    VERIFY_TOKEN: `${BASE_URL}/auth/verify-token`,
  },

  INTEREST: {
    MAKE_HMT: `${BASE_URL}/hmt`,
    MY_HMT: `${BASE_URL}/hmt/my`,
    CHECK_HMT: (hmt_id) => `${BASE_URL}/hmt/${hmt_id}`,
    DELETE_HMT: (hmt_id) => `${BASE_URL}/hmt/${hmt_id}`,
  },

    APTITUDE: {
        MAKE_CST: `${BASE_URL}/cst`,
        MY_CST: `${BASE_URL}/cst/my`,
        CHECK_CST: (cst_id) => `${BASE_URL}/cst/${cst_id}`,
        DELETE_CST: (cst_id) => `${BASE_URL}/cst/${cst_id}`,
    },

    AIREPORTYM:{
        ALL_REPORT: `${BASE_URL}/aireport/me`,
        CONTENT_GET: (report_id) => `${BASE_URL}/aireport/${report_id}`,
        DELETE_REPORT: (report_id) => `${BASE_URL}/aireport/${report_id}`,
        MAKE_REPORT: `${BASE_URL}/aireport`,
    }

};

export default AIconfig;
