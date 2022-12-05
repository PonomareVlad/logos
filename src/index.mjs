import {readdirSync, writeFileSync, mkdirSync} from "fs";

if (process.env.auth) {
    mkdirSync(new URL('../.telegram/', import.meta.url).pathname, {recursive: true});
    writeFileSync(new URL('../.telegram/auth.json', import.meta.url).pathname, process.env.auth);
}

import api from "./api.mjs";
import auth from "./auth.mjs";
import {getUser, sendMedia, sendMessage} from "./methods.mjs";

if (!await auth(process.env)) process.exit();

let lastFile,
    packs = 0,
    counter = 0;

const triggers = {
    emoji: [
        `Thanks!
Send me a replacement emoji`,
        `Спасибо!
Пожалуйста, отправьте мне стандартный эмодзи`,
    ],
    sticker: [
        `File type is invalid`,
        `Пожалуйста, отправьте мне файл`,
        `Congratulations. Emoji in the set`,
        `Эмодзи добавлен. Количество эмодзи в наборе`,
        `Alright! Now send me the first animated emoji`,
        `Спасибо! Теперь отправьте мне, пожалуйста, первый`,
        `Please send me your custom emoji animation as a file`,
    ],
    icon: [
        `You can send me a custom emoji from your emoji set to use it as an icon`,
        `Вы можете задать для своего набора эмодзи обложку`
    ],
    type: [
        `Please use buttons to choose the type of custom emoji set`,
        `Создаётся новый набор пользовательских эмодзи`,
        `Yay! A new set of custom emoji`
    ],
    create: [
        `Набор эмодзи успешно опубликован и доступен по ссылке`,
        `Kaboom! I've just published your emoji set`
    ],
    split: [
        `Sorry, that's too many custom emoji for one set`
    ],
    name: [
        `Please provide a short name for your emoji set`,
        `Пожалуйста, выберите короткое название`
    ],
    title: [
        `Создаётся новый набор анимированных эмодзи`,
        `A new set of custom animated emoji`
    ],
    increment: [
        `Увы, такой адрес уже занят`,
        `Sorry, this short name is already taken`,
        `К сожалению, это некорректное название`
    ]
};

const defaultEmoji = process.env.emoji || '🖼';
const username = process.env.username || 'Stickers';
const dir = new URL('../stickers/', import.meta.url);
const maxCount = parseInt(process.env.max || 200);
const {users: [peer]} = await getUser(username);
const files = readdirSync(dir);
const from = process.env.from;

export const getPackTitle = (id = packs) => `SVGPORN Test ${id}`;

export const getPackName = (id = packs) => `SVGPORN_TEST_${id}`;

export function handleStickerUpdates({_, updates = []} = {}) {
    if (_ !== 'updates' || !Array.isArray(updates)) return;
    updates.forEach((update = {}) => update?.message?.peer_id?.user_id === peer.id ? handleStickerMessage(update) : undefined);
}

export function handleStickerMessage(update = {}) {
    const {message: {message}} = update;
    const [action] = Object.entries(triggers).find(([, variants]) => variants.some(trigger => message.startsWith(trigger))) || [];
    if (!action) return;
    console.log(action, files.length, packs, counter);
    switch (action) {
        case 'sticker':
            if (!files.length || ++counter > maxCount) return publish();
            lastFile = files.shift();
            return sendMedia(peer, new URL(lastFile, dir).pathname);
        case 'emoji':
            return sendMessage(peer, defaultEmoji);
        case 'increment':
            packs++;
            return sendMessage(peer, getPackName());
        /*case 'icon':
            console.debug(update);
            return sendMessage(peer, '/skip');*/
        case 'create':
            packs++;
            counter = 0;
            if (!files.length) return;
            return sendMessage(peer, '/newemojipack');
        case 'type':
            const type = message.startsWith('Yay') || message.startsWith('Please') ?
                'Animated emoji' :
                'Анимированные эмодзи';
            return sendMessage(peer, type);
        case 'title':
            return sendMessage(peer, getPackTitle());
        case 'name':
            return sendMessage(peer, getPackName());
        case 'split':
            files.unshift(lastFile);
            lastFile = undefined;
            return publish();
        default:
            console.debug(update);
    }
}

async function publish() {
    await sendMessage(peer, '/publish')
    setTimeout(() => sendMessage(peer, '/skip'), 1000)
}

api.mtproto.updates.on('updateShortSentMessage', handleStickerUpdates);
api.mtproto.updates.on('updateShortChatMessage', handleStickerUpdates);
api.mtproto.updates.on('updateShortMessage', handleStickerUpdates);
api.mtproto.updates.on('updatesCombined', handleStickerUpdates);
api.mtproto.updates.on('updatesTooLong', handleStickerUpdates);
api.mtproto.updates.on('updateShort', handleStickerUpdates);
api.mtproto.updates.on('updates', handleStickerUpdates);

if (from) {
    let offset = files.length - parseInt(from);
    while (offset--) {
        files.shift();
    }
    await sendMessage(peer, defaultEmoji);
} else await sendMessage(peer, '/newemojipack');
