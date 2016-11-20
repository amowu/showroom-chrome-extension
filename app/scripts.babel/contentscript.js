'use strict'

console.log('\'Allo \'Allo! Content script')

const FLASH_ID = 'ShowRoomLive'
const roomUrlKey = window.location.pathname.split('/')[1]
const requestUrl = `https://www.showroom-live.com/api/room/status?room_url_key=${roomUrlKey}&=${Date.now()}`

fetch(requestUrl)
  .then(response => {
    if (response.ok) {
      return response.json()
    } else {
      const {
        status,
        statusText,
        url
      } = response

      return Promise.reject(new Error(`${url} ${status} ${statusText}`))
    }
  })
  .then(json => {
    const {
      streaming_url_hls: streamingUrlHls
    } = json

    const flash = document.getElementById(FLASH_ID)
    const video = document.createElement('video')

    video.setAttribute('width', '100%')
    video.setAttribute('height', '100%')
    video.setAttribute('controls', '')

    flash.parentNode.replaceChild(video, flash)

    const hls = new Hls();
    
    hls.loadSource(streamingUrlHls)
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play()
    })
    hls.on(Hls.Events.ERROR, (event, data) => {
      console.log(`${data.type} ${data.details}`)
    })
  })
  .catch(error => {
    console.log(error.message)
  })
