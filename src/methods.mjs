import api from "./api.mjs";
import {basename} from "path";
import {statSync, readFileSync} from "fs";

const part_size = 1024;

export const getRandomId = () => Math.ceil(Math.random() * 0xffffff) + Math.ceil(Math.random() * 0xffffff)

export const getUser = (username) => api.call('contacts.resolveUsername', {username})

export const sendMessage = ({id: user_id, access_hash} = {}, message) => api.call('messages.sendMessage', {
    peer: (user_id && access_hash) ? {_: 'inputPeerUser', user_id, access_hash} : {_: 'inputPeerSelf'},
    random_id: getRandomId(),
    clear_draft: true,
    message,
})

export const sendMedia = async ({id: user_id, access_hash} = {}, file_path) => {
    const file = await uploadMedia(file_path);
    return api.call('messages.sendMedia', {
        peer: (user_id && access_hash) ? {_: 'inputPeerUser', user_id, access_hash} : {_: 'inputPeerSelf'},
        media: {
            _: 'inputMediaUploadedDocument',
            attributes: [{_: 'documentAttributeFilename', file_name: file.name}],
            file
        },
        random_id: getRandomId(),
        clear_draft: true,
    })
}

export const uploadMedia = async (file_path, file_id = getRandomId()) => {
    let offset = 0;
    const parts = [];
    const name = basename(file_path);
    const {size} = statSync(file_path);
    const file = readFileSync(file_path);
    // console.debug({file_id, size, name, file_path});
    while (offset < size) {
        const file_part = parts.length;
        const targetOffset = offset + part_size;
        const bytes = file.subarray(offset, targetOffset);
        parts.push(api.call('upload.saveFilePart', {file_id, file_part, bytes}));
        offset = targetOffset;
    }
    await Promise.all(parts);
    // console.debug(await Promise.all(parts));
    return {_: 'inputFile', name, id: file_id, parts: parts.length};
}
