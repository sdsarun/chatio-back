export enum ChatEvent {
  MatchingStranger = 'chat:matching-stranger',
  SkipStranger = 'chat:skip-stranger',
  MatchedStranger = 'chat:matched-stranger',
  StrangerEndedChat = 'chat:stranger-ended-chat',
  GetConversationStatus = 'chat:get-conversation-status',
  GetMessages = 'chat:get-messages',
  SendMessage = 'chat:send-message'
}
