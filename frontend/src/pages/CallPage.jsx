      import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useAuthUser from '../hooks/useAuthUser';
import { useQuery } from '@tanstack/react-query';
import { getStreamToken } from '../lib/api';

import { StreamVideo, StreamVideoClient, StreamCall, CallControls, SpeakerLayout, StreamTheme, CallingState, useCallStateHooks } from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import toast from 'react-hot-toast';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;
const getStreamImage = (image) =>
  typeof image === "string" && /^https?:\/\//i.test(image) ? image : undefined;

const CallPage = () => {
  const { id:callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser } = useAuthUser();

  const {data: tokenData} = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser
  })

  useEffect(() => {
    let videoClient;
    let callInstance;

    const initCall = async ()=>{
      if(!tokenData?.token || !authUser || !callId) return;

      try{
        console.log("Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: getStreamImage(authUser.profilePic)
        }

        videoClient = new StreamVideoClient({
          apiKey: apiKey,
          user: user,
          token: tokenData.token
        });

        callInstance = videoClient.call("default", callId);

        await callInstance.join({create:true});

        console.log("Joined call successfully!");

        setClient(videoClient);
        setCall(callInstance);

      }catch(error){
        console.error("Error initializing Stream video client:", error);
        toast.error(error?.message || "Failed to join the call. Please try again.")
      }finally{
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      if (callInstance) {
        callInstance.leave().catch(() => {});
      }

      if (videoClient) {
        videoClient.disconnectUser().catch(() => {});
      }
    };
  },[tokenData, authUser, callId])


  return (
    <div className='h-screen flex flex-col items-center justify-center'>

      <div className='relative'>
        {isConnecting ? (
          <div className='flex items-center justify-center h-full'>
            <p>Joining call...</p>
          </div>
        ) : client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className='flex items-center justify-center h-full'>
            <p>Could not Initialize call. Please refresh or try again later.</p>
          </div>
        )}

      </div>
      
    </div>
  )
}

const CallContent = () => {
  const {useCallCallingState} = useCallStateHooks()
  const callingState = useCallCallingState()
  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
    }
  }, [callingState, navigate]);


  return (
    <StreamTheme>
    <SpeakerLayout />
    <CallControls />
    </StreamTheme>

  )
}

export default CallPage
