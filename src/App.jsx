import { useEffect, useState } from 'react'
import { Avatar, Box, Button, Container, Modal, TextField, Typography } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'

import './App.css'
import { getUpdates, sendMessage } from './api'

function App() {
    const [idInstance, setIdInstance] = useState('')
    const [apiTokenInstance, setApiTokenInstance] = useState('')
    const [authorized, setAuthorized] = useState(false)

    const [activeChatId, setActiveChatId] = useState('')
    const [messageToSend, setMessageToSend] = useState('')

    const [createChatModalOpen, setCreateChatModalOpen] = useState(false)
    const [phoneNumberToAdd, setPhoneNumberToAdd] = useState('')

    const [chats, setChats] = useState([])

    useEffect(() => {
        if (authorized) {
            getUpdates(idInstance, apiTokenInstance, setChats)
        }
    }, [authorized])

    const handleSubmit = (event) => {
        event.preventDefault()

        setAuthorized(true)
    }

    const handleCreateChat = (event) => {
        event.preventDefault()
        setChats((chats) => [
            ...chats,
            {
                id: phoneNumberToAdd.slice(1) + '@c.us',
                phoneNumber: phoneNumberToAdd,
                messages: [],
            },
        ])
        setCreateChatModalOpen(false)
    }

    const onChatClick = (chatId) => {
        if (chatId !== activeChatId) {
            setMessageToSend('')
            setActiveChatId(chatId)
        }
    }

    const onMessageSend = (event) => {
        event.preventDefault()

        sendMessage(idInstance, apiTokenInstance, {
            chatId: chats.find((chat) => chat.id === activeChatId).phoneNumber.slice(1) + '@c.us',
            message: messageToSend,
        })
        setMessageToSend('')
    }

    if (authorized) {
        return (
            <Container sx={{ my: 5, boxShadow: '0 6px 18px rgba(15, 15, 15, .05)' }} disableGutters>
                <Box sx={{ display: 'flex', width: '100%', height: '90vh' }}>
                    <Box sx={{ background: '#fff', flexBasis: '30%' }}>
                        <Box
                            sx={{
                                overflowY: 'auto',
                                padding: '1rem',
                                height: 'calc(100% - 2rem - 3rem)',
                                gap: 1,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {chats.length ? (
                                chats.map((chat) => (
                                    <Box
                                        key={chat.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            textAlign: 'left',
                                            gap: 1.5,
                                            background: activeChatId === chat.id ? 'rgba(0,160,130,.85)' : '#f0f2f5',
                                            color: activeChatId === chat.id ? '#fff' : '#000',
                                            p: '.75rem',
                                            borderRadius: '16px',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => onChatClick(chat.id)}
                                    >
                                        <Avatar />
                                        <Box>
                                            <Typography fontWeight='bold'>{chat.phoneNumber}</Typography>
                                            {chat.messages.length ? (
                                                <Typography>
                                                    {chat.messages[chat.messages.length - 1].content.slice(0, 25)}...
                                                </Typography>
                                            ) : (
                                                <Typography fontStyle='italic'>No messages</Typography>
                                            )}
                                        </Box>
                                    </Box>
                                ))
                            ) : (
                                <Box mt='20rem'>
                                    <Typography>No chats yet</Typography>
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ height: '2rem', p: '0.5rem', borderTop: '1px solid rgba(15, 15, 15, 0.1)' }}>
                            <Button
                                color='success'
                                variant='outlined'
                                size='small'
                                disableRipple
                                onClick={() => {
                                    setPhoneNumberToAdd('')
                                    setCreateChatModalOpen(true)
                                }}
                            >
                                Create new chat
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ background: '#f0f2f5', flexBasis: '70%' }}>
                        {activeChatId ? (
                            <Box height='100%'>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column-reverse',
                                        gap: '0.25rem',
                                        p: '1rem',
                                        height: 'calc(100% - 2rem - 3.5rem)',
                                        overflowY: 'auto',
                                        mt: '0.5rem',
                                    }}
                                >
                                    {JSON.parse(JSON.stringify(chats.find((chat) => chat.id === activeChatId)))
                                        .messages?.reverse()
                                        .map((message) => (
                                            <Box
                                                key={message.id}
                                                sx={{
                                                    background: message.you ? '#00a884' : '#fff',
                                                    color: message.you ? '#f0f2f5' : '#000',
                                                    width: 'fit-content',
                                                    maxWidth: '80%',
                                                    py: 0.75,
                                                    px: 1.5,
                                                    borderRadius: '8px',
                                                    wordBreak: 'break-all',
                                                    textAlign: 'left',
                                                    alignSelf: message.you ? 'end' : 'start',
                                                }}
                                            >
                                                {message.content}
                                            </Box>
                                        ))}
                                </Box>
                                <form onSubmit={onMessageSend}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            py: 0.5,
                                            px: 2,
                                            gap: 1,
                                            background: '#fff',
                                        }}
                                    >
                                        <TextField
                                            autoComplete='off'
                                            autoFocus
                                            size='small'
                                            variant='outlined'
                                            fullWidth
                                            value={messageToSend}
                                            onChange={(event) => setMessageToSend(event.target.value)}
                                        />
                                        <Button
                                            variant='outlined'
                                            type='submit'
                                            disableRipple
                                            sx={{ px: '1rem' }}
                                            disabled={!messageToSend}
                                        >
                                            <Typography mr='1rem'>Send</Typography>
                                            <SendIcon />
                                        </Button>
                                    </Box>
                                </form>
                            </Box>
                        ) : (
                            <Box sx={{ mt: '20rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Typography variant='h3' fontFamily='inherit'>
                                    Whats API
                                </Typography>
                                <Typography fontFamily='inherit'>Pick a chat on the left</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
                <Modal open={createChatModalOpen} onClose={() => setCreateChatModalOpen(false)}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            bgcolor: '#fff',
                            boxShadow: 8,
                            p: 3,
                        }}
                    >
                        <form onSubmit={handleCreateChat}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '300px' }}>
                                <Typography variant='h6'>Enter phone number in international format:</Typography>
                                <Typography>Example: +375251234567</Typography>
                                <TextField
                                    size='small'
                                    type='tel'
                                    required
                                    value={phoneNumberToAdd}
                                    autoComplete='off'
                                    onChange={(event) => setPhoneNumberToAdd(event.target.value)}
                                />
                                <Button type='submit' variant='contained' disableRipple disabled={!phoneNumberToAdd}>
                                    Add
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Modal>
            </Container>
        )
    } else {
        return (
            <Container
                sx={{
                    my: 5,
                    pt: '30vh',
                    height: '90vh',
                    background: '#fff',
                    boxShadow: '0 6px 18px rgba(15, 15, 15, .05)',
                }}
            >
                <form onSubmit={handleSubmit}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3,
                            background: '#f0f2f5',
                            color: '#41525d',
                            width: 'fit-content',
                            margin: '0 auto',
                            px: 5,
                            py: 3,
                        }}
                    >
                        <Typography sx={{ fontFamily: 'inherit' }} variant='h6'>
                            Enter your Instance data
                        </Typography>
                        <TextField
                            size='small'
                            sx={{ minWidth: '440px' }}
                            value={idInstance}
                            label='IdInstance'
                            required
                            variant='standard'
                            autoComplete='off'
                            onChange={(event) => setIdInstance(event.target.value)}
                        />
                        <TextField
                            size='small'
                            sx={{ minWidth: '440px' }}
                            value={apiTokenInstance}
                            label='ApiTokenInstance'
                            required
                            variant='standard'
                            autoComplete='off'
                            onChange={(event) => setApiTokenInstance(event.target.value)}
                        />
                        <Button
                            variant='contained'
                            type='submit'
                            size='large'
                            sx={{ fontFamily: 'inherit' }}
                            disabled={!idInstance || !apiTokenInstance}
                        >
                            Continue
                        </Button>
                    </Box>
                </form>
            </Container>
        )
    }
}

export default App
