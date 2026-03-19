import {VideoIcon} from "lucide-react"

function CallButton({handleVideoCall}) {
  return (
    <button className='btn btn-success btn-sm text-white' onClick={handleVideoCall}>
        <VideoIcon className='size-6' />
    </button>
  )
}

export default CallButton
