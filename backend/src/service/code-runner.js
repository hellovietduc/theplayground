const Docker = require('dockerode');
const { Writable } = require('stream');
const { writeFileSync, unlinkSync } = require('fs');
const { join } = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../util/log')('CodeRunner');

const createContainerDefaults = JSON.stringify({
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    OpenStdin: true,
    StdinOnce: true,
    HostConfig: {
        AutoRemove: true
    }
});

const attachContainerDefaults = JSON.stringify({
    stdin: true,
    stderr: true,
    stdout: true,
    stream: true,
    hijack: true
});

class CodeRunner {
    constructor() {
        this.docker = null;
        this.envConfig = null;
        this.tmpFolder = null;
        this.isReady = false;
    }

    async init(config) {
        this.docker = new Docker(config.docker);
        this.envConfig = config.environments;
        this.hostTmp = config.hostTmp;
        this.containerTmp = config.containerTmp;
        this.timeout = config.timeout * 1000;

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

    async run(code, lang) {
        if (!this.isReady) {
            throw new Error('Code Runner is not ready yet');
        }

        if (typeof code !== 'string') {
            throw new Error('Invalid param types');
        }

        const env = this.envConfig[lang];
        if (!env) {
            throw new Error('Language not supported');
        }

        const createOpts = {
            ...JSON.parse(createContainerDefaults),
            Image: env.Image,
            name: `${lang}_${uuidv4()}`
        };

        let hostPath = null;
        let containerPath = null;
        if (env.Mount) {
            hostPath = join(this.hostTmp, createOpts.name);
            containerPath = join(this.containerTmp, createOpts.name);
            createOpts.HostConfig.Mounts = [{
                ...env.Mount,
                Source: hostPath
            }];
            writeFileSync(containerPath, code);
            logger.info(`Temp File Created on Host: ${hostPath}`);
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
        logger.success(`Container Created: ${createOpts.name}`);

        const containerStream = await container.attach(JSON.parse(attachContainerDefaults));
        containerStream.pipe(outputStream);

        await container.start();
        logger.success(`Container Started: ${createOpts.name}`);
        containerStream.end(Buffer.from(env.Cmd || code));

        setTimeout(async () => {
            await container.stop();
            logger.complete(`Container Stopped: ${createOpts.name}`);
        }, this.timeout);

        await container.wait();
        logger.complete(`Container Removed: ${createOpts.name}`);

        if (env.Mount && hostPath && containerPath) {
            unlinkSync(containerPath);
            logger.complete(`Temp File Removed on Host: ${hostPath}`);
        }

        return output.toString();
    }
}

module.exports = new CodeRunner();
