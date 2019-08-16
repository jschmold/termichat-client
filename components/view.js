const { screen, list } = require('blessed');
const { BehaviorSubject } = require('rxjs');
const { MessagesAreaComponent } = require('./message-area');
const { InputAreaComponent } = require('./input-area')
const { ChannelListComponent } = require('./channel-list');

module.exports.View = class {

  get channels$() {
    return this._channelSubject.asObservable();
  }
  _channelSubject = new BehaviorSubject([]);

  get activeChannel$ () {
    return this.activeChannelSubject.asObservable();
  }
  activeChannelSubject = new BehaviorSubject(null);

  get events$() {
    return this._eventSubject.asObservable();
  }
  _eventSubject = new BehaviorSubject('init');

  constructor() {
    this.screen = screen({ smartCSR: true })
    this.channelArea = new ChannelListComponent(this.channels$);
    this.messagesArea = new MessagesAreaComponent(this.activeChannel$);
    this.inputArea = new InputAreaComponent(this.activeChannel$);

    this.screen.append(this.messagesArea.component)
    this.screen.append(this.inputArea.component);
    this.screen.append(this.channelArea.component);

    this.inputArea.events$.subscribe(this.onInputEvent.bind(this));
    this.channelArea.events$.subscribe(this.onChannelEvent.bind(this));

    this.screen.key('C-c', _ => process.exit(1));

    this.inputArea.focus();
    this.screen.render();
  }

  onInputEvent(evt) {
    switch(evt) {
      case 'unfocus':
        this.channelArea.focus();
        break;

      case 'send':
        this.screen.render();
        this.inputArea.focus();
        break;
    }
  }

  onChannelEvent({ event, data }) {
    switch(event) {
      case 'unfocus':
        this.inputArea.focus();
        break;

      case 'change-channel':
        this.selectChannel(data);
        this.screen.render();
        break;

      case 'redraw':
        this.screen.render();
        break;
    }
  }

  addChannel(channel) {
    let channels = this._channelSubject.value;
    if (channels.length === 0) {
      this.activeChannelSubject.next(channel);
    }

    channels.push(channel);
    channels = channels.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });
    this._channelSubject.next(channels);

    this.screen.render();
  }

  addMessage(message) {
    this.activeChannel.messages.push(message);
    this.loadMessages(this.activeChannel);
  }

  selectChannel(channel) {
    if (channel == null) return;

    let channelIndex = this._channelSubject.value.findIndex(({id}) => channel.id === id);
    if (channelIndex < 0) {
      throw new Error(`Channel ${channel} does not exist in data`);
    }
    this.activeChannelSubject.value.active = false;
    channel.active = true;
    this.activeChannelSubject.next(channel);

    this.screen.render();
  }
}
