import api from './api.mjs';
import {checkPassword, getPassword, getUser, sendCode, signIn, signUp} from './user.mjs';

export default async function auth({phone, password, code, phone_code_hash} = {}) {
    const user = await getUser();
    if (user) return user;
    if (!phone_code_hash) {
        let {phone_code_hash} = await sendCode(phone);
        return console.debug({phone_code_hash});
    }
    try {
        const signInResult = await signIn({code, phone, phone_code_hash});
        if (signInResult._ === 'auth.authorizationSignUpRequired')
            return await signUp({phone, phone_code_hash});
    } catch (error) {
        if (error.error_message !== 'SESSION_PASSWORD_NEEDED') return console.log(`error:`, error);
        const {srp_id, current_algo, srp_B} = await getPassword();
        const {g, p, salt1, salt2} = current_algo;
        const {A, M1} = await api.mtproto.crypto.getSRPParams({g, p, salt1, salt2, gB: srp_B, password});
        return await checkPassword({srp_id, A, M1});
    }
}
