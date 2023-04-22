'use strict';

/**
 * Interface Controller
 */
export default class InterfaceController {

  constructor(props) {
    this.pupPage = props.pupPage;
  }

  /**
   * Opens the Chat Window
   * @param {string} chatId ID of the chat window that will be opened
   */
  async openChatWindow(chatId) {
    await this.pupPage.evaluate(async chatId => {
      let chatWid = window.Store.WidFactory.createWid(chatId);
      let chat = await window.Store.Chat.find(chatWid);
      await window.Store.Cmd.openChatAt(chat);
    }, chatId);
  }

  /**
   * Opens the Chat Drawer
   * @param {string} chatId ID of the chat drawer that will be opened
   */
  async openChatDrawer(chatId) {
    await this.pupPage.evaluate(async chatId => {
      let chat = await window.Store.Chat.get(chatId);
      await window.Store.Cmd.openDrawerMid(chat);
    }, chatId);
  }

  /**
   * Opens the Chat Search
   * @param {string} chatId ID of the chat search that will be opened
   */
  async openChatSearch(chatId) {
    await this.pupPage.evaluate(async chatId => {
      let chat = await window.Store.Chat.get(chatId);
      await window.Store.Cmd.chatSearch(chat);
    }, chatId);
  }

  /**
   * Opens or Scrolls the Chat Window to the position of the message
   * @param {string} msgId ID of the message that will be opened
   */
  async openChatScrollToMessage(msgId) {
    await this.pupPage.evaluate(async msgId => {
      let message = await window.Store.Msg.get(msgId);
      await window.Store.Cmd.chatSelectMessage(message.chat, message, true);
    }, msgId);
  }
}
