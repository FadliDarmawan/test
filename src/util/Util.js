import fileType from "file-type";
import path from 'path';
import Crypto from 'crypto';
import { tmpdir } from 'os';
import ffmpeg from 'fluent-ffmpeg';
import webp from 'node-webpmux';
import sharp from 'sharp';
import { promises as fs } from 'fs';

const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
/**
 * Utility methods
 */
class Util {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
    }

    static generateHash(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    /**
     * Sets default properties on an object that aren't already specified.
     * @param {Object} def Default properties
     * @param {Object} given Object to assign defaults to
     * @returns {Object}
     * @private
     */
    static mergeDefault(def, given) {
        if (!given) return def;
        for (const key in def) {
            if (!has(given, key) || given[key] === undefined) {
                given[key] = def[key];
            } else if (given[key] === Object(given[key])) {
                given[key] = Util.mergeDefault(def[key], given[key]);
            }
        }

        return given;
    }

    /**
     * Formats a image to webp
     * @param {MessageMedia} media
     * 
     * @returns {Promise<MessageMedia>} media in webp format
     */
    static async formatImageToWebpSticker(media, pupPage) {
        if (!media.mimetype.includes('image'))
            throw new Error('media is not a image');

        if (media.mimetype.includes('webp')) {
            return media;
        }

        return pupPage.evaluate((media) => {
            return window.WWebJS.toStickerData(media);
        }, media);
    }

    /**
     * Formats a video to webp
     * @param {MessageMedia} media
     * 
     * @returns {Promise<MessageMedia>} media in webp format
     */
    static async formatVideoToWebpSticker(media) {
        if (!media.mimetype.includes('video'))
            throw new Error('media is not a video');

        const videoType = media.mimetype.split('/')[1];

        const tempFile = path.join(
            tmpdir(),
            `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
        );

        const stream = new (require('stream').Readable)();
        const buffer = Buffer.from(
            media.data.replace(`data:${media.mimetype};base64,`, ''),
            'base64'
        );
        stream.push(buffer);
        stream.push(null);

        await new Promise((resolve, reject) => {
            ffmpeg(stream)
                .inputFormat(videoType)
                .on('error', reject)
                .on('end', () => resolve(true))
                .addOutputOptions([
                    '-vcodec',
                    'libwebp',
                    '-vf',
                    // eslint-disable-next-line no-useless-escape
                    'scale=\'iw*min(300/iw\,300/ih)\':\'ih*min(300/iw\,300/ih)\',format=rgba,pad=300:300:\'(300-iw)/2\':\'(300-ih)/2\':\'#00000000\',setsar=1,fps=10',
                    '-loop',
                    '0',
                    '-ss',
                    '00:00:00.0',
                    '-t',
                    '00:00:05.0',
                    '-preset',
                    'default',
                    '-an',
                    '-vsync',
                    '0',
                    '-s',
                    '512:512',
                ])
                .toFormat('webp')
                .save(tempFile);
        });

        const data = await fs.readFile(tempFile, 'base64');
        await fs.unlink(tempFile);

        return {
            mimetype: 'image/webp',
            data: data,
            filename: media.filename,
        };
    }

    /**
     * Sticker metadata.
     * @typedef {Object} StickerMetadata
     * @property {string} [name] 
     * @property {string} [author] 
     * @property {string[]} [categories]
     */

    /**
     * Formats a media to webp
     * @param {MessageMedia} media
     * @param {StickerMetadata} metadata
     * 
     * @returns {Promise<MessageMedia>} media in webp format
     */
    static async formatToWebpSticker(media, metadata, pupPage) {
        let webpMedia;

        if (media.mimetype.includes('webp'))
            webpMedia = { mimetype: 'image/webp', data: media.data, filename: undefined }
        else if (media.mimetype.includes('image'))
            webpMedia = await this.formatImageToWebpSticker(media, pupPage);
        else if (media.mimetype.includes('video'))
            webpMedia = await this.formatVideoToWebpSticker(media);
        else
            throw new Error('Invalid media format');

        if ((typeof metadata === 'object' && metadata !== null)) {
            const img = new webp.Image();
            const hash = this.generateHash(32);
            const json = {
                "sticker-pack-id": metadata.packId ? metadata.packId : hash,
                "sticker-pack-name": metadata.packName ? metadata.packName : 'Amirul Dev',
                "sticker-pack-publisher": metadata.packPublish ? metadata.packPublish : 'Amirul Dev',
                "sticker-pack-publisher-email": metadata.packEmail ? metadata.packEmail : '',
                "sticker-pack-publisher-website": metadata.packWebsite ? metadata.packWebsite : 'https://instagram.com/amirul.dev',
                "android-app-store-link": metadata.androidApp ? metadata.androidApp : '',
                "ios-app-store-link": metadata.iOSApp ? metadata.iOSApp : '',
                "emojis": metadata.categories ? metadata.categories : [],
                "is-avatar-sticker": metadata.isAvatar ? metadata.isAvatar : 0
            };
            let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
            let exif = Buffer.concat([exifAttr, jsonBuffer]);
            exif.writeUIntLE(jsonBuffer.length, 14, 4);
            await img.load(Buffer.from(webpMedia.data, 'base64'));
            img.exif = exif;
            webpMedia.data = (await img.save(null)).toString('base64');
        }

        return webpMedia;
    }

    /**
     * Configure ffmpeg path
     * @param {string} path
     */
    static setFfmpegPath(path) {
        ffmpeg.setFfmpegPath(path);
    }

    /**
     * 
     * @param {*} color hex
     * @returns 
     */
    static assertColor(color) {
        let assertedColor;
        if (typeof color === 'number') {
            assertedColor = color > 0 ? color : 0xffffffff + Number(color) + 1;
        } else if (typeof color === 'string') {
            let hex = color.trim().replace('#', '');
            if (hex.length <= 6) {
                hex = 'FF' + hex.padStart(6, '0');
            }
            assertedColor = parseInt(hex, 16);
        } else {
            throw new Error(color);
        }
        return assertedColor;
    }

    /**
     * Cropped image to profile's picture size
     * @param {Buffer} buffer
     * @return {Promise<{preview: Promise<string>, img: Promise<string>}>}
     */
    static async generateProfilePicture(buffer, type = 'normal') {
        /**
         * @param {Sharp} img
         * @param {number} maxSize
         * @return {Promise<Sharp>}
         */
        const resizeByMax = async (img, maxSize) => {
            const metadata = await img.metadata();
            const outputRatio = maxSize / Math.max(metadata.height, metadata.width);
            return img.resize(Math.floor(metadata.width * outputRatio), Math.floor(metadata.height * outputRatio));
        };
        /**
         * @param {Sharp} img
         * @return {Promise<string>}
         */
        const imgToBase64 = async (img) => {
            return Buffer.from(await img.toFormat('jpg').toBuffer()).toString('base64');
        };

        const img = await sharp(buffer);
        return {
            img: (type === 'long') ? await imgToBase64(await resizeByMax(img, 720)) : await imgToBase64(await resizeByMax(img, 640)),
            preview: (type === 'long') ? await imgToBase64(await resizeByMax(img, 120)) : await imgToBase64(await resizeByMax(img, 96))
        };
    }

    static async getFile(PATH, save) {
        let filename
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await this.fetchBuffer(PATH) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        let type = await file.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        filename = path.join(__dirname, "..", "..", 'temp', new Date * 1 + "." + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        let size = Buffer.byteLength(data)
        return {
            filename,
            size,
            sizeH: this.formatSize(size),
            ...type,
            data
        }
    }

    static formatSize(bytes) {
        if (bytes >= 1000000000) { bytes = (bytes / 1000000000).toFixed(2) + " GB"; }
        else if (bytes >= 1000000) { bytes = (bytes / 1000000).toFixed(2) + " MB"; }
        else if (bytes >= 1000) { bytes = (bytes / 1000).toFixed(2) + " KB"; }
        else if (bytes > 1) { bytes = bytes + " bytes"; }
        else if (bytes == 1) { bytes = bytes + " byte"; }
        else { bytes = "0 bytes"; }
        return bytes;
        }


}
export default Util
