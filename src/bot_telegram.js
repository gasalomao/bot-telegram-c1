const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

let awaitingEmail = new Set();

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const message = msg.text;
  const date = new Date();

  if (date.getHours() >= 9 && date.getHours() <= 18) {
    bot.sendMessage(chatId, 'Olá! Bem-vindo à nossa loja virtual. Estamos aqui para ajudá-lo. Visite nosso site para obter mais informações: https://faesa.br');
  } else {
    if (awaitingEmail.has(chatId) && message.includes('@')) {
      await saveEmail(message);
      bot.sendMessage(chatId, 'Obrigado por compartilhar seu e-mail! Nossa equipe entrará em contato com você o mais rápido possível. Agradecemos a sua paciência.');
      awaitingEmail.delete(chatId);
    } else if (awaitingEmail.has(chatId)) {
      bot.sendMessage(chatId, 'Por favor, compartilhe seu e-mail para que possamos entrar em contato. Garantimos a confidencialidade dos seus dados.');
    } else {
      bot.sendMessage(chatId, 'No momento, nossa equipe está indisponível. Nosso horário de funcionamento é das 09:00 às 18:00. Por favor, compartilhe seu e-mail para que possamos entrar em contato no futuro. Agradecemos a sua compreensão.');
      awaitingEmail.add(chatId);
    }
  }
});

async function saveEmail(email) {
  try {
    await prisma.emailContato.create({
      data: {
        email: email,
      },
    });
    console.log('E-mail salvo com sucesso! Estamos ansiosos para entrar em contato com você.');
  } catch (error) {
    console.error('Infelizmente, encontramos um erro ao salvar o e-mail:', error);
  }
}
