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
        DELETE_ME: `${BASE_URL}/users/me`, // 회원탈퇴
        LOGOUT: `${BASE_URL}/users/logout`, // 로그아웃
    },

    MOCK: {
        ALL_DETAIL: `${BASE_URL}/users/grades/mock`,
        REGISTER: `${BASE_URL}/users/grades/mock`,
        SPECIFIC_DETAIL: mockId => `${BASE_URL}/users/grades/mock/${mockId}`,
        SCORE_REGISTER: mockId => `${BASE_URL}/users/grades/mock/${mockId}`,
        DELETE_MOCK: mockId => `${BASE_URL}/users/grades/mock/${mockId}`,
        SPECIFIC_SCORE_DETAIL: (mockId, mockScoreId) => `${BASE_URL}/users/grades/mock/${mockId}/${mockScoreId}`,
    },
    
};