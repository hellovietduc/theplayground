const Docker = require('dockerode');
const { Writable } = require('stream');
const { writeFileSync } = require('fs');
const logger = require('../util/log')('CodeRunner');

const createContainerDefaults = {
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    OpenStdin: true,
    StdinOnce: true,
    HostConfig: {
        AutoRemove: true
    }
};

const attachContainerDefaults = {
    stdin: true,
    stderr: true,
    stdout: true,
    stream: true,
    hijack: true
};

class CodeRunner {
    constructor() {
        this.docker = null;
        this.envConfig = null;
        this.isReady = false;
    }

    async init(config) {
        this.docker = new Docker(config.docker);
        this.envConfig = config.environments;

        const pullImages = Object.values(this.envConfig)
            .map(env => new Promise((resolve, reject) => {
                this.docker.pull(env.Image, (err, stream) => {
                    if (err) return reject(err);
                    this.docker.modem.followProgress(stream, resolve);
                });
            }));
        await Promise.all(pullImages);

        this.isReady = true;
        logger.success(`Loaded ${pullImages.length} environments`);
    }

    async run(code, lang, id) {
        if (!this.isReady) {
            throw new Error('Code Runner is not ready yet');
        }

        if (typeof code !== 'string' || typeof id !== 'string') {
            throw new Error('Invalid param types');
        }

        const env = this.envConfig[lang];
        if (!env) {
            throw new Error('Language not supported');
        }

        const createOpts = {
            ...createContainerDefaults,
            Image: env.Image,
            name: `${lang}_${id}`
        };

        if (env.Mount) {
            const path = `/tmp/${createOpts.name}`;
            writeFileSync(path, code);
            createOpts.HostConfig.Mounts = [{
                ...env.Mount,
                Source: path
            }];
        }

        let output = Buffer.from('');
        let curChunk = Buffer.from('');

        const outputStream = new Writable({
            // Reference: https://docs.docker.com/engine/api/v1.37/#operation/ContainerAttach
            write: (chunk, encoding, next) => {
                // keep appending buffer to curChunk
                curChunk = Buffer.concat([curChunk, chunk]);

                // the header size is 8 bytes
                // the payload size is stored on the last 4 bytes of header encoded as big endian
                const frameSize = 8 + curChunk.readUInt32BE(4);

                // once it's enough data
                while (curChunk.byteLength >= frameSize) {
                    // read one payload
                    const payload = curChunk.slice(8, frameSize);

                    // append it to the output
                    output = Buffer.concat([output, payload]);

                    // set curChunk to the start of next frame
                    curChunk = curChunk.slice(frameSize);
                }
                next();
            }
        });

        const container = await this.docker.createContainer(createOpts);
        logger.info(`Created: ${createOpts.name}`);

        const containerStream = await container.attach(attachContainerDefaults);
        containerStream.pipe(outputStream);

        await container.start();
        logger.success(`Started: ${createOpts.name}`);
        containerStream.end(Buffer.from(env.Cmd || code));

        await container.wait();
        logger.complete(`Cemoved: ${createOpts.name}`);
        return output.toString();
    }
}

module.exports = new CodeRunner();
