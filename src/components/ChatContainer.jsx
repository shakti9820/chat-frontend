import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { sendMessageRoute, recieveMessageRoute,getData } from "../utils/APIRoutes";
import { BsCameraVideoFill, BsThreeDotsVertical } from "react-icons/bs";

export default function ChatContainer({ currentChat, socket }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);

  useEffect(async () => {
    // const data = await JSON.parse(
    //   localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    // );

    const token=localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
      if(token){
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const {data }= await axios.get(`${getData}`);


    const response = await axios.post(recieveMessageRoute, {
      from: data._id,
      to: currentChat._id,
    });
    setMessages(response.data);
  }
  else{
    localStorage.removeItem(process.env.REACT_APP_LOCALHOST_KEY)
      navigate("/login");
  }
  }, [currentChat]);

  // useEffect(() => {
  //   const getCurrentChat = async () => {
  //     if (currentChat) {
  //       await JSON.parse(
  //         localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
  //       )._id;
  //     }
  //   };
  //   getCurrentChat();
  // }, [currentChat]);

  const handleSendMsg = async (msg) => {
    // const data = await JSON.parse(
    //   localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    // );

    const token=localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
      if(token)
      {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const {data }= await axios.get(`${getData}`);

    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: data._id,
      msg,
    });
    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
    }
    else{
      localStorage.removeItem(process.env.REACT_APP_LOCALHOST_KEY)
      navigate("/login");
    }
  };
     
  // const data =async()=> await JSON.parse(
  //   localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
  // );
  useEffect(() => {
   
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
        // console.log(1 + " New messages from "+ currentChat.username);
        // console.log(msg);
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
         
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
           {/*Here we write a functionality of profile view,video call etc*/}
        <div className="topleft">
        <div ><BsCameraVideoFill/></div>
        <div><BsThreeDotsVertical/></div>
        </div>
     
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content ">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  background-color:#dee8a7;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      // .avatar {
      //   img {
      //     height: 3rem;
      //   }
      // }
      .username {
        h3 {
          color: black;
        }
      }
    }
  }
  .topleft{
    // border: 2px solid red;
    width: 10%;
    // font-size: 10%
    display: flex;
    justify-content:space-around;
   }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    // background-color: white;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      
      
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: black;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
   
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
