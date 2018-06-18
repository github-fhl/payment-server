const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const Imap = require('imap-simple');
const mainPath = path.join(require.main.filename, '..');
const _ = require('lodash');
const moment = require('moment');
const {modelPath} = require('config');
const {sequelize} = require(modelPath);
const nodemailer = require('nodemailer');
const {parseOrderExcel, formatParsedOrderExcel, create} = require('../src/service/order');
let smtpTransport = require('nodemailer-smtp-transport');

//收取邮件的邮箱配置
const config = {
    imap: {
        user: 'yuan.peng@loncus.com.cn',
        password: '1234567Aa',
        host: 'imap.mxhichina.com',
        port: 993,
        tls: true,
        authTimeout: 3000,
    }
}

const mkdirRecursion = destination => {
    if (!fs.existsSync(destination)) {
        let upperDestination = path.parse(destination).dir

        if (!fs.existsSync(upperDestination)) {
            exports.mkdirRecursion(upperDestination)
        }

        fs.mkdirSync(destination)
    }
}

//发送邮件的邮箱配置
smtpTransport = nodemailer.createTransport(smtpTransport({
    host: 'smtp.mxhichina.com',
    auth: {
        user: 'yuan.peng@loncus.com.cn',
        pass: '1234567Aa'
    },
    tls: {
        rejectUnauthorized: false
    }
}));

let sendMail = async function (accepter, message) {
    return new Promise((resolve, reject) =>
        smtpTransport.sendMail({
            from: 'yuan.peng@loncus.com.cn',
            to: accepter,
            subject: '申请单提交结果',
            html: message
        }, (err) => {
            if (err) {
                return reject(err)
            }
            return resolve('邮件发送成功');
        })
    )
}

const run = async () => {
    const connection = await Imap.connect(config);
    await connection.openBox('INBOX');
    const now = new Date().getTime();
    const delay = 24 * 3600 * 1000;
    let yesterday = new Date();
    yesterday.setTime(Date.now() - delay);
    yesterday = yesterday.toISOString();
    const searchCriteria = ['UNSEEN', ['SINCE', yesterday]];
    const fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        struct: true,
        markSeen: true
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    let attachments = [];

    messages.forEach(msg => {
        const parts = Imap.getParts(msg.attributes.struct);
        const sender = msg.parts[0].body.from[0];
        const senderMail = sender.substring(sender.indexOf('" <') + 3, sender.length - 1);
        const sendDate = new Date(msg.parts[0].body.date[0]).getTime() + 1800 * 1000;
        attachments = attachments.concat(
            parts
                .filter(part => part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT')
                .map(async part => {
                    // retrieve the attachments only of the messages with attachments
                    const partData = await connection.getPartData(msg, part);
                    return {
                        sendDate: sendDate,
                        senderMail: senderMail,
                        filename: part.disposition.params.filename,
                        data: partData
                    }
                })
        );
    });

    attachments = await Promise.all(attachments);

    for (let file of attachments) {
        if (now < file.sendDate) {
            const outerPath = path.join(mainPath, 'public/fromMail', moment().format('YYYYMMDD'));
            mkdirRecursion(outerPath);
            const filePath = path.join(outerPath, `${file.senderMail}+${file.filename}`);
            fs.writeFileSync(filePath, file.data);
            try {
                let parsedResult = await parseOrderExcel(`${file.senderMail}+${file.filename}`, '邮件');
                let formatResult = await formatParsedOrderExcel(parsedResult);
                await sequelize.transaction(async (t) => await create(formatResult.order, formatResult.details, {id: 'superMan'}, t));
                await sendMail(file.senderMail, `申请单${file.filename}提交成功`);
            } catch (err) {
                await sendMail(file.senderMail, `申请单${file.filename}提交失败，${err}`);
            }
        }
    }
    await connection.end();
}

// let rule = new schedule.RecurrenceRule();
//
// rule.second = [0, 30];

schedule.scheduleJob('0 */30 * * * *', () => {
    run().catch(err => console.log(err));
})

// https://www.npmjs.com/package/imap-simple