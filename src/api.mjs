import MTProto from '@mtproto/core';
import {sleep} from '@mtproto/core/src/utils/common/index.js';

const api_hash = process.env.api_hash;
const api_id = parseInt(process.env.api_id);

class API {
    constructor() {
        this.mtproto = new MTProto({
            api_id,
            api_hash,
            storageOptions: {
                path: new URL('../.telegram/auth.json', import.meta.url).pathname,
            },
        });
    }

    async call(method, params, options = {}) {
        try {
            const result = await this.mtproto.call(method, params, options);

            return result;
        } catch (error) {
            console.log(`${method} error:`, error);

            const {error_code, error_message} = error;

            if (error_code === 420) {
                const seconds = Number(error_message.split('FLOOD_WAIT_')[1]);
                const ms = seconds * 1000;

                await sleep(ms);

                return this.call(method, params, options);
            }

            if (error_code === 303) {
                const [type, dcIdAsString] = error_message.split('_MIGRATE_');

                const dcId = Number(dcIdAsString);

                // If auth.sendCode call on incorrect DC need change default DC, because
                // call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
                if (type === 'PHONE') {
                    await this.mtproto.setDefaultDc(dcId);
                } else {
                    Object.assign(options, {dcId});
                }

                return this.call(method, params, options);
            }

            return Promise.reject(error);
        }
    }
}

export default new API();
