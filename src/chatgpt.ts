import { ChatGPTAPI } from 'chatgpt';
import config from './config.js';
import { retryRequest } from './utils.js';
import * as dotenv from "dotenv";
dotenv.config();

let configFile: any = {};
configFile={key:process.env.CHAT_GPT_API_KEY};
let chatGPT: any = {};
let chatOption = {};
export function initChatGPT() {
  chatGPT = new ChatGPTAPI({
    apiKey: configFile.key,
    // completionParams: {
    //   model: 'text-chat-davinci-002-sh-alpha-aoruigiofdj83',
    // },
  });
}
dotenv.config();

async function getChatGPTReply(content, contactId) {
  const { conversationId, text, id } = await chatGPT.sendMessage(
    content,
    chatOption[contactId]
  );
  chatOption = {
    [contactId]: {
      conversationId,
      parentMessageId: id,
    },
  };
  console.log('response: ', conversationId, text);
  // response is a markdown-formatted string
  return text;
}

export async function replyMessage(contact, content) {
  const { id: contactId } = contact;
  try {
    if (
      content.trim().toLocaleLowerCase() === config.resetKey.toLocaleLowerCase()
    ) {
      chatOption = {
        ...chatOption,
        [contactId]: {},
      };
      await contact.say('Previous conversation has been reset.');
      return;
    }
    const message = await retryRequest(
      () => getChatGPTReply(content, contactId),
      config.retryTimes,
      500
    );

    if (
      (contact.topic && contact?.topic() && config.groupReplyMode) ||
      (!contact.topic && config.privateReplyMode)
    ) {
      const result = content + '\n-----------\n' + message;
      await contact.say(result);
      return;
    } else {
      await contact.say(message);
    }
  } catch (e: any) {
    console.error(e);
    if (e.message.includes('timed out')) {
      await contact.say(
        content +
          '\n-----------\nERROR: Please try again, ChatGPT timed out for waiting response.'
      );
    }
  }
}
