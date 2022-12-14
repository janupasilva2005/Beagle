import { AiOutlineSend } from 'react-icons/ai'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'

import { AuthContext, authContext } from '../../../context/AuthContext'

import Styles from '../../../styles/pages/chat.module.scss'

import { MessageType } from '../../../context/ChatContext'

import { Container, ContainerTypes } from '../../../components/container'
import { Header } from '../../../components/header'
import { Button } from '../../../components/button'
import { Chats } from '../../../components/chats'
import { Input } from '../../../components/input'
import { Users } from '../../../components/users'
import { Modal } from '../../../components/modal'

import { socket } from '../../../socket/socket'
import { ChatContext, chatContext } from '../../../context/ChatContext'
import { ModalContext, modalContext } from '../../../context/ModalContext'

const PublicChatRoom = () => {
  const [message, setMessage] = useState<string>('')

  const { modal, setModal } = useContext(modalContext) as ModalContext
  const { name, room } = useContext(authContext) as AuthContext
  const { chat, setChat } = useContext(chatContext) as ChatContext

  const router = useRouter()

  const send = () => {
    if (message.length) {
      // Emitting the messages
      socket.emit('message', {
        value: message,
        from: { id: socket.id, name },
        time: new Date().toLocaleTimeString(),
        room,
      })

      // Empty the message field
      setMessage((message) => '')
    }
  }

  /**
   * Send the message if enter key got pressed
   */
  const handleKeyDown = (e: any) => {
    if (e.code === 'Enter' && e.keyCode === 13) {
      send()
    }
  }

  useEffect(() => {
    // Redirecting user back to home page if a name is not found
    if (typeof name === 'undefined' || name.length === 0) {
      router.push('/')
    }
  }, [name])

  useEffect(() => {
    /**
     * Listening and getting the sent message from the server socket,
     *  and setting it to the state
     */
    socket.on('message-back', (payload) => {
      setChat([
        ...chat,
        {
          value: payload.value,
          from: {
            id: payload.from.id,
            name: payload.from.name,
          },
          time: payload.time,
          type: MessageType.MESSAGE,
        },
      ])
    })

    socket.on('user-changed', (payload) => {
      setChat([
        ...chat,
        {
          value: payload.value,
          type: MessageType.NOTIFICATION,
        },
      ])
    })
  }, [socket, chat])

  return (
    <div>
      <Container type={ContainerTypes.CHAT}>
        {/** Setting the room name to the title */}
        <Header title={room} />

        <div>
          <Modal show={modal} handleClose={() => setModal(false)}>
            <h1>Users</h1>

            <Users />
          </Modal>
          <Button label="Users" onClick={() => setModal(true)} />
        </div>

        <div className={Styles.chats}>
          {/** Rendering the chats */}
          <Chats messages={chat} />

          <div
            style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}
          >
            <Input
              type="text"
              placeholder="Your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button label={<AiOutlineSend />} onClick={send} />
          </div>
        </div>
      </Container>
    </div>
  )
}

export default PublicChatRoom
