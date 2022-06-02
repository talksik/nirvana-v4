export default class GetTwilioAccessTokenRequest {
  constructor(public roomName: string, public roomType: 'webrtc-go' | 'p2p-group' | 'group-room') {}
}
