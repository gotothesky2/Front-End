const BASE_URL = 'http://canfly.ap-northeast-2.elasticbeanstalk.com';

const config = {
    API_URL: BASE_URL,

    TOKEN: {
        RETURN: `${BASE_URL}/token/return`, //authCode로 토큰 반환
        GENERATE: `${BASE_URL}/token/generate`, // 토큰 반환
        LOCAL: `${BASE_URL}/token/local`, // 임시 code로 토큰 반환
    },

    USERS: {
        REISSUE_TOKEN: `${BASE_URL}/users/reissue`, // 토큰 재발급
        USE_RECHARGE: `${BASE_URL}/users/token`, // 토큰 사용 및 충전
        DELETE_ME: `${BASE_URL}/users/me`, // 회원탈퇴
        LOGOUT: `${BASE_URL}/users/logout`, // 로그아웃
        User_info: `${BASE_URL}/users/info`, // 유저 전체 정보
    },

    MOCK: {
        ALL_DETAIL: `${BASE_URL}/users/grades/mock`,
        REGISTER: `${BASE_URL}/users/grades/mock/excel`,
        SPECIFIC_DETAIL: (mockId) => `${BASE_URL}/users/grades/mock/${mockId}`,
        SCORE_REGISTER: (mockId) => `${BASE_URL}/users/grades/mock/${mockId}`,
        DELETE_MOCK: (mockId) => `${BASE_URL}/users/grades/mock/${mockId}`,
        SPECIFIC_SCORE_DETAIL: (mockId, mockScoreId) => `${BASE_URL}/users/grades/mock/${mockId}/${mockScoreId}`,
        EDIT_INFORMATION_MOCK: (mockId) => `${BASE_URL}/users/grades/mock/${mockId}`,
        EDIT_SCORE: (mockId, mockScoreId) => `${BASE_URL}/users/grades/mock/${mockId}/${mockScoreId}`,
    },

    REPORT: {
        ALL_DETAIL_REPORT: `${BASE_URL}/users/grades/report`,
        REGISTER_REPORT: `${BASE_URL}/users/grades/report`,
        SPECIFIC_DETAIL_REPORT: (reportId) => `${BASE_URL}/users/grades/report/${reportId}`,
        SCORE_REGISTER_REPORT: (reportId) => `${BASE_URL}/users/grades/report/${reportId}`,
        DELETE_REPORT: (reportId) => `${BASE_URL}/users/grades/report/${reportId}`,
        SPECIFIC_SCORE_DETAIL_REPORT: (reportId, reportScoreId) => `${BASE_URL}/users/grades/mock/${reportId}/${reportScoreId}`,
        EDIT_INFORMATION_REPORT: (reportId) => `${BASE_URL}/users/grades/mock/${reportId}`,
        EDIT_SCORE_REPORT: (reportId, reportScoreId) => `${BASE_URL}/users/grades/mock/${reportId}/${reportScoreId}`,
    },

    UNIVERSITY_MAJOR:{
        SYNCHRONIZE: `${BASE_URL}/major_sync/all`,
    },


};

export default config;