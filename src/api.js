const DIFFERENT_ACCOUNTS = true

export const getUpdates = (idInstance, apiTokenInstance, setChats) => {
    fetch(`https://api.green-api.com/waInstance${idInstance}/ReceiveNotification/${apiTokenInstance}`)
        .then((res) => res.json())
        .then((data) => {
            if (!data?.body) {
                return
            }
            const { typeWebhook, senderData, idMessage, messageData } = data.body

            switch (typeWebhook) {
                case 'incomingMessageReceived':
                    setChats((chats) => {
                        return updateMessagesWithChats(
                            chats,
                            senderData,
                            idMessage,
                            messageData.textMessageData.textMessage,
                            false
                        )
                    })
                    break
                case 'outgoingAPIMessageReceived':
                    setChats((chats) => {
                        return updateMessagesWithChats(
                            chats,
                            senderData,
                            idMessage,
                            messageData.extendedTextMessageData.text,
                            true
                        )
                    })
                    break
                case 'outgoingMessageReceived':
                    setChats((chats) => {
                        let x = updateMessagesWithChats(
                            chats,
                            senderData,
                            idMessage,
                            messageData.textMessageData.textMessage,
                            DIFFERENT_ACCOUNTS
                        )
                        return x
                    })
                    break
            }
            return data.receiptId
        })
        .then((receiptId) => {
            if (receiptId) {
                return fetch(
                    `https://api.green-api.com/waInstance${idInstance}/DeleteNotification/${apiTokenInstance}/${receiptId}`,
                    { method: 'DELETE' }
                )
            }
        })
        .then(() => setTimeout(() => getUpdates(idInstance, apiTokenInstance, setChats), 500))
}

const updateMessagesWithChats = (chats, senderData, idMessage, textMessage, outgoing) => {
    if (chats.every((chat) => chat.phoneNumber.slice(1) !== senderData.sender.slice(0, -5))) {
        return [
            ...chats,
            {
                id: senderData.chatId,
                phoneNumber: '+' + senderData.sender.slice(0, -5),
                messages: [
                    {
                        id: idMessage,
                        you: outgoing,
                        content: textMessage,
                    },
                ],
            },
        ]
    }
    return updateMessages(chats, senderData.sender, idMessage, textMessage, outgoing)
}

const updateMessages = (chats, sender, idMessage, textMessage, outgoing) => {
    return chats.map((chat) => {
        if (chat.phoneNumber.slice(1) === sender.slice(0, -5)) {
            return {
                ...chat,
                messages: [
                    ...chat.messages,
                    {
                        id: idMessage,
                        you: outgoing,
                        content: textMessage,
                    },
                ],
            }
        } else {
            return chat
        }
    })
}

export const sendMessage = (idInstance, apiTokenInstance, body) => {
    fetch(`https://api.green-api.com/waInstance${idInstance}/SendMessage/${apiTokenInstance}`, {
        method: 'POST',
        body: JSON.stringify(body),
    })
}
