import api from './api.mjs'

export async function getUser() {
    try {
        const user = await api.call('users.getFullUser', {
            id: {
                _: 'inputUserSelf',
            },
        });

        return user;
    } catch (error) {
        return null;
    }
}

export function sendCode(phone) {
    return api.call('auth.sendCode', {
        phone_number: phone,
        settings: {
            _: 'codeSettings',
        },
    });
}

export function signIn({code, phone, phone_code_hash}) {
    return api.call('auth.signIn', {
        phone_code: code,
        phone_number: phone,
        phone_code_hash: phone_code_hash,
    });
}

export function signUp({phone, phone_code_hash}) {
    return api.call('auth.signUp', {
        phone_number: phone,
        phone_code_hash: phone_code_hash,
        first_name: 'MTProto',
        last_name: 'Core',
    });
}

export function getPassword() {
    return api.call('account.getPassword');
}

export function checkPassword({srp_id, A, M1}) {
    return api.call('auth.checkPassword', {
        password: {
            _: 'inputCheckPasswordSRP',
            srp_id,
            A,
            M1,
        },
    });
}
